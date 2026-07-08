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
router.patch('/news/:id', controllers.updateNews);   // Update an article

// ---------------------------------------------------------------------------
// Dashboard stats & executive summary
// ---------------------------------------------------------------------------
router.get('/stats', controllers.getStats);
router.get('/executive-summary', controllers.getExecutiveSummary);

// ---------------------------------------------------------------------------
// RSS Scraper (trigger manually or via scheduled job)
// ---------------------------------------------------------------------------
// router.post('/scrape', controllers.scrapeNews); // Disabled for security reasons (run via run_live_scrape.js or cron instead)

// ---------------------------------------------------------------------------
// Alert Subscriptions
// ---------------------------------------------------------------------------
router.post('/alerts/subscribe', controllers.subscribeAlert);
router.delete('/alerts/unsubscribe', controllers.unsubscribeAlert);

module.exports = router;
