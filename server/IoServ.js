const io = require("socket.io")(3000, {
  cors: {
    origin: "http://localhost:8080",
  },
});

io.on('connection', socket => {
  socket.emit('chat-message', 'Hello World')
})