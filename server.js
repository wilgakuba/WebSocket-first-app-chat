const express = require("express");
const path = require("path");
const socket = require("socket.io");

const app = express();

const messages = [];
const users = [];

app.use(express.static(path.join(__dirname, "/client")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/client/index.html"));
});

const server = app.listen(process.env.PORT || 8000, () => {
  console.log("Server is running on port: 8000");
});

const io = socket(server);
io.on("connection", (socket) => {
  console.log('New client! Its id – ' + socket.id);

  socket.on('join', (userName) => {
	console.log(`Oh, new user ${userName} has joined the chat!`);
	users.push({ id: socket.id, name: userName });
	socket.broadcast.emit('message', {
		author: "ChatBot",
		content: `<i>${userName} has joined the conversation!`,
	});
  });
  socket.on("message", (message) => {
    console.log("Oh, I've got something from " + socket.id);
    messages.push(message);
    socket.broadcast.emit("message", message);
  });
  socket.on('disconnect', () => {
    const user = users.find((user) => user.id === socket.id);
    socket.broadcast.emit('message', {
        author: 'chatbot',
        content: `<i>${user.name} has left the conversation... `,
    });
});
});