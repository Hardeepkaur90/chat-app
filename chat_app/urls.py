from django.urls import path

from chat_app import views

urlpatterns = [
    path('', views.Index.as_view(), name='index'),
    path('<str:room_name>/', views.Room.as_view(), name='room'),
]