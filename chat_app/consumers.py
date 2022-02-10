import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):

    messages = []

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        f=self.scope['user']
        print(f)
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        self.messages.append({"msg": f"{ f } Join Group", "id": f.id, "username": f.username})
        
        for i in self.messages:
            await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': i['msg'],
                'user_id': i['id'],
                'sender': i['username']
                }
                )

        


    async def disconnect(self, close_code):
        # Leave room group
        f=self.scope['user']
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        self.messages.append({"msg": f"{ f } Leave Group", "id": f.id, "username": f.username})
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': f"{ f } Leave Group",
                'user_id':f.id,
                'sender': f.username
                }
                )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        self.user_id = self.scope['user'].id

        # Send message to room group
        self.messages.append({"msg": message, "id": self.user_id, "username": self.scope['user'].username})
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'user_id':self.user_id,
                'sender': self.scope['user'].username
                }
                )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        user_id = event['user_id']
        sender = event['sender']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'user_id':user_id,
            'sender': sender
        }))