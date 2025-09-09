from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_root, name='api_root'),
    path('rooms/create/', views.create_room, name='create_room'),
    path('rooms/<str:room_id>/join/', views.join_room, name='join_room'),
    path('rooms/<str:room_id>/participants/', views.get_participants, name='get_participants'),
    path('rooms/<str:room_id>/messages/', views.get_messages, name='get_messages'),
    path('rooms/<str:room_id>/messages/send/', views.send_message, name='send_message'),
    path('rooms/<str:room_id>/attention/', views.update_attention, name='update_attention'),
]