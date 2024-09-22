from celery import shared_task
from django.utils import timezone
from .models import TenantProfile


@shared_task(time_limit=60, soft_time_limit=50,queue='default')  # Soft limit of 50 seconds
def generate_monthly_bills():
    # Get current date for month and year
    
    print("Generating bills...")
    current_date = timezone.now()
    
    # Fetch all tenants who have an active property
    tenants = TenantProfile.objects.filter(current_property__isnull=False)
    print(tenants)
    # for tenant in tenants:
    #     rent_price = tenant.current_property.rent_price
    #     outstanding_balance = tenant.billed_amount - tenant.paid_amount
        
    #     # Calculate new billed amount
    #     tenant.billed_amount = outstanding_balance + rent_price
    #     tenant.save()
    
    # print(f"Bills generated for {tenants.count()} tenants for {current_date.strftime('%B %Y')}")
    #return f"Bills generated for {tenants.count()} tenants for {current_date.strftime('%B %Y')}"
