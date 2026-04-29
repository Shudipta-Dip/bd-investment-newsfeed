require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function wipeDatabase() {
  console.log('🧹 Wiping all old news articles from Supabase...');
  
  // A clean way to delete all rows is to match where id is not null
  const { data, error } = await supabase
    .from('news_articles')
    .delete()
    .not('id', 'is', null) // Match all records

  if (error) {
    console.error('❌ Wipe failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Database wiped successfully! It is now 100% empty.');
  process.exit(0);
}

wipeDatabase();
