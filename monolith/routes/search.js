const express = require('express');
const router = express.Router();

// Mock hotel data
const hotels = [
  { id: 1, name: 'Grand Plaza', city: 'New York', price_per_night: 200 },
  { id: 2, name: 'Ocean View Resort', city: 'Miami', price_per_night: 150 },
  { id: 3, name: 'Mountain Retreat', city: 'Denver', price_per_night: 120 },
  { id: 4, name: 'City Center Inn', city: 'New York', price_per_night: 100 },
];

router.get('/hotels', (req, res) => {
  const { city } = req.query;
  
  let results = hotels;
  if (city) {
    results = hotels.filter(h => h.city.toLowerCase() === city.toLowerCase());
  }

  res.json(results);
});

module.exports = router;
