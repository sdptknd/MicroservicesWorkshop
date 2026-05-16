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
      res.status(201).json({ 
        message: 'Booking successful! Your receipt is being generated.', 
        booking_id: bookingId 
      });
    } catch (err) {
      console.error(`[Booking Controller] Error: ${err.message}`);
      
      if (err.message === 'ROOMS_NOT_AVAILABLE') {
        return res.status(400).json({ error: 'No rooms available for the selected hotel.' });
      }
      
      if (err.message === 'SEARCH_SERVICE_DOWN') {
        return res.status(503).json({ error: 'Search service is currently unavailable. Please try again later.' });
      }

      res.status(500).json({ error: 'An internal error occurred in the booking service.' });
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
