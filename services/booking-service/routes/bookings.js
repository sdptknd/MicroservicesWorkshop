const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

router.post('/', authenticateToken, bookingController.createBooking);
router.get('/', authenticateToken, bookingController.listBookings);
router.get('/:id/receipt', authenticateToken, bookingController.downloadReceipt);

module.exports = router;
