from flask_restful import Resource, reqparse, fields, marshal_with
from flask import current_app as app,jsonify
from application.data.models import User, Role,db, Section, Product, Productcreated, SectionRequest, Cart, Order
from application.utils.validation import NotFoundError, NotGivenError
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import get_jwt_identity,jwt_required

admin_fields = {
    "admin_id": fields.Integer,
    "admin_name": fields.String,
    "email_address": fields.String,
    "password": fields.String,
}
user_fields = {
    "id": fields.Integer,
    "user_name": fields.String,
    "email_address": fields.String,
    "password": fields.String,
}
section_fields = {
    "section_id": fields.Integer,
    "section_name": fields.String,
    "category": fields.String,
}
product_fields = {
    "p_id": fields.Integer,
    "product_name": fields.String,
    "manufacturingdate": fields.DateTime,
    "expirydate": fields.DateTime,
    "price": fields.Integer,
    "unit": fields.Integer,
    "quantity": fields.Integer,
}
sectioncreated_fields = {
    "screate_id": fields.Integer,
    "create_admin_id": fields.Integer,
    "csection_id": fields.Integer,  
}
productcreated_fields = {
    "pc_id": fields.Integer,
    "sproduct_id": fields.Integer,
    "csection_id": fields.Integer,  
}
order_fields = {
    "oder_id": fields.Integer,
    "user_id": fields.Integer,
    "order_date": fields.DateTime,
    "product_names": fields.String,
    "total_amount": fields.Integer,
}
cart_fields = {
    "cart_id": fields.Integer,
    "user_id": fields.Integer,
    "product_id": fields.Integer,
    "quantity": fields.Integer,
}
summary_fields = {
    "product_name": fields.String,
    "total_sales": fields.Integer,
    "total_revenue": fields.Integer,
}
#--------------------------------------------------------------------------------------------
def user_data(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'roles': user.roles[0].name if user.roles else None
    }
def section_data(section):
    return {
        "section_id": section.section_id,
        "section_name": section.section_name,
    }
def product_data(product):
    return {
        "p_id": product.p_id,
        "product_name": product.product_name,
        "section_name": product.section_name,
        "manufacturingdate": product.manufacturingdate,
        "expirydate": product.expirydate,
        "price": product.price,
        "unit": product.unit,
        "quantity": product.quantity,
    }

def cart_data(cart):
    return {
        "cart_id": cart.cart_id,
        "user_id": cart.user_id,
        "product_id": cart.product_id,
        "quantity": cart.quantity,
    }

def order_data(order):
    return {
        "oder_id": order.order_id,
        "user_id": order.user_id,
        "order_date": order.order_date,
        "product_names": order.product_names,
        "total_amount": order.total_amount,
    }

def product_summary(product_summary):
    return {
        "product_name": product_summary.product_name,
        "total_sales": product_summary.total_sales,
        "total_revenue": product_summary.total_revenue,
    }
#--------------------------------------------------------------------------------
user_parser = reqparse.RequestParser()
user_parser.add_argument('username', type=str, required=True, help='Username is required')
user_parser.add_argument('email', type=str, required=True, help='Email is required')
user_parser.add_argument('password', type=str, required=True, help='Password is required')
#---------------------------------------------------------------------------Section 
section_parse = reqparse.RequestParser()
section_parse.add_argument("section_name")
section_parse.add_argument("category")
#-------------------------------------------------------------------Product        
product_parse = reqparse.RequestParser()
product_parse.add_argument("product_name")
product_parse.add_argument("manufacturingdate")
product_parse.add_argument("expirydate")
product_parse.add_argument("price")
product_parse.add_argument("unit")
product_parse.add_argument("quantity")
product_parse.add_argument("section_name")
#--------------------------------------------------------------------------------------------
order_parse = reqparse.RequestParser()
order_parse.add_argument("order_date")
order_parse.add_argument("product_names")
order_parse.add_argument("total_amount")

#------------------------------------------------------------------------------------------

section_request_parse = reqparse.RequestParser()
section_request_parse.add_argument("section_name")
section_request_parse.add_argument("new_section_name")
section_request_parse.add_argument("request_description")
section_request_parse.add_argument("request_status")

#------------------------------------------------------------------------------------------


