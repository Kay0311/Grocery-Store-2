from flask import current_app as app
from flask import render_template,redirect,url_for,request,jsonify
from application.data.models import db,ManagerRequest,User,Role, Section,SectionRequest,Rolesusers,Product,Cart,Order
from flask_security import auth_required,roles_required,current_user
from application.utils.validation import NotFoundError,NotGivenError
from werkzeug.security import generate_password_hash,check_password_hash
from flask_jwt_extended import create_access_token,jwt_required,get_jwt_identity
from application.jobs.task import export_report
from main import cache

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/register/manager",methods=["POST"])
@jwt_required()
def register_manager():
    user_id=get_jwt_identity()
    if ManagerRequest.query.filter_by(user_id=user_id).first():
        return jsonify({"message":"request already sent"})
    creq=ManagerRequest(user_id=user_id,request_status="pending")
    db.session.add(creq)
    db.session.commit()
    return jsonify({"message":"request sent"})


@app.route("/manager/requests",methods=["GET"])
@jwt_required()
def manager_requests():
    user_id=get_jwt_identity()
    admin=User.query.filter_by(id=user_id).first()
    if not admin.roles[0].name=="admin":
        return jsonify({"message":"not authorized"})
    requests=ManagerRequest.query.filter_by(request_status="pending").all()
    if not requests:
        return jsonify({"message":"no requests"})
    return jsonify([{"username": User.query.filter_by(id=request.user_id).first().username,"user_id":request.user_id,"request_id":request.request_id} for request in requests])


@app.route("/accept/manager/<id>",methods=["POST"])
@jwt_required()
def accept_manager(id):
    user_id=get_jwt_identity()
    admin=User.query.filter_by(id=user_id).first()
    if not admin.roles[0].name=="admin":
        return jsonify({"message":"not authorized"})
    if not ManagerRequest.query.filter_by(user_id=id).first():
        return jsonify({"message":"request not available"})
    manager=ManagerRequest.query.filter_by(user_id=id).first()
    manager.request_status=True
    db.session.commit()
    role=Rolesusers.query.filter_by(user_id=id).first()
    role.role_id=2
    db.session.commit()
    return jsonify({"message":"request accepted"})

@app.route("/reject/manager/<id>",methods=["POST"])
@jwt_required()
def reject_manager(id):
    user_id=get_jwt_identity()
    admin=User.query.filter_by(id=user_id).first()
    if not admin.roles[0].name=="admin":
        return jsonify({"message":"not authorized"})
    if not ManagerRequest.query.filter_by(user_id=id).first():
        return jsonify({"message":"request not available"})
    manager=ManagerRequest.query.filter_by(user_id=id).first()
    db.session.delete(manager)
    db.session.commit()
    return jsonify({"message":"request rejected"})

@app.route("/userlogin",methods=["POST"])
def userlogin():
    username=request.json["username"]
    password=request.json["password"]
    user=User.query.filter_by(username=username).first()
    if user is None:
        raise NotFoundError(status_code=404)
    if check_password_hash(user.password,password):
        access_token=create_access_token(identity=user.id)
        return jsonify({"token":access_token,"role":user.roles[0].name})
    else:
        raise NotGivenError(status_code=400,error_code="UL001",error_message="wrong password")
    
@app.route("/manager/section",methods=["POST"])
@jwt_required()
def create_section():
    user_id=get_jwt_identity()
    section_name=request.json["section_name"]
    if Section.query.filter_by(section_name=section_name).first():
        return jsonify({"message":"section already exists"})
    section=SectionRequest(section_name=section_name,user_id=user_id,request_status=False,request_description="new section")
    db.session.add(section)
    db.session.commit()
    return jsonify({"message":"section request created"})

@app.route("/api/cart", methods=["GET"])
@jwt_required()
def get_cart():
    
    user_id = get_jwt_identity()

    cart_items = Cart.query.filter_by(user_id=user_id).all()

    cart_data = [
        {
            "cart_id": item.cart_id,
            "product_id": item.product_id,
            "product_name": item.product.product_name,
            "price": item.product.price,
            "unit": item.product.unit,
            "quantity": item.quantity,
    
        }
        for item in cart_items
    ]

    return jsonify(cart_data)

@app.route("/api/cart", methods=["POST"])
@jwt_required()
def add_to_cart():
    
    user_id = get_jwt_identity()
    data = request.get_json()
    product_id = data.get("product_id")
    quantity =int( data.get("quantity"))
    
    
    product = Product.query.get(product_id)
    if not product or quantity <= 0 or quantity > int(product.quantity):
        return jsonify({"message": "Invalid product or quantity"}), 400

    
    existing_cart_item = Cart.query.filter_by(user_id=user_id, product_id=product_id).first()

    if existing_cart_item:
        existing_cart_item.quantity += quantity
    else: 
        new_cart_item = Cart(user_id=user_id, product_id=product_id, quantity=quantity)
        db.session.add(new_cart_item)

    db.session.commit()

    return jsonify({"message": "Item added to cart successfully"}), 201

@app.route("/api/cart/<int:cart_id>", methods=["DELETE"])
@jwt_required()
def remove_from_cart(cart_id):
    user_id = get_jwt_identity()

    cart_item = Cart.query.get(cart_id)
    if not cart_item or cart_item.user_id != user_id:
        return jsonify({"message": "Cart item not found"}), 404
    
    db.session.delete(cart_item)
    db.session.commit()

    return jsonify({"message": "Item removed from cart successfully"})

@app.route("/userproducts")
@cache.cached(timeout=20)
def userproducts():
    products=Product.query.all()
    return jsonify([{"product_id":product.p_id,
                     "product_name":product.product_name,
                     "price":product.price,
                     "manufacturingdate":product.manufacturingdate,
                    "expirydate":product.expirydate,
                    "section_name":product.section_name,
                    "unit":product.unit,
                     "quantity":product.quantity} for product in products])

        
@app.route("/checkout",methods=["GET"])
@jwt_required()
def checkout():
    user_id=get_jwt_identity()
    cart_items = Cart.query.filter_by(user_id=user_id).all()
    total_amount=0
    product_names=""
    for item in cart_items:
        product_names=item.product.product_name
        total_amount=item.product.price*item.quantity
        order=Order(user_id=user_id,total_amount=total_amount,product_name=product_names,quantity=item.quantity,product_id=item.product_id)
        item.product.quantity-=item.quantity
        db.session.delete(item)
        db.session.add(order)
        db.session.commit()
    return jsonify({"message":"order placed"})

@app.route("/export/<id>", methods=["GET"])
@jwt_required()
def export_and_download(id):
    user_id = get_jwt_identity()
    user=User.query.filter_by(id=user_id).first()
    if not user.roles[0].name=="manager":
        return jsonify({"message":"not authorized"})
    to = user.email
    job = export_report.apply_async(args=[id, to])
    return str(job), 200