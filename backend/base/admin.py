from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group, Permission
from .models import *
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.admin import UserAdmin
from django.utils.safestring import mark_safe
from django.utils.html import format_html



admin.site.unregister(Group)
class UserAdmin(BaseUserAdmin):
    # Define the fieldsets for the user detail view
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal Info'), {'fields': ('first_name', 'last_name', 'profile_picture', 'user_type')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login',)}),
    )

    # Define the fields to be displayed in the list view
    list_display = ('profile_picture_display','email', 'first_name', 'last_name', 'user_type', 'is_active', 'is_staff')

    # Define the fields to be used for filtering in the list view
    list_filter = ('is_active', 'is_staff', 'user_type')

    # Define the fields to be used in the search functionality
    search_fields = ('email', 'first_name', 'last_name')

    # Define the ordering of the user list
    ordering = ('email',)

    # Define which fields are editable in the admin interface
    filter_horizontal = ('user_permissions',)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'profile_picture', 'user_type', 'password1', 'password2'),
        }),
    )

    # Method to display profile picture as a rounded avatar in the list view
    def profile_picture_display(self, obj):
        if obj.profile_picture:
            return mark_safe(f'<img src="{obj.profile_picture.url}" width="50" height="50" style="border-radius: 50%; object-fit: cover;"/>')
        return _('No image')

    profile_picture_display.short_description = _('Profile Picture')
    
    
    
    
admin.site.register(User, UserAdmin)




class PropertyAdmin(admin.ModelAdmin):
    list_display = ('image1_preview','title', 'landlord', 'rent_price', 'available', 'updated_at')
    list_filter = ('available', 'created_at', 'updated_at', 'rent_price')
    search_fields = ('title', 'description', 'address')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Info', {
            'fields': ('landlord', 'title', 'description', 'address', 'rent_price', 'available', 'bedrooms', 'bathrooms', 'parking')
        }),
        ('Images', {
            'fields': ('image1', 'image2', 'image3'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )
    
    def image1_preview(self, obj):
        if obj.image1:
            return format_html('<img src="{}" style="width: 40px; height: auto;" />', obj.image1.url)
        return "No Image"
    
    image1_preview.short_description = 'Image Preview'

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('landlord')

admin.site.register(Property, PropertyAdmin)

admin.site.register(TenantProfile)
admin.site.register(Lease)
admin.site.register(Payment)
admin.site.register(MaintenanceRequest)
admin.site.register(Notification)
admin.site.register(Application)
admin.site.register(PropertyFile)

# Optionally, if you want to customize the admin display of each model, 
# you can create custom ModelAdmins for each model, similar to the UserAdmin above.
