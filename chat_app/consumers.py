import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):

    messages = []
    room = {}

    def join_chat(self,username):
        key = self.room_name
        value = []
        if key in self.room.keys():
            self.room[key].append(username)
            re = self.room
        else:
            value.append(username)
            self.room[key]=value
            re = self.room 
        return re

    def leave_chat(self, username):
        key = self.room_name
        
        self.room[key].remove(username)
        re = self.room
        return re

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        f=self.scope['user']
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        self.messages.append({"msg": f"{ f } Join Group", "id": f.id, "username": f.username})
   

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        msgtype = text_data_json.get('type')
        username = text_data_json.get("username")
        if msgtype == "user_joined":
            
            await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': "Join Group",
                'total':self.join_chat(username),
                'sender': username
                }
                )
            return
        message = text_data_json['message']

        if message == "leaved the chat":
            await self.channel_layer.group_send(
            self.room_group_name,
            {
                'message': message,
                'total':self.leave_chat(username),
                'sender': username
                }
                )
            return
        image = text_data_json.get('image')
        self.user_id = self.scope['user'].id

        # Send message to room group
        self.messages.append({"msg": message, "id": self.user_id, "username": self.scope['user'].username,"image":image})
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'image' :image,
                'sender': username
                }
                )

    # Receive message from room group
    async def chat_message(self, event):
        image = event.get('image')
        message = event['message']
        sender = event.get("sender")
        total = event['total']
        print(message,"===============")

        if message == "Join Group":
        # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'message': message,
                'image': image,
                'sender': sender,
                'total':total
            }))
        else:
            await self.send(text_data=json.dumps({
                'message': message,
                'image': image,
                'sender': sender
            }))