const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// In-memory stores (replace with DB in production)
const contacts = [];
const reviews = [];

// Configure nodemailer transporter (moved outside to reuse)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  secure: true,
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// POST /api/contact - handle enquiry form submission and store for admin
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // Enhanced validation
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  // Phone validation
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
    return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
  }

  const contact = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    phone,
    subject: subject || 'general',
    message,
    status: 'new',
    date: new Date().toISOString()
  };
  contacts.unshift(contact);

  // Enhanced email template
  const emailContent = `
🏋️ NEW ENQUIRY FROM BLACK SQUAD GYM WEBSITE
=============================================

📋 CONTACT DETAILS:
Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${contact.subject.toUpperCase()}

💬 MESSAGE:
${message}

📅 Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

---
This enquiry has been automatically stored in your admin system.
Reply directly to this email to contact the customer.
  `;

  const mailOptions = {
    from: `"Black Squad Gym Website" <${process.env.EMAIL_USER}>`,
    to: process.env.OWNER_EMAIL,
    replyTo: email, // Allow direct reply to customer
    subject: `🏋️ New Enquiry: ${contact.subject.toUpperCase()} - ${name}`,
    text: emailContent,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a1a1a, #333); color: #ffb300; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0; text-align: center;">🏋️ BLACK SQUAD GYM</h2>
          <p style="margin: 5px 0 0 0; text-align: center; color: #ccc;">New Website Enquiry</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="color: #333; border-bottom: 2px solid #ffb300; padding-bottom: 10px;">Contact Details</h3>
          <table style="width: 100%; margin-bottom: 20px;">
            <tr><td style="padding: 5px 0; font-weight: bold; width: 80px;">Name:</td><td style="padding: 5px 0;">${name}</td></tr>
            <tr><td style="padding: 5px 0; font-weight: bold;">Email:</td><td style="padding: 5px 0;"><a href="mailto:${email}" style="color: #ffb300;">${email}</a></td></tr>
            <tr><td style="padding: 5px 0; font-weight: bold;">Phone:</td><td style="padding: 5px 0;"><a href="tel:${phone}" style="color: #ffb300;">${phone}</a></td></tr>
            <tr><td style="padding: 5px 0; font-weight: bold;">Subject:</td><td style="padding: 5px 0; background: #ffb300; color: white; padding: 5px 10px; border-radius: 15px; display: inline-block;">${contact.subject.toUpperCase()}</td></tr>
          </table>
          
          <h3 style="color: #333; border-bottom: 2px solid #ffb300; padding-bottom: 10px;">Message</h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #ffb300;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          <p style="margin-top: 20px; color: #666; font-size: 12px; text-align: center;">
            📅 Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}<br>
            💡 Tip: Reply directly to this email to contact the customer
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`New contact enquiry sent to ${process.env.OWNER_EMAIL} from ${name} (${email})`);
    res.json({ success: true, message: 'Thank you for your enquiry! We\'ll get back to you within 24 hours.' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Sorry, there was an issue sending your message. Please try again or contact us directly.' 
    });
  }
});

// Admin: list contacts
app.get('/api/contacts', (req, res) => {
  res.json({ success: true, contacts });
});

// Admin: update contact status
app.patch('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const contact = contacts.find(c => c.id === id);
  if (!contact) {
    return res.status(404).json({ success: false, message: 'Contact not found.' });
  }
  
  contact.status = status;
  res.json({ success: true, message: 'Contact status updated.', contact });
});

// Admin: simple stats
app.get('/api/admin-stats', (req, res) => {
  const stats = {
    totalContacts: contacts.length,
    newContacts: contacts.filter(c => c.status === 'new').length,
    resolvedContacts: contacts.filter(c => c.status === 'resolved').length,
    totalReviews: reviews.length,
    averageRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0
  };
  res.json({ success: true, stats });
});

// Reviews API used by index.html
app.get('/api/reviews', (req, res) => {
  // Sort by date, newest first
  const sortedReviews = reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json({ success: true, reviews: sortedReviews });
});

app.post('/api/review', (req, res) => {
  const { reviewName, reviewRating, reviewText } = req.body;
  
  if (!reviewName || !reviewRating || !reviewText) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  
  if (reviewRating < 1 || reviewRating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
  }
  
  const review = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: reviewName.trim(),
    rating: Number(reviewRating),
    text: reviewText.trim(),
    date: new Date().toISOString()
  };
  
  reviews.unshift(review);
  console.log(`New review submitted by ${review.name} - ${review.rating} stars`);
  res.json({ success: true, message: 'Thank you for your review! It has been published.', review });
});

app.delete('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  const index = reviews.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Review not found.' });
  
  const deletedReview = reviews.splice(index, 1)[0];
  console.log(`Review deleted: ${deletedReview.name} - ${deletedReview.rating} stars`);
  res.json({ success: true, message: 'Review deleted successfully.' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Black Squad Gym API is running',
    timestamp: new Date().toISOString(),
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.OWNER_EMAIL)
  });
});

// Fallback to index for unknown routes when serving statically
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🏋️ Black Squad Gym server running on port ${PORT}`);
  console.log(`📧 Email configured: ${!!(process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.OWNER_EMAIL)}`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
});