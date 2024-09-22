from django.urls import include, path
from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView

from base.views import *

router = routers.DefaultRouter()


urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path('token/refresh/', TokenRefreshView.as_view(), name="token_refresh"),   
    path('register/', RegisterView.as_view(), name="register"),
    path('request-reset-email/', RequestPasswordResetEmail.as_view(),
         name="request-reset-email"),
    path('password-reset/<uidb64>/<token>/',
         PasswordTokenCheckAPI.as_view(), name='password-reset-confirm'),
    path('password-reset-complete', SetNewPasswordAPIView.as_view(),
         name='password-reset-complete'),


    path('properties/', property_list_create, name='listed-properties'),
     path('applications/', ApplicationListCreateView.as_view(), name='application-list-create'),
     path('maintenance-requests/', maintenance_request_view, name='maintenance-request'),
     path('notifications/' ,NotificationViewSet.as_view({'get': 'list'}), name='notifications'),
     
     path('landlord/', landlord_dashboard, name='landlord-dashboard'),
]