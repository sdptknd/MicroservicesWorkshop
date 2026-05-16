const bookingRepository = require('../repositories/bookingRepository');
const axios = require('axios');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const PDFS_DIR = path.join(__dirname, '..', 'pdfs');
if (!fs.existsSync(PDFS_DIR)) {
  fs.mkdirSync(PDFS_DIR);
}

// Helper to simulate blocking operation
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class BookingService {
  async createBooking(userId, hotelId, roomCount = 1) {
    // 1. Cross-module check with Search Service for availability and to decrement
    // In this step, we make a synchronous HTTP call to the new .NET Search Service.
    const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://search-service:8080';
    
    try {
      await axios.post(`${SEARCH_SERVICE_URL}/api/search/hotels/${hotelId}/book`, { roomCount });
    } catch (error) {
      console.error('[Booking Service] Failed to verify availability:', error.message);
      throw new Error('Rooms not available or Search Service is down');
    }

    // 2. Create the booking record
    const booking = await bookingRepository.createBooking(userId, hotelId);
    
    // 3. Intentional blocking delay to demonstrate monolith scaling issues (30 seconds)
    console.log(`[Booking ${booking.id}] Starting synchronous PDF generation. This will block...`);
    await sleep(3000); 

    // 4. Generate PDF
    const fileName = await this._generatePDFReceipt(booking.id, userId, hotelId);

    // 5. Update DB with receipt path
    await bookingRepository.updateReceiptPath(booking.id, fileName);
    console.log(`[Booking ${booking.id}] PDF generation complete.`);

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
    if (!booking.receipt_path) {
      throw new Error('Receipt not generated yet');
    }
    
    const filePath = path.join(PDFS_DIR, booking.receipt_path);
    if (!fs.existsSync(filePath)) {
      throw new Error('Receipt file missing');
    }
    
    return filePath;
  }

  _generatePDFReceipt(bookingId, userId, hotelId) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const fileName = `receipt_${bookingId}.pdf`;
      const filePath = path.join(PDFS_DIR, fileName);
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      doc.fontSize(25).text('Booking Receipt', 100, 100);
      doc.fontSize(15).text(`Booking ID: ${bookingId}`, 100, 150);
      doc.text(`User ID: ${userId}`, 100, 170);
      doc.text(`Hotel ID: ${hotelId}`, 100, 190);
      doc.text(`Status: Confirmed`, 100, 210);
      
      doc.end();
      
      stream.on('finish', () => resolve(fileName));
      stream.on('error', reject);
    });
  }
}

module.exports = new BookingService();
