# In base/tasks.py
from celery import shared_task
from django.utils import timezone
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from .models import User


@shared_task
def send_email_task(recipient_list, template_name, context):
    """
    Task to send an email asynchronously.

    Args:
    - subject: Subject of the email.
    - recipient_list: List of recipient email addresses.
    - template_name: The email template to use.
    - context: Context data to render the template.
    """

    print("send email...")
    # Render the email content
    message = render_to_string(template_name, context)
    subject = "Welcome to Our Property Management System"
    # Send the email
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,  # Set this in your settings.py
        recipient_list,
        fail_silently=False,
    )


@shared_task
def send_password_reset_email(recipient_list,html_message):
    try:
        subject = "Password Reset"
        # Send the email
        send_mail(
            subject,
            html_message,
            settings.DEFAULT_FROM_EMAIL,  # Set this in your settings.py
            recipient_list,
            fail_silently=False,
        )
        print("Password reset email sent successfully.")
    except User.DoesNotExist:
        print("User does not exist.")
    except Exception as e:
        print(f"Error sending email: {e}")
        
        
        
@shared_task
def generate_monthly_bills():
    from .models import User, TenantProfile, Notification  # Move import here

    # Your logic to generate monthly bills

    print("Generating monthly bills now...")
    tenants = TenantProfile.objects.all()
    for tenant in tenants:
        # if tenant.last_billed_date is None or tenant.last_billed_date.month != timezone.now().month:
        # Calculate total due
        rent_due = tenant.current_property.rent_price
        total_due = rent_due + tenant.billed_amount

        # Update billed amount
        tenant.billed_amount = total_due
        tenant.billed_amount = (
            total_due  # Start with current due as arrears if not paid
        )
        tenant.last_billed_date = timezone.now()
        tenant.save()
        print("Updated Successfully")

        # Create a notification for the tenant
        notification_title = "Monthly Rent Reminder"
        notification_message = (
            f"Hello {tenant.user.first_name},\n"
            f"This is a reminder that your rent of KES {total_due} is due.\n"
            f"Please make your payment on time to avoid any late fees.\n"
            f"Thank you!"
        )
        admin_user = User.objects.filter(user_type="admin").first()

        Notification.objects.create(
            title=notification_title,
            message=notification_message,
            sender=admin_user,
            recipient=tenant.user,
            notification_type="Reminder",
        )
