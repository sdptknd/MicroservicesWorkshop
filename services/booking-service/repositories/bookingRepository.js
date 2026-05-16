const db = require('../db');

class BookingRepository {
  async createBooking(userId, hotelId) {
    const result = await db.query(
      "INSERT INTO booking_schema.bookings (user_id, hotel_id, status) VALUES ($1, $2, 'confirmed') RETURNING id",
      [userId, hotelId]
    );
    return result.rows[0];
  }

  async updateReceiptPath(bookingId, receiptPath) {
    await db.query(
      "UPDATE booking_schema.bookings SET receipt_path = $1 WHERE id = $2",
      [receiptPath, bookingId]
    );
  }

  async getUserBookings(userId) {
    const result = await db.query(
      "SELECT id, hotel_id, status, receipt_path FROM booking_schema.bookings WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );
    return result.rows;
  }

  async getBookingByIdAndUser(bookingId, userId) {
    const result = await db.query(
      "SELECT * FROM booking_schema.bookings WHERE id = $1 AND user_id = $2",
      [bookingId, userId]
    );
    return result.rows[0];
  }
}

module.exports = new BookingRepository();
