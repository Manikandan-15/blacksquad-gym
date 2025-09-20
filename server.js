<<<<<<< HEAD
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// POST /api/contact - handle enquiry form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  // Configure nodemailer transporter (use environment variables for security)
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
      user: process.env.MAIL_USER,      // your email address
      pass: process.env.MAIL_PASS       // your app password (not your main password)
    }
  });

  // Email content
  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.OWNER_EMAIL, // owner's email address
    subject: 'New Enquiry from Black Squad Gym Website',
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Message: ${message}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

document.querySelector('.contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const message = document.getElementById('message').value.trim();
  const terms = document.getElementById('terms').checked;

  if (!name || !email || !phone || !message) {
    showMessage("Please fill in all fields.", "error");
    hideMessage();
    return;
  }
  if (!terms) {
    showMessage("You must agree to the terms & conditions.", "error");
    hideMessage();
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("Please enter a valid email address.", "error");
    hideMessage();
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, message })
    });
    const result = await response.json();
    if (result.success) {
      showMessage("Message sent successfully!", "success");
      this.reset();
    } else {
      showMessage(result.error || "Failed to send message.", "error");
    }
    hideMessage();
  } catch (error) {
    showMessage("Failed to send message. Please check your connection and try again.", "error");
    hideMessage();
  }
});
=======
<<<<<<< HEAD
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// POST /api/contact - handle enquiry form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  // Configure nodemailer transporter (use environment variables for security)
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
      user: process.env.MAIL_USER,      // your email address
      pass: process.env.MAIL_PASS       // your app password (not your main password)
    }
  });

  // Email content
  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.OWNER_EMAIL, // owner's email address
    subject: 'New Enquiry from Black Squad Gym Website',
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Message: ${message}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

document.querySelector('.contact-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const message = document.getElementById('message').value.trim();
  const terms = document.getElementById('terms').checked;

  if (!name || !email || !phone || !message) {
    showMessage("Please fill in all fields.", "error");
    hideMessage();
    return;
  }
  if (!terms) {
    showMessage("You must agree to the terms & conditions.", "error");
    hideMessage();
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("Please enter a valid email address.", "error");
    hideMessage();
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, message })
    });
    const result = await response.json();
    if (result.success) {
      showMessage("Message sent successfully!", "success");
      this.reset();
    } else {
      showMessage(result.error || "Failed to send message.", "error");
    }
    hideMessage();
  } catch (error) {
    showMessage("Failed to send message. Please check your connection and try again.", "error");
    hideMessage();
  }
});
=======

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// Fallback: serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// POST /api/contact - handle enquiry form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  // Configure nodemailer transporter (use environment variables for security)
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
      user: process.env.EMAIL_USER,      // your email address
      pass: process.env.EMAIL_PASS       // your app password (not your main password)
    }
  });

  // Email content
  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.OWNER_EMAIL, // owner's email address
    subject: 'New Enquiry from Black Squad Gym Website',
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Message: ${message}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
});

// In-memory storage for contacts and reviews (for demo purposes)
let contacts = [];
let reviews = [];
let uploads = [];

// POST /api/contact - handle enquiry form submission
// (already exists above, but add saving to contacts array)
// (patching the existing handler)
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

// ...existing code...
>>>>>>> ab60ee1 (Initial commit: Black Squad Gym website with backend and admin dashboard)
>>>>>>> d0eeaea (SMPT has been fixed)
