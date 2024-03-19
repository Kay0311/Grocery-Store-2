from datetime import datetime
from flask_security import UserMixin, RoleMixin
from wtforms import StringField
from flask_wtf import FlaskForm
from wtforms.validators import DataRequired
from wtforms import StringField,PasswordField,SubmitField 
from wtforms.validators import Length, EqualTo, Email, DataRequired, ValidationError
from sqlalchemy.orm import aliased
from sqlalchemy.ext.declarative import declarative_base
from flask_sqlalchemy import SQLAlchemy

engine = None
Base = declarative_base()
db = SQLAlchemy()
#bcrypt=Bcrypt(app)

#roles_users = db.Table('roles_users', db.Column('user_id', db.Integer(), db.ForeignKey ('user.id')), db.Column('role_id', db.Integer(), db.ForeignKey ('role.id')))
class Rolesusers(db.Model):
    __tablename__ = 'rolesusers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer, db.ForeignKey('role.id')) 

class Role(db.Model, RoleMixin):
    __tablename__ = "role"
    id = db.Column(db.Integer(), primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), unique= True)
    description = db.Column(db.String(255))

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer(),autoincrement = True, primary_key=True)
    username = db.Column(db.String(length=30), nullable=False, unique=True)
    email= db.Column(db.String(length=50), nullable=False, unique=True)
    password = db.Column(db.String(255),nullable=False)
    active = db.Column(db.Boolean(),nullable=False)  #not sure about why this is used
    fs_uniquifier =  db.Column(db.String(255), unique=True, nullable = False)
    roles = db.relationship('Role', secondary = "rolesusers", backref = db.backref('users', lazy = 'dynamic'))



class Section(db.Model):
    section_id=db.Column(db.Integer, autoincrement=True, primary_key=True)
    section_name=db.Column(db.String,nullable=False)

    
class Product(db.Model):
    p_id=db.Column(db.Integer, autoincrement=True, primary_key=True)
    product_name=db.Column(db.String,nullable=False)
    manufacturingdate=db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expirydate=db.Column(db.DateTime, nullable=False )
    price=db.Column(db.Integer,nullable=False)
    section_name=db.Column(db.String,nullable=False)
    unit=db.Column(db.String,nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0)
    productcreated=db.relationship('User', secondary='productcreated', backref=db.backref('products', lazy='dynamic'))

class Productcreated(db.Model):
    pc_id=db.Column(db.Integer, autoincrement=True, primary_key=True)
    sproduct_id=db.Column(db.Integer, db.ForeignKey("product.p_id"), nullable=False)
    manager_id=db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

class Cart(db.Model):
    cart_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.p_id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    user = db.relationship('User', backref=db.backref('cart_items', lazy=True))
    product = db.relationship('Product', backref=db.backref('carts', lazy=True))    

class Order(db.Model):
    order_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    order_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    total_amount= db.Column(db.Integer, nullable=False)
    product_name =db.Column(db.String, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    product_id = db.Column(db.Integer, nullable=False)
    user = db.relationship('User', backref=db.backref('orders', lazy=True))

class ManagerRequest(db.Model):
    request_id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    request_status = db.Column(db.String, nullable=False, default='pending')
    # user = db.relationship('User', backref=db.backref('requests', lazy=True))

class SectionRequest(db.Model):
    request_id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    section_name = db.Column(db.String, nullable=False)
    new_section_name = db.Column(db.String, nullable=True)
    request_description = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    request_status = db.Column(db.Boolean, nullable=False, default=False)

