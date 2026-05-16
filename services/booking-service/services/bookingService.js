const bookingRepository = require('../repositories/bookingRepository');
const axios = require('axios');
const Redis = require('ioredis');

// Redis Setup
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: 6379,
});

class BookingService {
  async createBooking(userId, hotelId, roomCount = 1) {
    // 1. Cross-module check with Search Service for availability
    const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://search-service:8080';
    
    try {
      await axios.post(`${SEARCH_SERVICE_URL}/api/search/hotels/${hotelId}/book`, { roomCount });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        throw new Error('ROOMS_NOT_AVAILABLE');
      }
      throw new Error('SEARCH_SERVICE_DOWN');
    }

    // 2. Create the booking record (Defaults to PENDING)
    const booking = await bookingRepository.createBooking(userId, hotelId);
    
    // 3. NEW: Publish task to Redis Queue for the Worker
    console.log(`[Booking Service] Offloading PDF generation for booking ${booking.id} to queue...`);
    await redis.lpush('receipt_queue', JSON.stringify({
      bookingId: booking.id,
      userId: userId,
      hotelId: hotelId
    }));

    // 4. Return immediately!
    return booking.id;
  }

  async getUserBookings(userId) {
    return bookingRepository.getUserBookings(userId);
  }

  async getReceiptPath(bookingId, userId) {
    const booking = await bookingRepository.getBookingByIdAndUser(bookingId, userId);
    if (!booking) {
      throw new Error('Booking not found or unauthorized');
    }
    if (booking.status === 'PENDING') {
      throw new Error('Receipt not generated yet');
    }
    if (!booking.receipt_path) {
      throw new Error('Receipt file missing');
    }
    
    // Note: The PDFS_DIR is now in a shared volume
    const path = require('path');
    const fs = require('fs');
    const PDFS_DIR = path.join(__dirname, '..', 'pdfs');
    const filePath = path.join(PDFS_DIR, booking.receipt_path);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Receipt file missing on disk');
    }
    
    return filePath;
  }
}

module.exports = new BookingService();
