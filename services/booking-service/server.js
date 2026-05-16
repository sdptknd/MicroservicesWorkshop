const express = require('express');
const cors = require('cors');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[Booking Service] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/bookings', bookingRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'booking-service' });
});

app.listen(PORT, () => {
  console.log(`Booking Service running on port ${PORT}`);
});
