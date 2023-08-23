// Initialize Socket.io connection
const socket = io();

// Prompt user for username and room ID
const username = prompt('Enter your username:');
if (username) {
    const roomId = prompt('Enter a unique room ID:');
    if (roomId) {
        // Emit 'new user' event to the server with username and room ID
        socket.emit('new user', { username, roomId });
        // Display a welcome popup to the user
        displayWelcomePopup();
    }
}

// Display a welcome popup to the user
function displayWelcomePopup() {
    const welcomeMessage = `
        Welcome to the chat room!
        Remember, you can use the following commands:
        /info - Display information about the chat app
        /help - Display help for using special words
    `;

    alert(welcomeMessage);
}

// Handle form submission
document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('input');
    if (input.value) {
        let message = input.value.trim();

        if (message === '/help') {
            displayHelp();
        } else if (message === '/info') {
            displayInfo();
        } else {
            message = replaceSpecialWordsWithEmojis(message);
            // Emit 'chat message' event to the server with username and message
            socket.emit('chat message', { username, message });
        }

        input.value = '';
    }
});

// Replace special words with emojis in a message
function replaceSpecialWordsWithEmojis(message) {
    // Object mapping special words to emojis
    const specialWordsToEmojis = {
        react: '⚛',
        hey: '👋',
        woah: '😲',
        like: '❤︎',
        lol: '😂',
        congratulations: '🎉'
    };

    const words = message.split(' ');
    const replacedWords = words.map(word => {
        const lowerCaseWord = word.toLowerCase();
        if (specialWordsToEmojis.hasOwnProperty(lowerCaseWord)) {
            return specialWordsToEmojis[lowerCaseWord];
        }
        return word;
    });

    return replacedWords.join(' ');
}

// Display help message in the chat
function displayHelp() {
    // Help message with list of special words and corresponding emojis
    const helpMessage = `
        Special words that will be converted to emojis:
        /help - Display this help message
        /info - Display information about the chat app
        react - ⚛
        hey - 👋
        woah - 😲
        like - ❤︎
        lol - 😂
        congratulations - 🎉
    `;

    const messages = document.getElementById('messages');
    const helpItem = document.createElement('li');
    helpItem.classList.add('help-message');
    helpItem.innerHTML = helpMessage;
    messages.appendChild(helpItem);
}

// Display information message in the chat
function displayInfo() {
    // Information message about the chat app
    const infoMessage = `
        Chat App Information:
        This is a simple chat app built with Node.js and Socket.io.
        It allows users to communicate in real-time chat rooms.
        Made by Chat GPT (With the help of Pranil)
    `;

    const messages = document.getElementById('messages');
    const infoItem = document.createElement('li');
    infoItem.classList.add('info-message');
    infoItem.innerHTML = infoMessage;
    messages.appendChild(infoItem);
}

// Listen for 'chat message' event from the server
socket.on('chat message', (data) => {
    // Add received message to the chat messages list
    const messages = document.getElementById('messages');
    const item = document.createElement('li');
    item.textContent = `${data.username}: ${data.message}`;
    messages.appendChild(item);
});

// Listen for 'user list' event from the server
socket.on('user list', (rooms) => {
    // Update user list with room information and users
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    for (const roomId in rooms) {
        const roomHeader = document.createElement('h3');
        roomHeader.textContent = `Room: ${roomId}`;
        userList.appendChild(roomHeader);

        const roomUsers = rooms[roomId];
        const roomList = document.createElement('ul');
        roomUsers.forEach((user) => {
            const item = document.createElement('li');
            item.textContent = user;
            roomList.appendChild(item);
        });
        userList.appendChild(roomList);
    }
});
