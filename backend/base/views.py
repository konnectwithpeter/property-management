from rest_framework import viewsets
import os

from re import search, sub
from threading import Timer
import json

from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage, EmailMultiAlternatives, send_mail
from django.db.models.functions import Now
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile
from django.http import HttpResponsePermanentRedirect
from django.shortcuts import render, get_object_or_404
from django.template.loader import get_template, render_to_string
from django.utils.encoding import DjangoUnicodeDecodeError, smart_bytes, smart_str
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status
from rest_framework.decorators import (
    api_view,
    action,
    parser_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.core.files.storage import default_storage
from django.shortcuts import render, get_object_or_404
from datetime import datetime
from .models import MaintenanceRequest, Property
from django.views import View
from django.core.files.storage import default_storage
import json


from .models import *
from .serializers import *

EMAIL_HOST_USER = "Copy Validator <info@copyvalidator.com>"


@api_view(["GET", "POST"])
@parser_classes([MultiPartParser, FormParser])  # To handle file uploads
def property_list_create(request):
    if request.method == "GET":
        # Return a list of all properties
        properties = Property.objects.all()
        serializer = PropertySerializer(properties, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        # Ensure that the user is authenticated and is a landlord
        if not request.user.is_authenticated or request.user.user_type != "landlord":
            return Response(
                {"error": "Only landlords can create properties"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Use request.data directly, no need to copy
        property_data = {
            "title": request.data.get("title"),
            "rent_price": request.data.get("rent_amount"),
            "address": request.data.get("location"),
            "description": request.data.get("description"),
            "bedrooms": request.data.get("bedrooms"),
            "bathrooms": request.data.get("bathrooms"),
            "parking": request.data.get("parking"),
        }

        image_fields = ["image1", "image2", "image3"]
        for idx, field_name in enumerate(image_fields):
            image_key = f"image_{idx + 1}"
            if image_key in request.FILES:
                uploaded_file = request.FILES[image_key]

                # Ensure proper handling of temporary files
                if isinstance(uploaded_file, TemporaryUploadedFile):
                    uploaded_file.seek(0)
                elif isinstance(uploaded_file, InMemoryUploadedFile):
                    uploaded_file.open()

                property_data[field_name] = uploaded_file

        # Create a property instance with the landlord manually set
        serializer = PropertySerializer(data=property_data)

        if serializer.is_valid():
            # Save the property instance without committing it to the database yet
            property_instance = serializer.save(landlord=request.user)

            # Handle additional files (optional)
            if "files[]" in request.FILES:
                files = request.FILES.getlist("files[]")
                for file in files:
                    PropertyFile.objects.create(property=property_instance, file=file)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ApplicationListCreateView(generics.ListCreateAPIView):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Attach the currently authenticated tenant to the application
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Save the application with the tenant field
        serializer.save(tenant=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request):
        # Ensure that the user is authenticated and is a landlord
        if not request.user.is_authenticated or request.user.user_type != "landlord":
            return Response(
                {"error": "Only landlords can update applications"},
                status=status.HTTP_403_FORBIDDEN,
            )

        data = request.data

        try:
            # Get the tenant and property objects
            tenant = User.objects.get(email=data["tenant"])
            property = Property.objects.get(id=data["property"])

            # Get the corresponding application object
            application = Application.objects.get(tenant=tenant, property=property)

            # Update the application status and review timestamp
            application.status = "accepted"  # or data['status'] if dynamic
            application.reviewed_at = timezone.now()

            # Save the changes
            application.save()

            Application.objects.filter(tenant=tenant).exclude(
                property=property
            ).delete()

            print(application)
            return Response(data, status=status.HTTP_202_ACCEPTED)

        except User.DoesNotExist:
            return Response(
                {"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND
            )

        except Property.DoesNotExist:
            return Response(
                {"error": "Property not found"}, status=status.HTTP_404_NOT_FOUND
            )

        except Application.DoesNotExist:
            return Response(
                {"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND
            )


# List and create maintenance requests
@api_view(["GET", "POST","PATCH"])
def maintenance_request_view(request):
    if request.method == "GET":
        # Get all maintenance requests for the logged-in tenant
        tenant = request.user
        requests = MaintenanceRequest.objects.filter(tenant=tenant)
        serializer = MaintenanceRequestSerializer(requests, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        # Handle new maintenance request creation
        data = request.data
        tenant = request.user
        property_id = data.get("property_id")

        # Ensure property belongs to the tenant
        try:
            property = Property.objects.get(id=property_id)
        except Property.DoesNotExist:
            return Response(
                {"error": "Property not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Create a new maintenance request
        request_data = {
            "tenant": tenant.id,
            "property": property.id,
            "type": data.get("maintenance_type"),
            "description": data.get("description"),
            "severity": data.get("severity"),
        }

        # Include images if they were uploaded
        if "image_0" in request.FILES:
            request_data["image1"] = request.FILES["image_0"]

        if "image_1" in request.FILES:
            request_data["image2"] = request.FILES[
                "image_1"
            ]  # Only add if the file is uploaded

        if "image_2" in request.FILES:
            request_data["image3"] = request.FILES[
                "image_2"
            ]  # Only add if the file is uploaded

        # Optional video field
        if "video" in request.FILES:
            request_data["video"] = request.FILES["video"]

        # Serialize the data and create the maintenance request
        serializer = MaintenanceRequestSerializer(data=request_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "PATCH":
        data = request.data
        print(request.data)
        tenant = User.objects.get(id=data["tenant"])
        maintenance_request = get_object_or_404(
            MaintenanceRequest, property=data["property"], tenant=tenant
        )
        print(maintenance_request)
        return Response(
            {"message": "Status updated successfully"}, status=status.HTTP_200_OK
        )


# View to update request status
@api_view(["PATCH"])
def update_maintenance_status(request, pk):
    maintenance_request = get_object_or_404(
        MaintenanceRequest, pk=pk, tenant=request.user
    )

    new_status = request.data.get("status")
    if new_status not in dict(MaintenanceRequest.STATUS_CHOICES):
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

    maintenance_request.status = new_status

    if new_status == "Completed":
        maintenance_request.completed_at = datetime.now()

    maintenance_request.save()

    return Response(
        {"message": "Status updated successfully"}, status=status.HTTP_200_OK
    )


@api_view(["GET"])
def landlord_dashboard(request):
    landlord = request.user
    print(landlord)

    if landlord.user_type != "landlord":
        return Response(
            {"error": "Unauthorized access"}, status=status.HTTP_403_FORBIDDEN
        )

    # Fetch all properties for the landlord
    properties = Property.objects.filter(landlord=landlord)

    # Fetch all maintenance requests for properties owned by the landlord
    maintenance_requests = MaintenanceRequest.objects.filter(
        property__landlord=landlord
    )

    # Fetch all tenant profiles for properties owned by the landlord
    tenant_profiles = TenantProfile.objects.filter(current_property__landlord=landlord)

    # Prepare a dictionary to hold the combined data for each property
    property_data = []

    for property in properties:
        # Get all maintenance requests for this specific property
        property_maintenance_requests = maintenance_requests.filter(property=property)

        # Get the tenant profile associated with this specific property, if any
        tenant_profile = tenant_profiles.filter(current_property=property).first()

        # Bundle the data together
        property_dict = {
            "property": PropertySerializer(property, context={"request": request}).data,
            "maintenance_requests": MaintenanceRequestSerializer(
                property_maintenance_requests, many=True, context={"request": request}
            ).data,
            "tenant_profile": (
                TenantProfileSerializer(
                    tenant_profile, context={"request": request}
                ).data
                if tenant_profile
                else None
            ),
            "applications": ApplicationSerializer(
                property.application_set.all(), many=True, context={"request": request}
            ).data,  # Add this line
        }

        # Add the bundled data to the property data list
        property_data.append(property_dict)

    # Fetch unread notifications for the landlord
    notifications = Notification.objects.filter(recipient=landlord)

    # Serialize notifications
    notifications_serializer = NotificationSerializer(notifications, many=True)

    # Combine response data
    response_data = {
        "properties": property_data,
        "notifications": notifications_serializer.data,
    }

    return Response(response_data, status=status.HTTP_200_OK)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter notifications for the authenticated user (recipient)
        return Notification.objects.filter(recipient=self.request.user)

    # Allow landlord and admin users to create/send notifications
    def create(self, request, *args, **kwargs):
        # Ensure only landlords or admins can send notifications
        if request.user.user_type not in ["landlord", "admin"]:
            return Response(
                {"detail": "You do not have permission to send notifications."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # The sender is the logged-in user
        sender = request.user

        # Extract the data to create the notification
        title = request.data.get("title")
        message = request.data.get("message")
        notification_type = request.data.get(
            "notification_type", "Info"
        )  # Default to Info if not provided
        recipient_id = request.data.get(
            "recipient"
        )  # Expect recipient's user ID from frontend

        try:
            recipient = User.objects.get(id=recipient_id)  # Ensure recipient exists
        except User.DoesNotExist:
            return Response(
                {"detail": "Recipient not found."}, status=status.HTTP_404_NOT_FOUND
            )

        # Create the notification
        notification = Notification.objects.create(
            title=title,
            message=message,
            notification_type=notification_type,
            sender=sender,
            recipient=recipient,
        )

        serializer = self.get_serializer(notification)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # Mark a notification as 'Read'
    @action(detail=True, methods=["post"])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({"status": "Notification marked as read"})


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token["first_name"] = user.first_name
        token["last_name"] = user.last_name
        token["email"] = user.email
        token["user_type"] = user.user_type

        # Debugging: Check profile_picture value
        if user.profile_picture:
            try:
                profile_picture_url = default_storage.url(user.profile_picture.name)
                token["profile_picture"] = profile_picture_url
            except Exception as e:
                print(f"Error getting profile picture URL: {e}")
                token["profile_picture"] = None
        else:
            token["profile_picture"] = None

        # Attach TenantProfile details if user is a tenant and has a TenantProfile
        if user.user_type == "tenant":
            try:
                tenant_profile = user.tenantprofile
                token["tenant_profile"] = {
                    "phone_number": tenant_profile.phone_number,
                    "current_property": (
                        tenant_profile.current_property.id
                        if tenant_profile.current_property
                        else None
                    ),
                    "moved_in": tenant_profile.moved_in.strftime(
                        "%Y-%m-%d"
                    ),  # Convert date to string
                    "billed_amount": tenant_profile.billed_amount,
                    "paid_amount": tenant_profile.paid_amount,
                }
            except TenantProfile.DoesNotExist:
                token["tenant_profile"] = None

        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    serializer_class = RegisterUserSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        email = request.data["email"]
        first_name = request.data["first_name"]

        # def new_task(mail):
        # message = render_to_string(
        #     'base/welcome_email.html', {'username': first_name})
        # msg = EmailMessage(
        #     'Welcome to Copy Validator',
        #     message,
        #     EMAIL_HOST_USER,
        #     [email],
        # )
        # msg.content_subtype = "html"
        # msg.send()

        # task = threading.Thread(target=new_task, args=(email,))
        # task.start()
        return Response(status=status.HTTP_201_CREATED)


class RequestPasswordResetEmail(generics.GenericAPIView):
    serializer_class = ResetPasswordEmailRequestSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        email = request.data.get("email", "")

        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)
            current_site = get_current_site(request=request).domain
            # current_site = "localhost:5000"
            # relativeLink = reverse(
            #     'password-reset-confirm', kwargs={'uidb64': uidb64, 'token': token})
            redirect_url = request.data.get("redirect_url", "")
            reset_url = redirect_url + "uidb64=" + str(uidb64) + "/token=" + str(token)

            # absurl = 'http://localhost:5000/'
            message = ""
            # email_body = 'Hello,\nUse link below to reset your password \n' + reset_url

            send_mail(
                "Password Reset",
                message,
                EMAIL_HOST_USER,
                [email],
                html_message=render_to_string(
                    "base/user_reset_password.html", {"reset_url": reset_url}
                ),
                fail_silently=False,
            )

        return Response(
            {"success": "We have sent you a link to reset your password"},
            status=status.HTTP_200_OK,
        )


class CustomRedirect(HttpResponsePermanentRedirect):

    allowed_schemes = [os.environ.get("APP_SCHEME"), "http", "https"]


class PasswordTokenCheckAPI(generics.GenericAPIView):
    serializer_class = SetNewPasswordSerializer
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):

        redirect_url = request.GET.get("redirect_url")

        try:
            id = smart_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                if len(redirect_url) > 3:
                    return CustomRedirect(redirect_url + "?token_valid=False")
                else:
                    return CustomRedirect(
                        os.environ.get("FRONTEND_URL", "") + "?token_valid=False"
                    )

            if redirect_url and len(redirect_url) > 3:
                return CustomRedirect(
                    redirect_url
                    + "?token_valid=True&message=Credentials Valid&uidb64="
                    + uidb64
                    + "&token="
                    + token
                )
            else:
                return CustomRedirect(
                    os.environ.get("FRONTEND_URL", "") + "?token_valid=False"
                )

        except DjangoUnicodeDecodeError as identifier:
            try:
                if not PasswordResetTokenGenerator().check_token(user):
                    return CustomRedirect(redirect_url + "?token_valid=False")

            except UnboundLocalError as e:
                return Response(
                    {"error": "Token is not valid, please request a new one"},
                    status=status.HTTP_400_BAD_REQUEST,
                )


class SetNewPasswordAPIView(generics.GenericAPIView):
    serializer_class = SetNewPasswordSerializer
    permission_classes = [AllowAny]

    def patch(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(
            {"success": True, "message": "Password reset success"},
            status=status.HTTP_200_OK,
        )
