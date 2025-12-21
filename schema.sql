-- Schema for contacts table
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
-- show the columns you asked for
SELECT name, email, phone, subject, message FROM contacts ORDER BY date DESC;