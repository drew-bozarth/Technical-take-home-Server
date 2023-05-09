const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { Users } = require("../client/src/Users");
app.use(cors());
let users = new Users();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (username, room) => {
    socket.join(room);
    users.addUser(socket.id,username,room);
    socket.to(room).emit("updateUsersList", users.getUserList(room));
    console.log(`User with ID: ${socket.id} Name: ${username}joined room: ${room}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    let user = users.removeUser(socket.id);
    if (user) {
      console.log(`User Disconnected ${socket.id} User: ${user.name} Room: ${user.room}`);
      socket.to(user.room).emit("updateUsersList", users.getUserList(user.room));
    }
  });
});

server.listen(3001, () => {
  console.log("Server listening on Port 3000");
});