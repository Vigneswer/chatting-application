const path = require("path");
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http, {
  cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, "public")));

const users = new Map(); // socket.id -> { username }

// Socket.io connection
io.on("connection", (socket) => {
//   console.log("⚡ User connected:", socket.id);

  // user joins
  socket.on("user:join", (username) => {
    users.set(socket.id, { username });
    socket.broadcast.emit("system", `${username} joined the chat`);
  });

  // message from user
  socket.on("chat:message", (text) => {
    const user = users.get(socket.id);
    if (!user) return;
    const msg = { username: user.username, text, ts: Date.now() };
    io.emit("chat:message", msg);
  });

 

  // disconnect
  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit("system", `${user.username} left the chat`);
      users.delete(socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`✅ Chat server running at http://localhost:${PORT}`);
});
