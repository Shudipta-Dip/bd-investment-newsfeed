const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const routes = require('./routes');
const { scrapeAll } = require('./services/scraper');
const { purgeOldArticles } = require('./models');

const app = express();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

// Restricted CORS configuration to prevent unauthorized origins from calling the API
const allowedOrigins = [
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : []),
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
].map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or curl requests (no Origin header)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  }
}));

// Parse incoming JSON payloads
app.use(express.json());

// Parse URL-encoded payloads (form submissions)
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.use('/api', routes);

// ---------------------------------------------------------------------------
// Data Intelligence Automation Schedule
// ---------------------------------------------------------------------------
// Trigger the massive global AI scraper every 3 hours
cron.schedule('0 */3 * * *', async () => {
  console.log('==================================================');
  console.log('CRON: Triggering automated 3-hour intelligence sweep...');
  console.log('==================================================');
  try {
    await scrapeAll();
  } catch (err) {
    console.error('CRON FAILED:', err);
  }
});

// Purge articles older than 60 days — runs daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('CRON: Running 60-day archive purge...');
  try {
    const { count, error } = await purgeOldArticles();
    if (error) console.error('Purge error:', error);
    else console.log(`Purge complete: removed ${count} articles older than 60 days.`);
  } catch (err) {
    console.error('PURGE CRON FAILED:', err);
  }
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