class UserAPI(Resource):
    
    @jwt_required()
    def get(self):
        user_id=get_jwt_identity()
        user=User.query.filter_by(id=user_id).first()
        user=user_data(user)
        return user
    
    def post(self):
        args = user_parser.parse_args()
        username = args.get('username',None)
        email = args.get('email',None)
        password = args.get('password',None)
        if not username:
            raise NotGivenError(400, 'Username not given')
        if not email:
            raise NotGivenError(400, 'Email not given')
        if not password:
            raise NotGivenError(400, 'Password not given')
        
        user = User.query.filter_by(username=username).first()
        if user:
            raise NotGivenError(400, 'Username already exists')

        with app.app_context():
            datastore = app.security.datastore
            if not datastore.find_user(email=email) and not datastore.find_user(username=username):
                datastore.create_user(username=username, email=email, password=generate_password_hash(password))
                db.session.commit()
                user=datastore.find_user(email=email)
                role=datastore.find_role("user")
                datastore.add_role_to_user(user,role)
                db.session.commit()
                return {'message': 'User created successfully'},201

    def put(self, user_id):
        args = user_parser.parse_args()
        username = args.get('username', None)
        email = args.get('email', None)
        password = args.get('password', None)

        if not username or not email or not password:
            raise NotGivenError(400, 'Username, email, and password are required')

        user = User.query.get(user_id)
        if not user:
            raise NotFoundError(404, 'User not found')

        existing_user = User.query.filter(User.id != user_id).filter_by(username=username).first()
        if existing_user:
            raise NotGivenError(400, 'Username already exists')

        # Update user information
        user.username = username
        user.email_address = email
        user.password =generate_password_hash(password)

        db.session.commit()
        return {'message': 'User information updated successfully'}, 200
#----------------------------------------------------------------------------------
class SectionAPI(Resource):

   
    def get(self):
        sec=Section.query.all()

        if sec:
            return jsonify([section_data(i) for i in sec])
        else:
            return jsonify([])
          
    def put(self,id):
        sec=Section.query.filter_by(section_id=id).first()

        if sec is None:
            raise NotFoundError(status_code=404)
        
        args =section_parse.parse_args()
        section_name = args.get("section_name", None)

        if section_name is None:
            raise NotGivenError(status_code=400, error_code="SECTION001", error_message="Section Name is required")
        
       
        sec.section_name=section_name
        db.session.commit()
        return section_data(sec)
        
     
    def post(self):
        args =section_parse.parse_args()
        section_name = args.get("section_name", None)
    

        if section_name is None:
            raise NotGivenError(status_code=400, error_code="SECTION001", error_message="Section Name is required")
        
        
        sec=Section(section_name=section_name)
        db.session.add(sec)
        db.session.commit()
        return section_data(sec),201
        

    def delete(self,id):
        sec=Section.query.filter_by(section_id=id).first()

        if sec is None:
            raise NotFoundError(status_code=404)
        product=Product.query.filter_by(section_name=sec.section_name).all()
        if product!=[]:
            for i in product:
                prodcred=Productcreated.query.filter_by(sproduct_id=i.p_id).all()
                for j in prodcred:
                    db.session.delete(j)
                db.session.delete(i)
        db.session.delete(sec)
        db.session.commit()
        return 200
        
#---------------------------------------------------------------------------------------------------------------
# class SummaryAPI(Resource):
    
#     def get(self):
#         id=get_jwt_identity()
        
#         user = User.query.filter_by(id=id).first()

#         products = user.products
#         product_list = []

#         for product in products:
#             total_sales = Sale.query.filter_by(product_id=product.product_id).count()
#             total_revenue = Sale.query.filter_by(product_id=product.product_id).sum(Sale.price)

#             product_summary = {
#                 "product_name": product.product_name,
#                 "total_orders": total_sales,
#                 "total_revenue": total_revenue,
#             }

#             product_list.append(product_summary)

#         return jsonify([product_summary(summary) for summary in product_list])            
#-------------------------------------------------------------------------------------------------
class ProfileAPI(Resource):
    @jwt_required()
    def get(self):
        id=get_jwt_identity()
        user=User.query.filter_by(id=id).first()
        if user:
            return jsonify(user_data(user))
        else:
            raise NotFoundError(status_code=404)    
