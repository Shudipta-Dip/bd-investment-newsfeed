require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const models = require('../models');

async function testUpdate() {
  console.log('Fetching an article...');
  const { data: articles, error: getErr } = await models.getArticles({ limit: 1 });
  if (getErr) {
    console.error('Error fetching article:', getErr);
    process.exit(1);
  }
  if (!articles || articles.length === 0) {
    console.error('No articles found in database. Please run seed first.');
    process.exit(1);
  }

  const article = articles[0];
  console.log(`Found article: "${article.title}" (ID: ${article.id})`);

  console.log('Attempting to update action_taken and action_note...');
  const { data: updated, error: updateErr } = await models.updateArticle(article.id, {
    action_taken: true,
    action_note: '[Action] Test logged action from script'
  });

  if (updateErr) {
    console.error('❌ Update failed with error:', updateErr);
    process.exit(1);
  }

  console.log('✅ Update succeeded! Result:', updated);
  process.exit(0);
}

testUpdate();
