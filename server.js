const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is required but not set in environment variables');
  console.log('💡 Please create a .env file with your OpenAI API key');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// connect to MongoDB (make sure config/db.js exists)
require('./config/db')();

// API routes (new MVC structure)
app.use('/api/auth', require('./app/routes/auth.routes'));
app.use('/api/memos', require('./app/routes/memos.routes'));
app.use('/api/pet', require('./app/routes/pet.routes'));
app.use('/api/chat', require('./app/routes/chat.routes'));
app.use('/api/notifications', require('./app/routes/notifications.routes'));


// make io available inside req.app
app.set('io', io);

// Broadcast a pet state update to everyone in that pet's room. */
const broadcastPetUpdate = (petId, payload) => {
  io.to(`pet:${petId}`).emit('pet:update', payload);
};
app.set('broadcastPetUpdate', broadcastPetUpdate);

// homepage (serves the static index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// socket.io setup
io.on('connection', (socket) => {
  console.log('⚡ New client:', socket.id);

  socket.on('join', ({ userId }) => {
    socket.join(`room:${userId}`);
    console.log(`👤 User ${userId} joined room:${userId}`);
  });

  // per-pet rooms for realtime pet updates 
  socket.on('join-pet', ({ petId }) => {
    if (petId) {
      socket.join(`pet:${petId}`);
      console.log(`🐾 Socket ${socket.id} joined pet room: pet:${petId}`);
      socket.emit('joined-pet', { room: `pet:${petId}` });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// --- JSON error handler ---
app.use((err, req, res, _next) => {
  console.error(err);

  const isCast = err?.name === 'CastError';
  const status = isCast ? 400 : (err.status || 500);

  res.status(status).json({
    code: isCast ? 'BAD_ID' : (err.code || 'INTERNAL_ERROR'),
    message: err.message || 'Internal Server Error'
  });
});

// start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
