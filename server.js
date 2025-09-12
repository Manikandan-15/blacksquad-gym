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