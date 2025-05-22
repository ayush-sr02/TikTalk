const {Server} = require('socket.io');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },
})
//A map to store online users
const userSocketMap = {};

const getReceiverSocketId = (userId) => {
    return userSocketMap[userId];
}

io.on("connect", (socket) => {
    console.log("User connected: ", socket.id);
    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = socket.id;
    //broadcast online status to all connected users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        console.log("User disconnected: ", socket.id);
    })
})

module.exports = {app, server, io, getReceiverSocketId};
