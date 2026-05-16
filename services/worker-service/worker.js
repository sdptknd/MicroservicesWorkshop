const Redis = require('ioredis');
const { Pool } = require('pg');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// DB Setup
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Redis Setup
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: 6379,
});

const PDFS_DIR = path.join(__dirname, 'pdfs');
if (!fs.existsSync(PDFS_DIR)) {
  fs.mkdirSync(PDFS_DIR);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function processQueue() {
  console.log('Worker Service started. Waiting for jobs...');

  while (true) {
    try {
      // BRPOP returns [queueName, message]
      // 0 means wait indefinitely
      const data = await redis.brpop('receipt_queue', 0);
      const message = JSON.parse(data[1]);
      const { bookingId, userId, hotelId } = message;

      console.log(`[Worker] Processing booking ${bookingId} for user ${userId}...`);

      // 1. Simulate heavy work (30 seconds)
      await sleep(30000);

      // 2. Generate PDF
      const fileName = `receipt_${bookingId}.pdf`;
      const filePath = path.join(PDFS_DIR, fileName);
      await generatePDF(filePath, bookingId, userId, hotelId);

      // 3. Update Database
      await pool.query(
        'UPDATE booking_schema.bookings SET status = $1, receipt_path = $2 WHERE id = $3',
        ['COMPLETED', fileName, bookingId]
      );

      console.log(`[Worker] Finished booking ${bookingId}. Status updated to COMPLETED.`);
    } catch (err) {
      console.error('[Worker] Error processing job:', err);
    }
  }
}

function generatePDF(filePath, bookingId, userId, hotelId) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    
    doc.fontSize(25).text('Booking Receipt (Async)', 100, 100);
    doc.fontSize(15).text(`Booking ID: ${bookingId}`, 100, 150);
    doc.text(`User ID: ${userId}`, 100, 170);
    doc.text(`Hotel ID: ${hotelId}`, 100, 190);
    doc.text(`Status: Confirmed & Processed`, 100, 210);
    doc.text(`Generated At: ${new Date().toISOString()}`, 100, 230);
    
    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

processQueue();
