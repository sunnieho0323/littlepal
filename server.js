const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));

app.get('/', (req, res) => res.send('Little Pal API is running'));
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
