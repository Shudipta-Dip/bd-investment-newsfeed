const express = require('express');
const router = express.Router();
const controllers = require('../controllers');

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
router.get('/health', controllers.healthCheck);

// ---------------------------------------------------------------------------
// News articles
// ---------------------------------------------------------------------------
router.get('/news', controllers.getNews);           // Get all (with filters)
router.get('/news/:id', controllers.getNewsById);    // Get one by ID
router.post('/news', controllers.createNews);        // Save a new article

// ---------------------------------------------------------------------------
// Dashboard stats & executive summary
// ---------------------------------------------------------------------------
router.get('/stats', controllers.getStats);
router.get('/executive-summary', controllers.getExecutiveSummary);

// ---------------------------------------------------------------------------
// router.post('/scrape', controllers.scrapeNews); // Disabled for security reasons (run via run_live_scrape.js or cron instead)
router.post('/scrape', (req, res, next) => {
  const secretToken = process.env.ALERT_WEBHOOK_SECRET || 'bd-newsfeed-secret-123';
  const providedToken = req.headers['x-scrape-token'] || req.query.token;
  if (!providedToken || providedToken !== secretToken) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or missing scrape token' });
  }
  next();
}, controllers.scrapeNews);

// ---------------------------------------------------------------------------
// Alert Subscriptions
// ---------------------------------------------------------------------------
router.post('/alerts/subscribe', controllers.subscribeAlert);
router.delete('/alerts/unsubscribe', controllers.unsubscribeAlert);

// ---------------------------------------------------------------------------
// LLM API Key Diagnostics
// ---------------------------------------------------------------------------
router.get('/diagnose', controllers.diagnoseKeys);

// ---------------------------------------------------------------------------
// LangChain Agent Chat
// ---------------------------------------------------------------------------
router.post('/chat', controllers.chatWithAgent);

module.exports = router;
