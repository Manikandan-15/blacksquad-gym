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

module.exports = {
  db,
  saveContact,
  getAllContacts,
};
