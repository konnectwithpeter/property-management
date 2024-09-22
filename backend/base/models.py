
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
from django.db.models.signals import post_save
from django.dispatch import receiver

class CustomUserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, user_type=None, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        
        # Ensure 'user_type' is included only in `extra_fields` if not already present
        extra_fields.setdefault('user_type', user_type)

        user = self.model(email=email, first_name=first_name, last_name=last_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, first_name, last_name, password=password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = (
        ('tenant', 'Tenant'),
        ('landlord', 'Landlord'),
        ('admin', 'Admin'),
    )

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'user_type']

    def __str__(self):
        return self.email




class Property(models.Model):
    landlord = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'landlord'})
    title = models.CharField(max_length=255)
    image1 = models.ImageField(upload_to='property_images/', null=True, blank=True)
    image2 = models.ImageField(upload_to='property_images/', null=True, blank=True)
    image3 = models.ImageField(upload_to='property_images/', null=True, blank=True)
    description = models.TextField()
    bathrooms = models.IntegerField(default=1)
    bedrooms = models.IntegerField(default=1)
    parking = models.IntegerField(default=1)
    address = models.CharField(max_length=255)
    rent_price = models.DecimalField(max_digits=10, decimal_places=2)
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = 'Property'
        verbose_name_plural = 'Properties'

class PropertyFile(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    file = models.FileField(upload_to='property-documents/')
    
    def __str__(self):
        return self.property.title

class TenantProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'tenant'})
    phone_number = models.CharField(max_length=15)
    current_property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, blank=True)
    moved_in = models.DateField(auto_now_add=True)
    billed_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    
    def __str__(self):
        return self.user.first_name



class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    tenant = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'tenant'})
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
@receiver(post_save, sender=Application)
def create_or_update_tenant_profile(sender, instance, **kwargs):
    # Check if the application is accepted
    if instance.status == 'accepted':
        tenant = instance.tenant
        property = instance.property

        # Create or update the TenantProfile
        tenant_profile, created = TenantProfile.objects.get_or_create(
            user=tenant,
            defaults={
                'current_property': property,
                'billed_amount': 0,
                'paid_amount': 0,
            }
        )

        if not created:
            # If TenantProfile exists, update the current property
            tenant_profile.current_property = property
            tenant_profile.save()




class Lease(models.Model):
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'tenant'})
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    rent_amount = models.DecimalField(max_digits=10, decimal_places=2)
    lease_document = models.FileField(upload_to='leases/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.property.title} - {self.tenant.username}'


class Payment(models.Model):
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'tenant'})
    lease = models.ForeignKey(Lease, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=20, choices=(('pending', 'Pending'), ('completed', 'Completed')))
    payment_gateway_reference = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f'{self.tenant.username} - {self.amount} on {self.payment_date}'


class MaintenanceRequest(models.Model):
    TYPE_CHOICES = [
        ('Plumbing', 'Plumbing'),
        ('Electrical', 'Electrical'),
        ('Structural', 'Structural'),
        ('Other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]
    tenant = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'user_type': 'tenant'})
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Other')
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    severity = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')    
    submitted_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    image1 = models.ImageField(upload_to='maintenance-requests/', null=True, blank=True)
    image2 = models.ImageField(upload_to='maintenance-requests/', null=True, blank=True)
    image3 = models.ImageField(upload_to='maintenance-requests/', null=True, blank=True)
    video = models.FileField(upload_to='maintenance-requests/', null=True, blank=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    def __str__(self):
        return f'Request by {self.tenant.first_name} - {self.property.title}'


class Notification(models.Model):
    TYPE_CHOICES = [
        ('Info', 'Info'),
        ('Warning', 'Warning'),
        ('Reminder', 'Reminder'),
    ]

    title = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField(blank=True,null=True)
    date = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    notification_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='Info')

    # Using the custom User model for sender and recipient
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_notifications')

    def __str__(self):
        return f"{self.title} - {self.recipient.first_name}"