#-------------------------------------------------------------------------------------------------    
class ProductAPI(Resource):

    @jwt_required()
    def get(self):
        id=get_jwt_identity()
        user=User.query.filter_by(id=id).first()
        prod=user.products

        if prod:
            return jsonify([product_data(i) for i in prod])
        else:
            raise NotFoundError(status_code=404)
   
    
    def put(self, p_id):
       
        prod = Product.query.filter(Product.p_id == p_id).first()

        if prod is None:
            raise NotFoundError(status_code=404)
        
       
        args =product_parse.parse_args()
        product_name = args.get("product_name", None)
        price = args.get("price", None)
        unit = args.get("unit", None)
        mdate = args.get("manufacturingdate", None)
        edate = args.get("expirydate", None)
        quantity = args.get("quantity", None)
        section_name = args.get("section_name", None)
        if mdate is None:
            m_value = prod.manufacturingdate
        if edate is None:
            e_value = prod.expirydate
        if mdate is not None:
            m_value = datetime.strptime(mdate, '%Y-%m-%dT%H:%M')
        if edate is not None:
            e_value = datetime.strptime(edate, '%Y-%m-%dT%H:%M')

        if product_name is None:
            raise NotGivenError(status_code=400, error_code="PROD001", error_message="Product Name is required")
        
        if price is None:
            raise NotGivenError(status_code=400, error_code="PROD004", error_message="price is required")
        
        if unit is None:
            raise NotGivenError(status_code=400, error_code="PROD005", error_message="unit is required")
        
        if quantity is None:
            raise NotGivenError(status_code=400, error_code="PROD006", error_message="quantity is required")
        if section_name is None:
            raise NotGivenError(status_code=400, error_code="PROD007", error_message="section name is required")
        else:
            prod.product_name = product_name
            prod.manufacturingdate = m_value
            prod.expirydate = e_value
            prod.section_name = section_name
            prod.price = price
            prod.unit = unit
            prod.quantity = int(quantity)
            db.session.commit()
            return jsonify(product_data(prod))
        

    
    def delete(self, p_id):
        
        prod = Product.query.filter(Product.p_id == p_id).scalar()
        pro = Productcreated.query.filter_by(sproduct_id=p_id).scalar()


        if prod is None or pro is None:
            raise NotFoundError(status_code=404)

        try:
            db.session.delete(prod)
            db.session.delete(pro)
            db.session.commit()
            return "successfully deleted", 200
        except Exception as e:
            db.session.rollback()
            return f"Error deleting product: {str(e)}", 500

    @jwt_required() 
    def post(self):
        user_id=get_jwt_identity()
        args =product_parse.parse_args()
        product_name = args.get("product_name", None)
        mdate = args.get("manufacturingdate", None)
        edate = args.get("expirydate", None)
        price = args.get("price", None)
        unit = args.get("unit", None)
        quantity = args.get("quantity", None)
        section_name = args.get("section_name", None)
        
        if product_name is None:
            raise NotGivenError(status_code=400, error_code="PROD001", error_message="Product Name is required")
        
        
        if mdate is None:
            raise NotGivenError(status_code=400, error_code="PROD002", error_message="manufacturing date is required")
        
        if edate is None:
            raise NotGivenError(status_code=400, error_code="PROD003", error_message="expiry date is required")
        
        if price is None:
            raise jsonify({'error':'price is required'})
        
        if unit is None:
            raise jsonify({'error':'unit is required'})
        
        if quantity is None:
            raise jsonify({'error':'quantity is required'})
        
        if section_name is None:
            raise jsonify({'error':'section name is required'})
        
        producct=Product.query.filter_by(product_name=product_name).first()
        if producct:
            raise jsonify({'error':'product already exists'})
        
        m_value = datetime.strptime(mdate, '%Y-%m-%dT%H:%M')
        e_value = datetime.strptime(edate, '%Y-%m-%dT%H:%M')

        product = Product(
            product_name=product_name,
            manufacturingdate=m_value,
            expirydate=e_value,
            price=price,
            unit=unit,
            quantity=quantity,
            section_name=section_name,
        )

        db.session.add(product)
        db.session.commit()

        proc = Productcreated(sproduct_id=product.p_id, manager_id=user_id)
        db.session.add(proc)
        db.session.commit()

        return 200      
    @jwt_required()
    def get_all_products(self):
        products = Product.query.all()
        return jsonify([product_data(product) for product in products])

def sectionrequest_data(sec):
    return {
        "request_id": sec.request_id,
        "section_name": sec.section_name,
        "new_section_name": sec.new_section_name,
        "user_id": sec.user_id,
        "request_status": sec.request_status,
        "request_description": sec.request_description,
    }

