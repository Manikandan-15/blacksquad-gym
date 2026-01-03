
# Black Squad Gym Website

A modern, responsive gym website with contact form and review system backend.

## Features

- 🏋️ **Single Page Application** - Smooth scrolling navigation
- 📱 **Mobile-First Design** - Optimized for all devices
- 📧 **Contact Form** - Sends emails to gym owner
- ⭐ **Review System** - Users can submit testimonials
- 🎨 **Modern UI** - Attractive design with animations

## Backend Setup

### Prerequisites
- Node.js (v14 or higher)
- Gmail account for sending emails

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Email Settings**
   - Copy `env.example` to `.env`
   - Update the following variables:
     ```
     EMAIL_USER=your-gmail@gmail.com
     EMAIL_PASS=your-app-password
     OWNER_EMAIL=owner@blacksquadgym.com
     ```

3. **Gmail App Password Setup**
   - Go to Google Account Settings
   - Enable 2-Factor Authentication
   - Generate App Password for "Mail"
   - Use this password in EMAIL_PASS

### Running the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Contact Form
- **POST** `/api/contact`
- Sends contact form data to owner email
- Fields: name, email, phone, message

### Review Submission
- **POST** `/api/review`
- Sends review data to owner email
- Fields: reviewName, reviewRating, reviewText

## Email Templates

Both contact forms and reviews are sent as beautifully formatted HTML emails with:
- Professional styling
- All form data clearly displayed
- Gym branding colors
- Responsive design

## Security Features

- Input validation
- Error handling
- CORS enabled
- Environment variable protection

## File Structure

```
blacksquad/
├── index.html          # Main website
├── server.js           # Backend server
├── package.json        # Dependencies
├── env.example         # Environment template
└── README.md          # This file
```

## Customization

- Update gym information in `index.html`
- Modify email templates in `server.js`
- Change colors and styling in CSS
- Add more features as needed

