const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
  transports: ['websocket', 'polling']
});

// Ana dizindeki HTML dosyalarını (index.html ve dj.html) sun
app.use(express.static(__dirname));

const DJ_PASSWORD = process.env.DJ_PASSWORD || 'Eczacibasi1966!';

let currentShowState = {
  mode: 'IDLE',
  speed: 150,
  timestamp: Date.now()
};

io.on('connection', (socket) => {
  socket.emit('show_command', currentShowState);
  io.emit('fan_count', io.engine.clientsCount);

  socket.on('dj_auth', (password, callback) => {
    if (password === DJ_PASSWORD) {
      socket.isDJ = true;
      callback({ success: true });
    } else {
      callback({ success: false, message: 'Hatalı Reji Şifresi!' });
    }
  });

  socket.on('dj_trigger', (payload) => {
    if (!socket.isDJ) return;

    currentShowState = {
      mode: payload.mode,
      speed: payload.speed || 150,
      duration: payload.duration || 10,
      startTime: Date.now(),
      timestamp: Date.now()
    };

    io.emit('show_command', currentShowState);
  });

  socket.on('disconnect', () => {
    io.emit('fan_count', io.engine.clientsCount);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Eczacibasi Arena Light Show sunucusu ${PORT} portunda calisiyor.`);
});