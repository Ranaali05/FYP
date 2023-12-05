// server.js
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname)); // Serve your React app here

let canvasData = ''; // Store the canvas image data

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle drawing events
  socket.on('draw', (data) => {
    // Broadcast the drawing data to all clients except the sender
    socket.broadcast.emit('draw', data);
  });

  // Handle clearing the canvas
  socket.on('clearCanvas', () => {
    canvasData = '';
    io.emit('canvasData', canvasData);
  });

  // Handle requesting the canvas data
  socket.on('getCanvas', () => {
    if (canvasData) {
      socket.emit('canvasData', canvasData);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
