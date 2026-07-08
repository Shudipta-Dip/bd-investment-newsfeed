// ---------------------------------------------------------------------------
// Alert Dispatcher — post-scrape conditional email alert pipeline
// ---------------------------------------------------------------------------
// After a scrape completes, this module:
//   1. Generates the executive summary + climate score
//   2. Retrieves all subscriber records from Supabase
//   3. Filters subscribers whose threshold exceeds the current score
//   4. Applies a 24-hour cooldown to prevent repeat emails
//   5. Dispatches alert emails with CSV attachments to qualifying subscribers

const { getArticles, getActiveSubscriptions, updateSubscriptionTrigger } = require('../models');
const { generateExecutiveSummary } = require('./aiValidator');
const { sendAlertEmail } = require('./emailService');

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Check all alert subscriptions and dispatch emails where the climate score
 * has dropped below a subscriber's configured threshold.
 *
 * Designed to be called after scrapeAll() completes.
 * Errors are caught internally so they never crash the scraper cron.
 */
async function checkAndDispatchAlerts() {
  console.log('\n📬 Alert Dispatcher: Starting post-scrape alert check...');

  try {
    // 1. Retrieve latest articles (7-day window, same pool used by the dashboard)
    const { data: articles, error: articlesError } = await getArticles({ limit: 500 });
    if (articlesError || !articles || articles.length === 0) {
      console.log('📬 Alert Dispatcher: No articles available, skipping alert check.');
      return;
    }

    // 2. Generate the executive summary and extract the climate score
    const summary = await generateExecutiveSummary(articles);
    const currentScore = summary.weightedScore;
    const narrative = summary.narrative;

    console.log(`📬 Alert Dispatcher: Current climate score = ${currentScore}/100`);

    // 3. Get all subscriptions from the database
    const { data: subscriptions, error: subError } = await getActiveSubscriptions();
    if (subError) {
      console.error('📬 Alert Dispatcher: Failed to fetch subscriptions:', subError);
      return;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('📬 Alert Dispatcher: No subscribers registered. Skipping.');
      return;
    }

    console.log(`📬 Alert Dispatcher: Evaluating ${subscriptions.length} subscriber(s)...`);

    // 4. Filter: score must be below threshold AND cooldown must have expired
    const now = Date.now();
    const eligibleSubscribers = subscriptions.filter(sub => {
      // Score must be below their threshold
      if (currentScore >= sub.threshold_score) return false;

      // 24-hour cooldown check
      if (sub.last_triggered_at) {
        const lastTriggered = new Date(sub.last_triggered_at).getTime();
        if (now - lastTriggered < COOLDOWN_MS) {
          console.log(`   ⏳ Skipping ${sub.email} (threshold: ${sub.threshold_score}) — last alerted ${Math.round((now - lastTriggered) / 3600000)}h ago, cooldown active.`);
          return false;
        }
      }

      return true;
    });

    if (eligibleSubscribers.length === 0) {
      console.log('📬 Alert Dispatcher: No subscribers qualify for alerts right now.');
      return;
    }

    console.log(`📬 Alert Dispatcher: ${eligibleSubscribers.length} subscriber(s) qualify. Dispatching emails...`);

    // 5. Dispatch emails concurrently (with individual error handling)
    const dispatchResults = await Promise.allSettled(
      eligibleSubscribers.map(async (sub) => {
        try {
          await sendAlertEmail({
            toEmail: sub.email,
            score: currentScore,
            narrative,
            articles,
          });

          // Update the trigger timestamp in the database
          await updateSubscriptionTrigger(sub.id, currentScore);
          console.log(`   ✅ Alert sent to ${sub.email} (threshold: ${sub.threshold_score}, score: ${currentScore})`);
          return { email: sub.email, status: 'sent' };
        } catch (emailErr) {
          console.error(`   ❌ Failed to send alert to ${sub.email}:`, emailErr.message);
          return { email: sub.email, status: 'failed', error: emailErr.message };
        }
      })
    );

    const sent = dispatchResults.filter(r => r.status === 'fulfilled' && r.value.status === 'sent').length;
    const failed = dispatchResults.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.status === 'failed')).length;
    console.log(`📬 Alert Dispatcher: Complete. ${sent} sent, ${failed} failed.\n`);

  } catch (err) {
    // Catch-all: never let alert logic crash the scraper
    console.error('📬 Alert Dispatcher: Unhandled error (scraper unaffected):', err.message);
  }
}

module.exports = { checkAndDispatchAlerts };
