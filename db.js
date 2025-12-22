const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'contacts.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Could not open DB', err.message);
  console.log('Connected to SQLite database at', dbPath);
});

// Initialize tables
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL
    )`
  );
  
  db.run(
    `CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      text TEXT NOT NULL,
      date TEXT NOT NULL
    )`
  );
  
  // Add sample reviews if table is empty
  db.all('SELECT COUNT(*) as count FROM reviews', (err, rows) => {
    if (!err && rows[0].count === 0) {
      const sampleReviews = [
        {
          id: '1',
          name: 'Harinath',
          rating: 5,
          text: 'Best gym in the city! The equipment is top-notch and the trainers are very professional. I have seen amazing results in just 3 months!',
          date: new Date(Date.now() - 30*24*60*60*1000).toISOString()
        },
        {
          id: '2',
          name: 'Siva',
          rating: 5,
          text: 'Incredible transformation! The personal training sessions helped me achieve my fitness goals. Highly recommend Black Squad Gym!',
          date: new Date(Date.now() - 20*24*60*60*1000).toISOString()
        },
        {
          id: '3',
          name: 'Razeen',
          rating: 5,
          text: 'Great facility with modern equipment. The atmosphere is motivating and the staff is very helpful. Would love more yoga classes.',
          date: new Date(Date.now() - 10*24*60*60*1000).toISOString()
        },
        {
          id: '4',
          name: 'Javeed JD',
          rating: 5,
          text: 'Amazing experience! The nutrition consultation helped me understand my diet better. Combined with the training, I feel completely transformed!',
          date: new Date(Date.now() - 5*24*60*60*1000).toISOString()
        }
      ];
      
      sampleReviews.forEach(review => {
        db.run(
          `INSERT INTO reviews (id, name, rating, text, date) VALUES (?, ?, ?, ?, ?)`,
          [review.id, review.name, review.rating, review.text, review.date],
          (err) => {
            if (!err) console.log(`Sample review added: ${review.name}`);
          }
        );
      });
    }
  });
});

function saveContact(contact) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      `INSERT INTO contacts (id, name, email, phone, subject, message, date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(
      contact.id,
      contact.name,
      contact.email,
      contact.phone,
      contact.subject,
      contact.message,
      contact.date.toString(),
      contact.status,
      function (err) {
        if (err) return reject(err);
        resolve(contact);
      }
    );
    stmt.finalize();
  });
}

function getAllContacts() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM contacts ORDER BY date DESC`, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function saveReview(review) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      `INSERT INTO reviews (id, name, rating, text, date)
       VALUES (?, ?, ?, ?, ?)`
    );
    stmt.run(
      review.id,
      review.name,
      review.rating,
      review.text,
      review.date.toString(),
      function (err) {
        if (err) return reject(err);
        resolve(review);
      }
    );
    stmt.finalize();
  });
}

function getAllReviews() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM reviews ORDER BY date DESC`, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function deleteReview(reviewId) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM reviews WHERE id = ?`, [reviewId], function(err) {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

module.exports = {
  db,
  saveContact,
  getAllContacts,
  saveReview,
  getAllReviews,
  deleteReview,
};
