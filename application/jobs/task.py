from application.jobs.workers import celery
from datetime import datetime,timedelta
from celery.schedules import crontab
from jinja2 import Template
from application.jobs.email import send_email
from application.data.models import User, db, Product, Order, Section
import os,csv,zipfile,random


# --------------------------------periodic task---------------------------------------#
@celery.on_after_finalize.connect
def set_up_daily_task(sender, **kwargs):
   sender.add_periodic_task(crontab(hour=21, minute=10),send_daily_email.s(),name="send_email_task")

# --------------------------------------------------------------------------------------------------------------------#
@celery.on_after_finalize.connect
def set_up_monthly_task(sender, **kwargs):
   sender.add_periodic_task(crontab(day_of_month='5', hour=21, minute=10),send_monthly_email.s(),name="send_monthly_email")


@celery.task
def send_daily_email():
    users=User.query.all()
    
    for user in users:
        last_order = Order.query.filter_by(user_id=user.id).order_by(Order.order_id.desc()).first()
        if last_order:
           last_order_date = last_order.order_date
        else:
           last_order_date = datetime.utcnow() - timedelta(days=1)
        
        if (datetime.utcnow() - last_order_date).days >= 0:
           with open("templates/daily_email.html") as f:
               template = Template(f.read())
               message = template.render(username=user.username)
               send_email(user.email, "Daily Email", message)

    return True

# ----------------------------------------------------------------------------------------#

@celery.task
def send_monthly_email():
    users=User.query.all()
    
    for user in users:
       orders = Order.query.filter_by(user_id=user.id).all()
       with open("templates/monthly_email.html") as f:
            template = Template(f.read())
            message = template.render(username=user.username,orders=orders,month=datetime.utcnow().strftime("%B"))
            send_email(user.email, "Monthly Email", message)

    return "Monthly Email Sent"
# ----------------------------------------------------------------------------------------#
@celery.task
def export_report(section_id, to):
    section_name = Section.query.filter_by(section_id=section_id).first().section_name
    products = Product.query.filter_by(section_name=section_name).all()
    filename = f"{section_name}.csv"
    with open(filename, "w") as f:
        writer = csv.writer(f)
        writer.writerow(["Product ID","Product Name", "Quantity", "Price"])
        for product in products:
            writer.writerow([product.p_id,product.product_name, product.quantity, product.price])

    with zipfile.ZipFile(f"{section_name}.zip", "w") as zip:
        zip.write(filename)

    with open("templates/export_mail.html") as f:
        template = Template(f.read())
        message = template.render(section_name=section_name)
        send_email(to, "Report", message, f"{section_name}.zip")
    os.remove(filename)
    os.remove(f"{section_name}.zip")
    return "Report Sent"
    
# ----------------------------------------------------------------------------------------#