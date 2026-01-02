require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const { initBot, sendReminders, markGhosted } = require('./services/telegramBot');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Telegram bot
initBot();

// Cron jobs
// Send reminders daily at 9 AM
cron.schedule('0 9 * * *', () => {
  console.log('Running daily reminder check...');
  sendReminders();
});

// Check for ghosted applications daily at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running ghosted check...');
  markGhosted();
});

// Self-ping to prevent Render free tier spin down (every 14 minutes)
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;
if (RENDER_URL) {
  cron.schedule('*/14 * * * *', async () => {
    try {
      const response = await fetch(`${RENDER_URL}/api/health`);
      console.log(`Self-ping: ${response.status} at ${new Date().toISOString()}`);
    } catch (error) {
      console.log('Self-ping failed:', error.message);
    }
  });
  console.log('Self-ping enabled for:', RENDER_URL);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
