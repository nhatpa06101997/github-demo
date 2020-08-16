const socket = io('http://localhost:3000');
const messageForm = document.getElementById('send-container');
const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('message-input');

if(messageForm != null){

    messageForm.addEventListener('submit', e=>{
        e.preventDefault();
        const message = messageInput.value;
        appendMessage(`You: ${message}`);
        socket.emit('send-chat-message',message);
        messageInput.value = '';
    })
};

socket.on('chat-message', data =>{
    appendMessage(`${data.name} : ${data.message}`);
});

socket.on('user-connected', name => {
    appendMessage(`${name} connected`)
});

function appendMessage(message){
    const messageElement = document.createElement('span');
    messageElement.setAttribute("class","spanspan");
    const messageP = document.createElement('p');
    messageP.setAttribute("class","pp");
    messageElement.innerText = message;
    messageContainer.append(messageP);
    messageP.append(messageElement);
}