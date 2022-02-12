const name = prompt('Enter Your Name')

if (name === '') {
    alert("Please Enter Name");
    window.location.pathname = '/chat/';
} 

document.getElementById("curr_user").innerHTML = name
const chatLog = document.querySelector('#chat-log')
const roomName = JSON.parse(document.getElementById('room-name').textContent);

if (!chatLog.hasChildNodes()) {
    const emptyText = document.createElement('h3')
    emptyText.id = 'emptyText'
    emptyText.innerText = 'No Messages'
    emptyText.className = 'emptyText'
    chatLog.appendChild(emptyText)
}

const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/chat/'
    + roomName
    + '/'
);

chatSocket.addEventListener('open',()=>{
    chatSocket.send(JSON.stringify({
        'type': "user_joined",
        "username":name
    }));
})

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const messageElement = document.createElement('div')
    const sender = data['sender']
    messageElement.innerHTML = '<b>' + data.sender + '</b><br/>'  + data.message
    if (sender === name) {
        messageElement.classList.add('message', 'sender')
    } else {
        messageElement.classList.add('message', 'receiver')
    }

    chatLog.appendChild(messageElement)

    if (document.querySelector('#emptyText')) {
        document.querySelector('#emptyText').remove()
    }
};

// chatSocket.addEventListener('onclose',()=>{
//     chatSocket.send(JSON.stringify({
//         'type': "user_leave",
//         "username":name
//     }));
// })
// chatSocket.onclose = function(e) {
    //     console.error('Chat socket closed unexpectedly');
    // };
    
    document.querySelector('#chat-message-input').focus();
    
    document.querySelector('#chat-message-input').onkeyup = function(e) {
        if (e.keyCode === 13) {  // enter, return
            document.querySelector('#chat-message-submit').click();
        }
    };
    
    document.querySelector('#chat-message-submit').onclick = function(e) {
        const messageInputDom = document.querySelector('#chat-message-input');
        const message = messageInputDom.value;
        
        chatSocket.send(JSON.stringify({
            'message': message,
            "username":name
        }));
        messageInputDom.value = '';
};


document.getElementById('leave_chat').addEventListener("click",()=>{
    chatSocket.send(JSON.stringify({
        'message': "<b>" + name + "</b>"+ " leaved the chat",
        "username":''
    }))
    chatSocket.close()
    window.location = window.location.origin + '/chat/';
})