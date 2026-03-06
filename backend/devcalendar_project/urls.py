from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('google_auth.urls')),
    path('api/tasks/', include('tasks_app.urls')),
    path('api/calendar/', include('calendar_app.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
