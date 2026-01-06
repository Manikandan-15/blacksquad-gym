const { Pool } = require('pg');
require('dotenv').config();

// 1. Connect to PostgreSQL
// We use a "Pool" which handles multiple connections efficiently
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render's secure connection
  }
});

console.log("Attempting to connect to PostgreSQL...");

// 2. Initialize Tables (Auto-run on start)
const initDb = async () => {
  try {
    // Create Contacts Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL
      );
    `);

    // Create Reviews Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        text TEXT NOT NULL,
        date TEXT NOT NULL
      );
    `);
    
    console.log("✅ Database tables are ready.");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  }
};

// Run the initialization immediately
initDb();

// --- DATABASE FUNCTIONS ---

function saveContact(contact) {
  return new Promise((resolve, reject) => {
    // Postgres uses $1, $2, $3 instead of ?
    const query = `
      INSERT INTO contacts (id, name, email, phone, subject, message, date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      contact.id,
      contact.name,
      contact.email,
      contact.phone,
      contact.subject,
      contact.message,
      contact.date.toString(),
      contact.status
    ];

    pool.query(query, values, (err, res) => {
      if (err) return reject(err);
      resolve(res.rows[0]);
    });
  });
}

function getAllContacts() {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM contacts ORDER BY date DESC', (err, res) => {
      if (err) return reject(err);
      resolve(res.rows);
    });
  });
}

function saveReview(review) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO reviews (id, name, rating, text, date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      review.id,
      review.name,
      review.rating,
      review.text,
      review.date.toString()
    ];

    pool.query(query, values, (err, res) => {
      if (err) return reject(err);
      resolve(res.rows[0]);
    });
  });
}

function getAllReviews() {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM reviews ORDER BY date DESC', (err, res) => {
      if (err) return reject(err);
      resolve(res.rows || []);
    });
  });
}

function deleteReview(reviewId) {
  return new Promise((resolve, reject) => {
    pool.query('DELETE FROM reviews WHERE id = $1', [reviewId], (err, res) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

// Export the same functions so server.js doesn't break
module.exports = {
  saveContact,
  getAllContacts,
  saveReview,
  getAllReviews,
  deleteReview,
};
