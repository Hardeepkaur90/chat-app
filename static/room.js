
let base64String = "";
  
function imageUploaded() {
    var file = document.querySelector(
        'input[type=file]')['files'][0];
  
    var reader = new FileReader();
    
    reader.onload = function () {
        base64String = reader.result.replace("data:", "")
            .replace(/^.+,/, "");
        
        imageBase64Stringsep = base64String;
    }
    reader.readAsDataURL(file);    
}
// function re(){
//     document.location.reload();
//     document.getElementById("leave_chat").click();
//   };

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
    let baseStr64=data.image;
    let data12 = data.total;
    let list = document.getElementById("myList");
    var image = document.createElement('img')
    image.src ="data:image/jpg;base64," + baseStr64;
    image.width = 160;
    image.height = 160;
    const messageElement = document.createElement('div')
    const sender = data['sender']
    messageElement.innerHTML = '<b>' + data.sender + '</b><br/>'  + data.message;
    parent = list.parentNode;
    list.innerHTML = '';
    for(var i = 0; i < data12[roomName].length ; i++){
        let li = document.createElement("li");
        li.innerText = data12[roomName][i];
        list.innerHTML += li.textContent + '<br/>';
        }
    if (data.message === 'Join Group'){
        messageElement.innerHTML = '<b>' + data.sender + '  '  + data.message;
        if (sender === name) {
            messageElement.classList.add('message1', 'join')
            } else {
            messageElement.classList.add('message1', 'recever-join')
        }
    }

    else if(data.message === 'leaved the chat'){
        messageElement.innerHTML = '<b>' + data.sender + '   '  + data.message
        if (sender !== name) {
            messageElement.classList.add('message1', 'leave')
            }
    }

    else if (sender === name) {
        messageElement.classList.add('message', 'sender')
        if (baseStr64!==null && baseStr64!==''){
        messageElement.innerHTML = '<b>' + data.sender + '</b><br/>'  + data.message + '<br/>'  ;
        messageElement.appendChild(image)}
    } 

    else {
        messageElement.classList.add('message', 'receiver')
        if (baseStr64!==null && baseStr64!==''){
            messageElement.innerHTML = '<b>' + data.sender + '</b><br/>'  + data.message + '<br/>'  ;
            messageElement.appendChild(image)}
    }

    chatLog.appendChild(messageElement)

    if (document.querySelector('#emptyText')) {
        document.querySelector('#emptyText').remove()
    }
    
    $("div#chat-log").scrollTop($("div#chat-log")[0].scrollHeight);
     
      
};

    document.querySelector('#chat-message-input').focus();
    
    (document.querySelector('#chat-message-input').onkeyup) = function(e) {
        if (e.keyCode === 13) {  
            document.querySelector('#chat-message-submit').click();
        }
    };

    
document.querySelector('#chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#chat-message-input');
    const messageInputDomfile = document.querySelector('#chat-message-input-file');
    const message = messageInputDom.value;
    
    if (message === '' && base64String==='') {
     
        return 0;
    }

    chatSocket.send(JSON.stringify({
        'message': message,
        "username":name,
        "image":base64String
    }));
    messageInputDom.value = '';
    base64String = '';
    messageInputDomfile.value = '';
};


document.getElementById('leave_chat').addEventListener("click",()=>{
    chatSocket.send(JSON.stringify({
        'message': "leaved the chat",
        "username":name
    }))
    chatSocket.close()
    window.location = window.location.origin + '/chat/';
})

