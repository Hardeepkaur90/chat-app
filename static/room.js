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
    'wss://'
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
    console.log(data);
    const messageElement = document.createElement('div')
    const sender = data['sender']
    messageElement.innerHTML = '<b>' + data.sender + '</b><br/>'  + data.message
    if (data.message === 'Join Group'){
        messageElement.innerHTML = '<b>' + data.sender + '  '  + data.message
        if (sender === name) {
            messageElement.classList.add('message1', 'join')
            } else {
            messageElement.classList.add('message1', 'recever-join')
        }
    }
    else if(data.message === 'leaved the chat'){
        messageElement.innerHTML = '<b>' + data.sender + '  '  + data.message
        if (sender !== name) {
            messageElement.classList.add('message1', 'leave')
            }
    }
    else if (sender === name) {
        messageElement.classList.add('message', 'sender')
    } else {
        messageElement.classList.add('message', 'receiver')
    }

    chatLog.appendChild(messageElement)

    if (document.querySelector('#emptyText')) {
        document.querySelector('#emptyText').remove()
    }
    $("div#chat-log").scrollTop($("div#chat-log")[0].scrollHeight);
};

    document.querySelector('#chat-message-input').focus();
    
    document.querySelector('#chat-message-input').onkeyup = function(e) {
        if (e.keyCode === 13) {  // enter, return
            document.querySelector('#chat-message-submit').click();
        }
    };
    
document.querySelector('#chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value;
    
    if (message === '') {
        alert("Please Enter Data");
        return 0;
    }
    chatSocket.send(JSON.stringify({
        'message': message,
        "username":name
    }));
    messageInputDom.value = '';
};


document.getElementById('leave_chat').addEventListener("click",()=>{
    chatSocket.send(JSON.stringify({
        'message': "leaved the chat",
        "username":name
    }))
    chatSocket.close()
    window.location = window.location.origin + '/chat/';
})