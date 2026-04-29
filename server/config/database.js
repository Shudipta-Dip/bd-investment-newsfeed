// ---------------------------------------------------------------------------
// Supabase connection
// ---------------------------------------------------------------------------
// Reads your project URL and secret key from the .env file and creates a
// reusable "client" that every other file can import to talk to the database.

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Check that the values look like real credentials (not placeholders)
const isConfigured =
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('http') &&
  supabaseKey.length > 30;

if (!isConfigured) {
  console.warn(
    '⚠️  Supabase is not configured yet.\n' +
    '   Open the .env file and paste your real SUPABASE_URL and SUPABASE_SERVICE_KEY.\n' +
    '   The server will still run, but anything involving the database will return empty data.'
  );
}

const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

module.exports = supabase;
