require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function wipeDatabase() {
  console.log('🧹 Wiping old news articles from Supabase...');
  
  // Delete all records where ID is not null (which means delete everything)
  const { error } = await supabase
    .from('news_articles')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('❌ Wipe failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Database wiped successfully! Ready for fresh, real scrape.');
  process.exit(0);
}

wipeDatabase();
