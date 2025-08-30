const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(cors());
app.use(express.static('public'));

// io
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
  setInterval(() => {
    socket.emit('number', parseInt(Math.random() * 10));
  }, 1000);
});

// routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));

//app.get('/', (req, res) => res.send('Little Pal API is running'));

http.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