class SectionRequestAPI(Resource):
    def get(self):
        sec=SectionRequest.query.all()

        if sec:
            return jsonify([sectionrequest_data(i) for i in sec])
        else:
            return jsonify([])
          
    def put(self,id):
        sec=SectionRequest.query.filter_by(request_id=id).first()

        if sec is None:
            raise NotFoundError(status_code=404)
        
        args =section_request_parse.parse_args()
        section_name = args.get("section_name", None)
        new_section_name = args.get("new_section_name", None)
        request_description = args.get("request_description", None)
        request_status = args.get("request_status", None)
        print(args)
        if section_name is None:
            raise NotGivenError(status_code=400, error_code="SECTION001", error_message="Section Name is required")
        
        if request_description == "new section" and request_status == "True":
            section=Section.query.filter_by(section_name=section_name).first()
            if section:
                raise NotGivenError(status_code=400, error_code="SECTION002", error_message="section already exists")
            sect=Section(section_name=section_name)
            db.session.add(sect)
            db.session.commit()
            db.session.delete(sec)
            db.session.commit()
       
            return jsonify({"message":"section created"})
        if request_description == "new section" and request_status == "False":
            db.session.delete(sec)
            db.session.commit()
       
            return jsonify({"message":"section request rejected"})
        if request_description == "update section" and request_status == "True":
            if new_section_name is None:
                raise NotGivenError(status_code=400, error_code="SECTION002", error_message="new section name is required")
            section=Section.query.filter_by(section_name=new_section_name).first()
            if section:
                raise NotGivenError(status_code=400, error_code="SECTION002", error_message="section already exists")
            sect=Section.query.filter_by(section_name=section_name).first()
            sect.section_name=new_section_name
            db.session.commit()
            db.session.delete(sec)
            db.session.commit()
       
            return jsonify({"message":"section updated"})
        if request_description == "update section" and request_status == "False":
            db.session.delete(sec)
            db.session.commit()
       
            return jsonify({"message":"section request rejected"})
        if request_description == "delete section" and request_status == "True":
            sect=Section.query.filter_by(section_name=section_name).first()
            db.session.delete(sect)
            db.session.commit()
            db.session.delete(sec)
            db.session.commit()
       
            return jsonify({"message":"section deleted"})
        if request_description == "delete section" and request_status == "False":
            db.session.delete(sec)
            db.session.commit()
       
            return jsonify({"message":"section request rejected"})
        
        return jsonify({"message":"something went wrong"})

        
    @jwt_required()
    def post(self):
        args =section_request_parse.parse_args()
        user_id=get_jwt_identity()
        section_name=args.get("section_name",None)
        new_section_name=args.get("new_section_name",None)
        request_description=args.get("request_description",None)
        if request_description=="new section":
            if Section.query.filter_by(section_name=section_name).first():
                raise NotGivenError(status_code=400, error_code="SECTION002", error_message="section already exists")
            section=SectionRequest(section_name=section_name,user_id=user_id,request_status=False,request_description=request_description)
            db.session.add(section)
            db.session.commit()
        if request_description=="update section":
            if new_section_name is None:
                raise NotGivenError(status_code=400, error_code="SECTION002", error_message="new section name is required")
            section=SectionRequest(section_name=section_name,new_section_name=new_section_name,user_id=user_id,request_status=False,request_description=request_description)
            db.session.add(section)
            db.session.commit()

        if request_description=="delete section":
            section=SectionRequest(section_name=section_name,user_id=user_id,request_status=False,request_description=request_description)
            db.session.add(section)
            db.session.commit()

        return jsonify({"message":"section request created"})
        

    def delete(self,id):
        sec=SectionRequest.query.filter_by(request_id=id).first()

        if sec is None:
            raise NotFoundError(status_code=404)
        else:
            SectionRequest.query.filter_by(request_id=id).delete()
            db.session.commit()
            return 200
        

cart_parse = reqparse.RequestParser()
cart_parse.add_argument("user_id")
cart_parse.add_argument("product_id")
cart_parse.add_argument("quantity")


class CartAPI(Resource):

    def get(self):
        args =cart_parse.parse_args()
        user_id=args.get("user_id",None)
        product_id=args.get("product_id",None)
        if user_id is None:
            raise NotGivenError(status_code=400, error_code="CART001", error_message="user id is required")
        if product_id is None:
            raise NotGivenError(status_code=400, error_code="CART002", error_message="product id is required")
        cart=Cart.query.filter_by(user_id=user_id,product_id=product_id).first()
        if cart:
            return jsonify(cart_data(cart))
        else:
            raise NotFoundError(status_code=404)