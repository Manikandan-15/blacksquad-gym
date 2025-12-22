const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const root = __dirname;
const dataDir = path.join(root, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'contacts.db');
const schemaPath = path.join(root, 'schema.sql');

const schema = fs.readFileSync(schemaPath, 'utf8');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Failed to open DB:', err.message);
  console.log('Opened DB at', dbPath);
  db.exec(schema, (err) => {
    if (err) {
      console.error('Failed to execute schema:', err.message);
      process.exit(1);
    }
    console.log('Schema executed successfully.');
    db.close();
  });
});
