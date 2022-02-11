from django.shortcuts import render
from django.views import View

class Index(View):
    def get(self, request):
        return render(request, 'index.html')

class Room(View):
    def get(self, request, room_name):
        return render(request, 'room.html', {'room_name': room_name})