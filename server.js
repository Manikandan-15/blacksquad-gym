const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
// Replace 'public' with the name of the folder where you keep style.css and your images

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Use SQLite-backed storage
const { saveContact, getAllContacts, saveReview, getAllReviews, deleteReview } = require('./db');
let uploads = [];


// POST /api/contact - handle enquiry form submission
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message, subject } = req.body;
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  // Save contact to SQLite DB
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
  try {
    await saveContact(contact);
    console.log('Contact saved to DB:', contact.id, contact.email);
  } catch (dbErr) {
    console.error('DB error saving contact:', dbErr);
    return res.status(500).json({ success: false, error: 'Failed to save contact.' });
  }
  // Configure nodemailer transporter (use environment variables for security)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
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
    console.log('Contact notification email sent');
  } catch (err) {
    console.error('Error sending email (notification only):', err);
    // Don't fail the request if email notification fails; contact is already saved.
  }
  // Always respond success for the form submission since data is persisted in DB
  res.json({ success: true, message: 'Message received. Thank you!' });
});


// GET /api/contacts - return all contact submissions
app.get('/api/contacts', (req, res) => {
  getAllContacts()
    .then(rows => res.json({ success: true, contacts: rows }))
    .catch(err => {
      console.error('DB error fetching contacts:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch contacts.' });
    });
});

// GET /api/admin-stats - return dashboard stats
app.get('/api/admin-stats', async (req, res) => {
  try {
    const contacts = await getAllContacts();
    const reviews = await getAllReviews();
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
  } catch (err) {
    console.error('DB error fetching stats:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch stats.' });
  }
});

// PUT /api/contacts/:id - update contact status
app.put('/api/contacts/:id', (req, res) => {
  const { status } = req.body;
  const contactId = req.params.id;
  
  const { db } = require('./db');
  db.run(
    'UPDATE contacts SET status = ? WHERE id = ?',
    [status, contactId],
    function(err) {
      if (err) {
        console.error('DB error updating contact:', err);
        return res.status(500).json({ success: false, error: 'Failed to update contact.' });
      }
      res.json({ success: true, message: 'Contact updated successfully!' });
    }
  );
});

// Review endpoints
app.post('/api/review', async (req, res) => {
  const { reviewName, reviewRating, reviewText } = req.body;
  
  if (!reviewName || !reviewRating || !reviewText) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  
  const review = {
    id: Date.now().toString(),
    name: reviewName,
    rating: parseInt(reviewRating),
    text: reviewText,
    date: new Date()
  };
  
  try {
    // Save review to database
    await saveReview(review);
    
    // Send email notification to admin
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.OWNER_EMAIL,
      subject: `New Review from ${reviewName} - Black Squad Gym`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="background: white; padding: 20px; border-radius: 10px; border-left: 5px solid #ffb300;">
            <h2 style="color: #ffb300;">New Review Submitted!</h2>
            <p><strong>Name:</strong> ${reviewName}</p>
            <p><strong>Rating:</strong> ${stars} (${review.rating}/5)</p>
            <p><strong>Review:</strong></p>
            <p style="background: #f9f9f9; padding: 10px; border-radius: 5px;">${reviewText}</p>
            <p style="color: #666; font-size: 0.9em;">Submitted on: ${new Date(review.date).toLocaleString()}</p>
          </div>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log('Review notification email sent');
    } catch (emailErr) {
      console.error('Error sending review email:', emailErr);
    }
    
    res.json({ success: true, message: 'Review submitted successfully!' });
  } catch (dbErr) {
    console.error('DB error saving review:', dbErr);
    res.status(500).json({ success: false, message: 'Failed to save review.' });
  }
});

// GET /api/reviews - get all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await getAllReviews();
    res.json({ success: true, reviews });
  } catch (err) {
    console.error('DB error fetching reviews:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// DELETE /api/reviews/:id - delete review
app.delete('/api/reviews/:id', async (req, res) => {
  const reviewId = req.params.id;
  try {
    await deleteReview(reviewId);
    res.json({ success: true, message: 'Review deleted successfully!' });
  } catch (err) {
    console.error('DB error deleting review:', err);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});


// Use the port Render assigns (process.env.PORT) or default to 3000 for local testing
const PORT = process.env.PORT || 10000;

// You MUST add '0.0.0.0' so Render can access the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

