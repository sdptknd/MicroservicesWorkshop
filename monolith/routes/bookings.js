const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const PDFS_DIR = path.join(__dirname, '..', 'pdfs');
if (!fs.existsSync(PDFS_DIR)) {
  fs.mkdirSync(PDFS_DIR);
}

// Helper to simulate blocking operation
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate a fake PDF synchronously (simulating heavy load)
async function generatePDFReceipt(bookingId, userId, hotelId) {
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

// Create a booking
router.post('/', authenticateToken, async (req, res) => {
  const { hotel_id } = req.body;
  const user_id = req.user.id;

  if (!hotel_id) {
    return res.status(400).json({ error: 'hotel_id is required' });
  }

  try {
    // 1. Save booking to DB
    const result = await db.query(
      "INSERT INTO bookings (user_id, hotel_id, status) VALUES ($1, $2, 'confirmed') RETURNING id",
      [user_id, hotel_id]
    );
    const bookingId = result.rows[0].id;

    // 2. Intentional blocking delay to demonstrate monolith scaling issues (30 seconds)
    console.log(`[Booking ${bookingId}] Starting synchronous PDF generation. This will block...`);
    await sleep(30000); 

    // 3. Generate PDF
    const fileName = await generatePDFReceipt(bookingId, user_id, hotel_id);

    // 4. Update DB with receipt path
    await db.query(
      "UPDATE bookings SET receipt_path = $1 WHERE id = $2",
      [fileName, bookingId]
    );
    
    console.log(`[Booking ${bookingId}] PDF generation complete.`);
    res.status(201).json({ message: 'Booking successful', booking_id: bookingId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List user's bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, hotel_id, status, receipt_path FROM bookings WHERE user_id = $1 ORDER BY id DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download receipt PDF
router.get('/:id/receipt', authenticateToken, async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      "SELECT receipt_path FROM bookings WHERE id = $1 AND user_id = $2",
      [bookingId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    const fileName = result.rows[0].receipt_path;
    if (!fileName) {
      return res.status(404).json({ error: 'Receipt not generated yet' });
    }

    const filePath = path.join(PDFS_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Receipt file missing' });
    }

    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
