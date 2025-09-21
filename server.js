

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// In-memory storage for contacts and reviews (for demo purposes)
let contacts = [];
let reviews = [];
let uploads = [];


// POST /api/contact - handle enquiry form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message, subject } = req.body;
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  // Save contact to memory (simulate DB)
  const contact = {
    id: Date.now().toString(),
    name,
    email,
    phone,
    subject: subject || 'general',
    message,
    date: new Date(),
    status: 'new'
  };
  contacts.push(contact);
  // Configure nodemailer transporter (use environment variables for security)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  // Email content
  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.OWNER_EMAIL,
    subject: 'New Enquiry from Black Squad Gym Website',
    text: `\n      Name: ${name}\n      Email: ${email}\n      Phone: ${phone}\n      Message: ${message}\n    `
  };
  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});


// GET /api/contacts - return all contact submissions
app.get('/api/contacts', (req, res) => {
  res.json({ success: true, contacts });
});

// GET /api/admin-stats - return dashboard stats
app.get('/api/admin-stats', (req, res) => {
  const totalContacts = contacts.length;
  const newContacts = contacts.filter(c => c.status === 'new').length;
  const totalReviews = reviews.length;
  const totalUploads = uploads.length;
  res.json({
    success: true,
    stats: {
      totalContacts,
      newContacts,
      totalReviews,
      totalUploads
    }
  });
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
