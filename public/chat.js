const socket = io();

// DOM Elements
const nameModal = document.getElementById('name-modal');
const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('name-input');
const chatApp = document.getElementById('chat-app');
const userDisplay = document.getElementById('user-display');
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');
const chatMessages = document.getElementById('chat-messages');

let userName = '';

// Handle Name Form Submission
nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    userName = nameInput.value.trim();
    
    if (userName) {
        // Emit join event
        socket.emit('join', userName);
        
        // Hide modal and show chat app
        nameModal.classList.add('hidden');
        chatApp.classList.remove('hidden');
        userDisplay.textContent = userName;
        
        // Focus chat input
        msgInput.focus();
    }
});

// Handle Chat Message Submission
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = msgInput.value.trim();
    
    if (msg) {
        // Emit message to server
        socket.emit('chatMessage', msg);
        
        // Add message to own UI immediately for better UX
        appendMessage({
            name: userName,
            text: msg,
            type: 'mine' // Special type to align right
        });
        
        msgInput.value = '';
        msgInput.focus();
    }
});

// Handle Incoming Messages
socket.on('message', (message) => {
    // If it's a 'user' type message and the name matches ours, we skip it
    // because we already added it locally (unless it's a different tab but same name)
    // To be safe, we'll only skip if the UI approach above is flawless, but here 
    // it's easier to just display it if we don't have local echo. 
    // Since we added local echo (`appendMessage` on submit), we check:
    if (message.type === 'user' && message.name === userName) {
        return; // Ignore own messages broadcasted back (if we decided to broadcast to all)
    }
    
    appendMessage(message);
});

// Helper Function to Append Message to DOM
function appendMessage(message) {
    const msgElement = document.createElement('div');
    msgElement.classList.add('message');
    
    // Determine message type class
    if (message.type === 'system') {
        msgElement.classList.add('msg-system');
    } else if (message.type === 'mine') {
        msgElement.classList.add('msg-mine');
    } else {
        msgElement.classList.add('msg-other');
    }
    
    // Construct HTML
    msgElement.innerHTML = `
        <div class="msg-header">${message.name}</div>
        <div class="msg-body">${escapeHTML(message.text)}</div>
    `;
    
    chatMessages.appendChild(msgElement);
    
    // Scroll to bottom smoothly
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
}

// Basic HTML escaping to prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}
