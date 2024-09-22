from rest_framework import serializers
from .models import *
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.serializers import ModelSerializer
from django.contrib.admin.models import LogEntry


class RegisterUserSerializer(ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "password",
            "user_type",
            "profile_picture",
        ]

    # extra_kwargs = {'password':{'write_only':True}}

    def validate(self, attrs):
        email = attrs.get("email", None)
        first_name = attrs.get("first_name", None)
        last_name = attrs.get("last_name", None)
        user_type = attrs.get("user_type", None)

        if not first_name.isalnum():
            raise serializers.ValidationError("The username must be alphanumeric")
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class ResetPasswordEmailRequestSerializer(ModelSerializer):
    email = serializers.EmailField(min_length=2)

    class Meta:
        model = User
        fields = ["email"]

    def validate(self, attrs):

        email = attrs["data"].get("email", "")

        return super().validate(attrs)


class ResetPasswordEmailRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(min_length=2)

    redirect_url = serializers.CharField(max_length=500, required=False)

    class Meta:
        fields = ["email"]


class SetNewPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(min_length=6, max_length=68, write_only=True)
    token = serializers.CharField(min_length=1, write_only=True)
    uidb64 = serializers.CharField(min_length=1, write_only=True)

    class Meta:
        fields = ["password", "token", "uidb64"]

    def validate(self, attrs):
        try:
            password = attrs.get("password")
            token = attrs.get("token")
            uidb64 = attrs.get("uidb64")

            id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise AuthenticationFailed("The reset link is invalid", 401)

            user.set_password(password)
            user.save()

            return user
        except Exception as e:
            raise AuthenticationFailed("The reset link is invalid", 401)
        return super().validate(attrs)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "profile_picture"]


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    image1 = serializers.ImageField(use_url=True)
    image2 = serializers.ImageField(use_url=True)
    image3 = serializers.ImageField(use_url=True)
    property_name = serializers.SerializerMethodField()

    class Meta:
        model = MaintenanceRequest
        fields = [
            "tenant",
            "property",
            "property_name",
            "type",
            "description",
            "status",
            "severity",
            "image1",
            "image2",
            "submitted_at",
            "image3",
            "video",
            "budget",
            "completed_at",
        ]

    def get_property_name(self, obj):
        return obj.property.title


class TenantProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = TenantProfile
        fields = [
            "id",
            "user",
            "phone_number",
            "current_property",
            "moved_in",
            "billed_amount",
            "paid_amount",
        ]


class PropertyFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyFile
        fields = "__all__"


class PropertySerializer(serializers.ModelSerializer):
    landlord = UserSerializer(read_only=True)
    maintenance_requests = MaintenanceRequestSerializer(many=True, read_only=True)
    tenant_profile = TenantProfileSerializer(
        read_only=True
    )  # Assuming you have this serializer
    property_files = PropertyFileSerializer(
        many=True, read_only=True
    )  # Include files in the response

    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "description",
            "address",
            "rent_price",
            "available",
            "image1",
            "image2",
            "image3",
            "bedrooms",
            "bathrooms",
            "parking",
            "created_at",
            "updated_at",
            "landlord",
            "maintenance_requests",
            "tenant_profile",
            "property_files",
        ]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "tenant", "property", "amount", "payment_date", "status"]


class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer()  # To get sender's details
    recipient = UserSerializer()  # To get recipient's details

    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "date",
            "read",
            "notification_type",
            "sender",
            "recipient",
        ]


class ApplicationSerializer(serializers.ModelSerializer):
    tenant_email = serializers.EmailField(source="tenant.email", read_only=True)
    property_name = serializers.CharField(source="property.name", read_only=True)
    status = serializers.ChoiceField(
        choices=Application.STATUS_CHOICES, required=True
    )  # Ensure this is required if necessary
    profile_picture = serializers.ImageField(
        source="tenant.profile_picture", read_only=True
    )
    first_name = serializers.CharField(source="tenant.first_name", read_only=True)
    last_name = serializers.CharField(source="tenant.last_name", read_only=True)

    class Meta:
        model = Application
        fields = [
            "id",
            "tenant",
            "tenant_email",
            "property",
            "property_name",
            "status",
            "submitted_at",
            "reviewed_at",
            "profile_picture",
            "first_name",
            "last_name",
        ]
        read_only_fields = ["id", "submitted_at", "reviewed_at"]

    def create(self, validated_data):
        tenant = validated_data.get("tenant")
        property_obj = validated_data.get("property")

        if Application.objects.filter(tenant=tenant, property=property_obj).exists():
            raise serializers.ValidationError(
                "You have already applied for this property."
            )

        return super().create(validated_data)
