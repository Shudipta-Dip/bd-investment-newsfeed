// ---------------------------------------------------------------------------
// Controllers — handle what happens when someone hits an API endpoint
// ---------------------------------------------------------------------------
// Think of controllers as the "manager". A request comes in, the manager
// decides what to do, asks the model (data assistant) for info, and sends
// back a response.

const models = require('../models');
const { scrapeAll } = require('../services/scraper');
const { generateExecutiveSummary } = require('../services/aiValidator');
const { sendAlertEmail } = require('../services/emailService');

/**
 * GET /api/health
 * Quick check to see if the server is alive.
 */
const healthCheck = async (_req, res) => {
  // Fire-and-forget background cleanup of legacy 0-impact articles
  (async () => {
    try {
      const supabase = require('../config/database');
      if (supabase) {
        const { data, error } = await supabase
          .from('news_articles')
          .delete()
          .eq('impact_score', 0)
          .select('id');
        if (error) throw error;
        if (data && data.length > 0) {
          console.log(`🧹 Healthcheck Auto-Cleanup: Pruned ${data.length} legacy 0-impact articles from DB.`);
        }
      }
    } catch (cleanErr) {
      console.error('⚠️ Healthcheck cleanup background task failed:', cleanErr.message);
    }
  })();

  res.json({
    status: 'ok',
    message: 'BD Investment Newsfeed API is running',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/news
 * Returns news articles. Supports optional filters:
 *   ?sentiment=critical   → only critical articles
 *   ?search=Matarbari     → search in titles
 *   ?limit=20             → how many to return
 */
const getNews = async (req, res) => {
  try {
    const { sentiment, search, region, magnitude, limit } = req.query;
    const { data, error } = await models.getArticles({
      sentiment,
      search,
      region,
      magnitude,
      limit: limit ? parseInt(limit) : undefined,
    });

    if (error) {
      return res.status(500).json({ success: false, error });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch news' });
  }
};

/**
 * GET /api/news/:id
 * Returns a single article by ID.
 */
const getNewsById = async (req, res) => {
  try {
    const { data, error } = await models.getArticleById(req.params.id);

    if (error) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch article' });
  }
};

/**
 * POST /api/news
 * Saves a new article. Expects a JSON body with title, url, source, etc.
 */
const createNews = async (req, res) => {
  try {
    const { data, error } = await models.createArticle(req.body);

    if (error) {
      return res.status(400).json({ success: false, error });
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('Error creating article:', err);
    res.status(500).json({ success: false, error: 'Failed to save article' });
  }
};

/**
 * PATCH /api/news/:id
 * Updates an article (e.g., log that an action was taken).
 */
const updateNews = async (req, res) => {
  try {
    const { action_taken, action_note } = req.body;
    
    // Whitelist only action_taken and action_note for updates
    const updates = {};
    if (action_taken !== undefined) updates.action_taken = action_taken;
    if (action_note !== undefined) updates.action_note = action_note;

    const { data, error } = await models.updateArticle(req.params.id, updates);

    if (error) {
      return res.status(400).json({ success: false, error });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error updating article:', err);
    res.status(500).json({ success: false, error: 'Failed to update article' });
  }
};

/**
 * GET /api/stats
 * Returns counts for the dashboard summary cards.
 */
const getStats = async (_req, res) => {
  try {
    const { data, error } = await models.getStats();

    if (error) {
      return res.status(500).json({ success: false, error });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

/**
 * POST /api/scrape
 * Triggers the RSS scraper to pull new articles from international sources.
 */
const scrapeNews = async (_req, res) => {
  try {
    console.log('\n🕷️  Starting RSS scrape...');
    const results = await scrapeAll();
    console.log(`✅ Scrape complete: ${results.articlesRelevant} relevant out of ${results.articlesFound} found, ${results.articlesSaved} saved.\n`);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('Error during scrape:', err);
    res.status(500).json({ success: false, error: 'Scrape failed' });
  }
};

/**
 * GET /api/executive-summary
 * Returns an AI-generated executive climate brief + weighted confidence score.
 * Uses current 7-day articles to synthesize a 2-sentence narrative.
 */
const getExecutiveSummary = async (_req, res) => {
  try {
    // Get all articles in the 7-day window
    const { data: articles, error } = await models.getArticles({ limit: 500 });
    if (error) {
      return res.status(500).json({ success: false, error });
    }
    
    const summary = await generateExecutiveSummary(articles);
    res.json({ success: true, data: summary });
  } catch (err) {
    console.error('Error generating executive summary:', err);
    res.status(500).json({ success: false, error: 'Failed to generate summary' });
  }
};

/**
 * POST /api/alerts/subscribe
 * Register an email for conditional climate score alerts.
 * Expects JSON body: { email: string, threshold_score: number }
 */
const subscribeAlert = async (req, res) => {
  try {
    const { email, threshold_score } = req.body;

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    // Validate threshold
    const score = parseInt(threshold_score, 10);
    if (isNaN(score) || score < 0 || score > 100) {
      return res.status(400).json({ success: false, error: 'Threshold score must be a number between 0 and 100.' });
    }

    const { data, error } = await models.subscribeEmail(email, score);

    if (error) {
      return res.status(500).json({ success: false, error });
    }

    // Respond immediately — don't make the user wait for the email check
    res.status(201).json({ success: true, data, message: `Alert registered: you will be notified when the climate score drops below ${score}.` });

    // --- Fire-and-forget: check if current score already qualifies ---
    (async () => {
      try {
        console.log(`📬 Instant Alert: Checking current score for new subscriber ${email} (threshold: ${score})...`);
        const { data: articles, error: artErr } = await models.getArticles({ limit: 500 });
        if (artErr || !articles || articles.length === 0) {
          console.log('📬 Instant Alert: No articles available, skipping instant check.');
          return;
        }

        const summary = await generateExecutiveSummary(articles);
        const currentScore = summary.weightedScore;
        console.log(`📬 Instant Alert: Current score = ${currentScore}, subscriber threshold = ${score}`);

        if (currentScore < score) {
          console.log(`📬 Instant Alert: Score ${currentScore} < threshold ${score}. Dispatching email to ${email}...`);
          await sendAlertEmail({
            toEmail: email,
            score: currentScore,
            narrative: summary.narrative,
            articles,
          });

          // Update trigger timestamp so the 24-hour cooldown starts now
          // data is a single object from subscribeEmail, not an array
          if (data && data.id) {
            await models.updateSubscriptionTrigger(data.id, currentScore);
            console.log(`   ✅ Instant alert sent to ${email}, trigger timestamp updated.`);
          } else {
            console.log(`   ✅ Instant alert sent to ${email}, but could not update trigger (no subscription ID returned).`);
          }
        } else {
          console.log(`📬 Instant Alert: Score ${currentScore} >= threshold ${score}. No immediate alert needed for ${email}.`);
        }
      } catch (instantErr) {
        console.error(`📬 Instant Alert: Failed for ${email}:`, instantErr.message, instantErr.stack);
      }
    })();

  } catch (err) {
    console.error('Error subscribing alert:', err);
    res.status(500).json({ success: false, error: 'Failed to register alert subscription.' });
  }
};

/**
 * DELETE /api/alerts/unsubscribe
 * Unsubscribe an email from alerts.
 * Expects query param ?email=email
 */
const unsubscribeAlert = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const { data, error } = await models.unsubscribeEmail(email);

    if (error) {
      return res.status(500).json({ success: false, error });
    }

    res.json({ success: true, count: data?.length || 0, message: 'You have been successfully unsubscribed from BIDA climate alerts.' });
  } catch (err) {
    console.error('Error unsubscribing:', err);
    res.status(500).json({ success: false, error: 'Failed to process unsubscribe request.' });
  }
};

module.exports = {
  healthCheck,
  getNews,
  getNewsById,
  createNews,
  updateNews,
  getStats,
  scrapeNews,
  getExecutiveSummary,
  subscribeAlert,
  unsubscribeAlert,
};
