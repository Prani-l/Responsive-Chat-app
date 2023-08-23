// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Create an Express app instance
const app = express();

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Create a Socket.io instance by passing the HTTP server
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));

// Store active users in each room using an object
const activeUsers = {};

// Handle incoming Socket.io connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        if (socket.username && socket.roomId) {
            const roomUsers = activeUsers[socket.roomId];
            if (roomUsers) {
                const index = roomUsers.indexOf(socket.username);
                if (index !== -1) {
                    // Remove disconnected user from activeUsers
                    roomUsers.splice(index, 1);
                    // Emit updated user list to the room
                    io.to(socket.roomId).emit('user list', activeUsers);
                }
            }
        }
    });

    // Handle new user joining a room
    socket.on('new user', ({ username, roomId }) => {
        socket.username = username;
        socket.roomId = roomId;

        // Initialize user list for the room if it doesn't exist
        if (!activeUsers[roomId]) {
            activeUsers[roomId] = [];
        }

        // Add the new user to the activeUsers
        activeUsers[roomId].push(username);

        // Join the room
        socket.join(roomId);

        // Emit updated user list to the room
        io.to(roomId).emit('user list', activeUsers);

        // Broadcast a system message that a user has joined the room
        io.to(roomId).emit('chat message', {
            username: 'System',
            message: `${username} has joined the room.`,
        });
    });

    // Handle incoming chat messages
    socket.on('chat message', (data) => {
        // Broadcast the chat message to all connected clients
        io.emit('chat message', { username: socket.username, message: data.message });
    });

    // Emit initial user list to connected clients
    io.emit('user list', activeUsers);
});

// Set the server port (default: 3000 or as provided by environment variable)
const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
