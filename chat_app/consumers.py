import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):

    messages = []

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
    async def receive(self, text_data, **kwargs):
        text_data_json = json.loads(text_data)
        msgtype = text_data_json.get('type')
        username = text_data_json.get("username")
        image = text_data_json.get('image')
        if msgtype == "user_joined":
            await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': "Join Group",
                'sender': username
                }
                )
            return
        message = text_data_json['message']
        self.user_id = self.scope['user'].id

        # Send message to room group
        self.messages.append({"msg": message, "id": self.user_id, "username": self.scope['user'].username})
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
        message = event['message']
        sender = event.get("sender")

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender
        }))