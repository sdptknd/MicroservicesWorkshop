const bookingService = require('../services/bookingService');

class BookingController {
  async createBooking(req, res) {
    try {
      const { hotel_id, rooms } = req.body;
      const user_id = req.user.id;
      const requestedRooms = rooms || 1;

      if (!hotel_id) {
        return res.status(400).json({ error: 'hotel_id is required' });
      }

      const bookingId = await bookingService.createBooking(user_id, hotel_id, requestedRooms);
      res.status(201).json({ message: 'Booking successful', booking_id: bookingId });
    } catch (err) {
      console.error(err);
      if (err.message === 'Not enough rooms available' || err.message === 'Hotel not found') {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async listBookings(req, res) {
    try {
      const bookings = await bookingService.getUserBookings(req.user.id);
      res.json(bookings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async downloadReceipt(req, res) {
    try {
      const bookingId = req.params.id;
      const userId = req.user.id;
      
      const filePath = await bookingService.getReceiptPath(bookingId, userId);
      res.download(filePath);
    } catch (err) {
      console.error(err);
      if (err.message === 'Booking not found or unauthorized' || err.message === 'Receipt not generated yet' || err.message === 'Receipt file missing') {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new BookingController();
