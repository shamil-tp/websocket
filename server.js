const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route
app.get('/', (req, res) => {
    res.render('index');
});

// Socket.IO logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle joining
    socket.on('join', (name) => {
        socket.name = name;
        console.log(`${name} joined the chat.`);
        socket.broadcast.emit('message', {
            name: 'System',
            text: `${name} has joined the chat.`,
            type: 'system'
        });
    });

    // Handle chat message
    socket.on('chatMessage', (msg) => {
        io.emit('message', {
            name: socket.name || 'Anonymous',
            text: msg,
            type: 'user'
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        if (socket.name) {
            console.log(`${socket.name} left the chat.`);
            io.emit('message', {
                name: 'System',
                text: `${socket.name} has left the chat.`,
                type: 'system'
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
