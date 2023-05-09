/*
Drew Bozarth
dbozarth@chapman.edu
Technical-Take-Home : Server : index.js
The server side of the project that sets up the server and has 
socket functions to listen to the client side and emit to the client side
*/
// setup express
const express = require("express");
const app = express();
// need http library to build the server with socket.io
const http = require("http");
// cors is a library that will allow us to use the cors middleware and resolve a lot of issues
const cors = require("cors");
// import the class Server from socket.io library
const { Server } = require("socket.io");
// import the Users class from the Users.js file
const { Users } = require("../client/src/Users");
app.use(cors());
let users = new Users();

// pass in the express app and the we can listen to the server
const server = http.createServer(app);

// create an io connection for the server
// use object with cors to setup settings for the origin of the 
//    socket and which requests are accepted
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// on a connection to the socket (when a user loads the app on localhost:3000)
io.on("connection", (socket) => {
  // print to console the socket.id to check the user loaded 
  console.log(`User Connected: ${socket.id}`);

  // event that passes the room to connect the user to that room, and username to update the list of online users
  socket.on("join_room", (username, room) => {
    socket.join(room);
    users.addUser(socket.id,username,room);
    socket.to(room).emit("updateUsersList", users.getUserList(room));
    console.log(`User with ID: ${socket.id} Name: ${username}joined room: ${room}`);
  });

  // event that will emit the message data to the specified room
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  // event when a user disconnects, it will remove them from the list we are keeping
  //  and it will update that list so the readouts are correct on screen
  socket.on("disconnect", () => {
    let user = users.removeUser(socket.id);
    if (user) {
      console.log(`User Disconnected ${socket.id} User: ${user.name} Room: ${user.room}`);
      socket.to(user.room).emit("updateUsersList", users.getUserList(user.room));
    }
  });
});

// listen on port 3001 (react runs on 3000)
server.listen(3001, () => {
  console.log("Server listening on Port 3000");
});