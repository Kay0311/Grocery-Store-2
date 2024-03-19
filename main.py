import os
from flask import Flask
from flask_restful import Api
from flask_security import Security, SQLAlchemySessionUserDatastore
from application.config import LocalDevelopmentConfig
from application.data.models import db
from application.data.models import User, Role
from flask_jwt_extended import JWTManager
from flask_caching import Cache
from application.jobs import workers

app = None
api = None
celery = None
cache = None

def create_app():
    app = Flask(__name__, template_folder="templates")
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    app.app_context().push()
    api = Api(app)
    app.app_context().push()

    jwt = JWTManager(app)
    datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    with app.app_context():
        db.create_all()
        if Role.query.filter_by(name='admin').first() is None:
            role1=Role(name='admin',description='administer')
        if Role.query.filter_by(name='manager').first() is None:
            role2=Role(name='manager',description='store manager')
        if Role.query.filter_by(name='user').first() is None:
            role3=Role(name='user',description='user')
            db.session.add_all([role1,role2,role3])
            db.session.commit()
    celery=workers.celery
    celery.conf.update(
        broker_url = app.config["CELERY_BROKER_URL"],
        result_backend = app.config["CELERY_RESULT_BACKEND"],
        timezone="Asia/Kolkata",
        broker_connection_retry_on_startup = True
    )

    celery.Task=workers.ContextTask
    app.app_context().push()
    cache=Cache(app)
    app.app_context().push()

    return app, api, celery, cache


app, api,celery,cache= create_app()




from application.controller.controllers import *

from application.controller.api import UserAPI
api.add_resource(UserAPI, '/api/user','/api/user/<int:id>')

from application.controller.api import SectionAPI
api.add_resource(SectionAPI, '/api/section','/api/section/<int:id>')

from application.controller.api import ProductAPI
api.add_resource(ProductAPI, '/user/products','/api/product/<int:p_id>', '/api/product')

from application.controller.api import SectionRequestAPI
api.add_resource(SectionRequestAPI, '/api/sectionrequest','/api/sectionrequest/<int:id>')

# from application.controller.api import CartAPI
# api.add_resource(CartAPI, '/api/cart','/api/cart/<int:id>')


if __name__ == "__main__":
    app.run(debug=True)
   
