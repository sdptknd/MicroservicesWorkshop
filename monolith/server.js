const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logger to see blocking behavior
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'monolith' });
});

app.listen(PORT, () => {
  console.log(`Monolith API Server running on port ${PORT}`);
});
