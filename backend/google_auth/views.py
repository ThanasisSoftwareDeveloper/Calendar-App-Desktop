from django.contrib.auth.models import User
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import GoogleProfile
from .services import GoogleOAuthService, GoogleCalendarService
from .serializers import GoogleProfileSerializer


class GoogleAuthURLView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        service = GoogleOAuthService()
        url = service.get_auth_url()
        return Response({'url': url})


class GoogleCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            oauth = GoogleOAuthService()
            token_data = oauth.exchange_code(code)
            access_token = token_data['access_token']
            refresh_token = token_data.get('refresh_token', '')

            user_info = oauth.get_user_info(access_token)
            google_id = user_info['sub']
            email = user_info['email']
            name = user_info.get('name', '')
            avatar = user_info.get('picture', '')

            # Get or create user
            try:
                profile = GoogleProfile.objects.get(google_id=google_id)
                user = profile.user
            except GoogleProfile.DoesNotExist:
                # Create new user
                username = email.split('@')[0]
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=name.split(' ')[0] if name else '',
                    last_name=' '.join(name.split(' ')[1:]) if name and ' ' in name else '',
                )
                profile = GoogleProfile(user=user, google_id=google_id)

            # Update tokens
            profile.email = email
            profile.name = name
            profile.avatar_url = avatar
            profile.access_token = access_token
            if refresh_token:
                profile.refresh_token = refresh_token
            profile.token_expiry = timezone.now() + timedelta(seconds=token_data.get('expires_in', 3600))
            profile.save()

            # Issue JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': name,
                    'avatar': avatar,
                }
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GoogleProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = GoogleProfile.objects.get(user=request.user)
            serializer = GoogleProfileSerializer(profile)
            return Response(serializer.data)
        except GoogleProfile.DoesNotExist:
            return Response({'error': 'No Google profile connected'}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request):
        profile = GoogleProfile.objects.get(user=request.user)
        serializer = GoogleProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class GoogleCalendarSyncView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Trigger manual calendar sync"""
        try:
            service = GoogleCalendarService(request.user)
            count = service.sync_from_google(request.user)
            return Response({'synced': count, 'message': f'Synced {count} events from Google Calendar'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GmailImportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Trigger Gmail import"""
        from .services import GmailService
        try:
            service = GmailService(request.user)
            imported = service.import_tasks_from_emails(request.user)
            return Response({'imported': len(imported), 'message': f'Imported {len(imported)} tasks from Gmail'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DisconnectGoogleView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        GoogleProfile.objects.filter(user=request.user).delete()
        return Response({'message': 'Google account disconnected'})
