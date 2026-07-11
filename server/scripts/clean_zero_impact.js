require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function cleanZeroImpact() {
  console.log('🧹 Cleaning up database: Deleting all articles with impact_score = 0...');
  
  const { data, error } = await supabase
    .from('news_articles')
    .delete()
    .eq('impact_score', 0)
    .select('id, title');

  if (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }

  console.log(`✅ Cleaned up successfully! Deleted ${data?.length || 0} articles with 0 impact score.`);
  process.exit(0);
}

cleanZeroImpact();
