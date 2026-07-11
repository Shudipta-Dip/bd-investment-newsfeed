// ---------------------------------------------------------------------------
// Models — talks to the Supabase database
// ---------------------------------------------------------------------------
// Think of this file as the "data assistant". The controllers ask it
// questions like "give me all news" and it goes to the database to get them.

const supabase = require('../config/database');

const TABLE = 'news_articles';

/**
 * Get news articles that were scraped within the last 7 days.
 * The 7-day window is anchored to `created_at` (when our scraper ingested it),
 * NOT `published_at` (when the source originally wrote it).
 * This means every article stays visible for exactly 7 days from the moment
 * it first enters our database, then naturally expires from the frontend.
 * Optionally filter by sentiment or search keyword.
 */
async function getArticles({ sentiment, search, region, magnitude, limit = 500, daysLimit = 7 } = {}) {
  if (!supabase) return { data: [], error: 'Database not configured' };

  let query = supabase
    .from(TABLE)
    .select('*')
    .neq('impact_score', 0)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (daysLimit) {
    const cutoffDate = new Date(Date.now() - daysLimit * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('created_at', cutoffDate);
  }

  // Multi-sentiment filter: accepts comma-separated values like "critical,growth"
  if (sentiment) {
    const sentiments = sentiment.split(',').map(s => s.trim()).filter(Boolean);
    if (sentiments.length === 1) {
      query = query.eq('sentiment', sentiments[0]);
    } else if (sentiments.length > 1) {
      query = query.in('sentiment', sentiments);
    }
  }

  // Region filter: "local" = Bangladesh only, "global" = everything except Bangladesh
  if (region) {
    const regions = region.split(',').map(r => r.trim().toLowerCase());
    if (regions.includes('local') && !regions.includes('global')) {
      query = query.eq('region', 'Bangladesh');
    } else if (regions.includes('global') && !regions.includes('local')) {
      query = query.neq('region', 'Bangladesh');
    }
    // If it includes both, do nothing (show all)
  }

  // Magnitude filter is handled in memory below to avoid fragile PostgREST nested 'and' inside 'or' syntax.

  if (search) {
    query = query.or(`title.ilike.%${search}%,snippet.ilike.%${search}%,ai_rationale.ilike.%${search}%,region.ilike.%${search}%,source.ilike.%${search}%`);
  }

  let { data, error } = await query;
  if (error) return { data: [], error };
  data = data || [];

  // Robust in-memory filtering for magnitude (numeric score threshold or category strings)
  if (magnitude) {
    const minScore = parseInt(magnitude, 10);
    if (!isNaN(minScore)) {
      data = data.filter(a => (a.impact_score || 0) >= minScore);
    } else {
      const magnitudes = magnitude.split(',').map(m => m.trim().toLowerCase()).filter(Boolean);
      if (magnitudes.length > 0) {
        data = data.filter(a => {
          const score = a.impact_score || 0;
          if (magnitudes.includes('systemic') && score >= 90) return true;
          if (magnitudes.includes('sectoral') && score >= 70 && score < 90) return true;
          if (magnitudes.includes('notable') && score >= 30 && score < 70) return true;
          if (magnitudes.includes('routine') && score < 30) return true;
          return false;
        });
      }
    }
  }

  return { data, error };
}

/**
 * Get a single article by its ID.
 */
async function getArticleById(id) {
  if (!supabase) return { data: null, error: 'Database not configured' };

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

/**
 * Save a new article to the database.
 */
async function createArticle(article) {
  if (!supabase) return { data: null, error: 'Database not configured' };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(article)
    .select()
    .single();

  return { data, error };
}

/**
 * Save many articles at once (used by the scraper later).
 */
async function createManyArticles(articles) {
  if (!supabase) return { data: null, error: 'Database not configured' };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(articles, { onConflict: 'url' })
    .select();

  return { data, error };
}

/**
 * Update an existing article (e.g., mark it as "action taken").
 */
async function updateArticle(id, updates) {
  if (!supabase) return { data: null, error: { message: 'Database not configured' } };

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select();

  if (error) return { data: null, error };
  if (!data || data.length === 0) {
    return { 
      data: null, 
      error: { 
        message: 'No rows updated. Ensure article exists and your SUPABASE_SERVICE_KEY has UPDATE permissions (check RLS policies).' 
      } 
    };
  }

  return { data: data[0], error: null };
}

/**
 * Get quick summary stats for the dashboard header.
 */
async function getStats() {
  if (!supabase) {
    return {
      data: { total: 0, opportunity: 0, risk: 0, regulation: 0 },
      error: 'Database not configured',
    };
  }

  // Stats reflect the same 7-day window anchored to ingestion time
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { count: total } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .neq('impact_score', 0)
    .gte('created_at', sevenDaysAgo);

  const { count: opportunity } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('sentiment', 'opportunity')
    .neq('impact_score', 0)
    .gte('created_at', sevenDaysAgo);

  const { count: risk } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('sentiment', 'risk')
    .neq('impact_score', 0)
    .gte('created_at', sevenDaysAgo);

  const { count: regulation } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('sentiment', 'regulation')
    .neq('impact_score', 0)
    .gte('created_at', sevenDaysAgo);

  return {
    data: {
      total: total || 0,
      opportunity: opportunity || 0,
      risk: risk || 0,
      regulation: regulation || 0,
    },
    error: null,
  };
}

/**
 * Purge articles older than 60 days from the database.
 * This keeps Supabase storage lean while preserving a 2-month archive.
 */
async function purgeOldArticles() {
  if (!supabase) return { count: 0, error: 'Database not configured' };

  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .lt('created_at', sixtyDaysAgo)
    .select('id');

  return { count: data?.length || 0, error };
}

const ALERT_TABLE = 'alert_subscriptions';

/**
 * Upsert a subscription record.
 */
async function subscribeEmail(email, thresholdScore) {
  if (!supabase) return { data: null, error: 'Database not configured' };

  const { data, error } = await supabase
    .from(ALERT_TABLE)
    .upsert({ email, threshold_score: thresholdScore }, { onConflict: 'email,threshold_score' })
    .select();

  return { data: data?.[0] || null, error };
}

/**
 * Get all active subscriptions.
 */
async function getActiveSubscriptions() {
  if (!supabase) return { data: [], error: 'Database not configured' };

  const { data, error } = await supabase
    .from(ALERT_TABLE)
    .select('*');

  return { data: data || [], error };
}

/**
 * Update the trigger timestamp and score to prevent repeat alert spam.
 */
async function updateSubscriptionTrigger(id, score) {
  if (!supabase) return { data: null, error: 'Database not configured' };

  const { data, error } = await supabase
    .from(ALERT_TABLE)
    .update({ 
      last_triggered_at: new Date().toISOString(),
      last_triggered_score: score
    })
    .eq('id', id)
    .select();

  return { data: data?.[0] || null, error };
}

/**
 * Delete all subscriptions matching an email address.
 */
async function unsubscribeEmail(email) {
  if (!supabase) return { data: null, error: 'Database not configured' };

  const { data, error } = await supabase
    .from(ALERT_TABLE)
    .delete()
    .eq('email', email)
    .select();

  return { data: data || [], error };
}

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  createManyArticles,
  updateArticle,
  getStats,
  purgeOldArticles,
  subscribeEmail,
  getActiveSubscriptions,
  updateSubscriptionTrigger,
  unsubscribeEmail,
};
