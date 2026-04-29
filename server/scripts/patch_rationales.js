require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const models = require('../models');
const { deepDiveGlobalArticles, generateLocalRationale } = require('../services/aiValidator');

async function patch() {
  console.log('Fetching articles missing rationale...');
  const { data: articles } = await models.getArticles({ limit: 100 });
  
  const toPatch = articles.filter(a => !a.ai_rationale);
  console.log(`Found ${toPatch.length} articles to patch. Processing...`);

  // First do global
  let patched = await deepDiveGlobalArticles(toPatch);
  
  // Then local (chunked into batches of 10 to avoid 503)
  const localArticles = patched.filter(a => a.region === 'Bangladesh' && !a.ai_rationale);
  console.log(`Patching ${localArticles.length} local articles in chunks...`);
  
  const chunkSize = 15;
  for (let i = 0; i < localArticles.length; i += chunkSize) {
    const chunk = localArticles.slice(i, i + chunkSize);
    console.log(`Processing local chunk ${Math.floor(i/chunkSize) + 1}...`);
    const chunkPatched = await generateLocalRationale(chunk);
    
    // Merge back into patched array
    for (const p of chunkPatched) {
      const idx = patched.findIndex(a => a.url === p.url);
      if (idx !== -1) patched[idx] = p;
    }
  }

  // Save updates back to DB
  console.log('Saving patched articles back to DB...');
  let savedCount = 0;
  for (const a of patched) {
    if (a.ai_rationale || a.impact_score !== undefined) {
      const { error } = await models.updateArticle(a.id, { 
        ai_rationale: a.ai_rationale,
        impact_score: a.impact_score
      });
      if (!error) savedCount++;
    }
  }
  console.log(`Successfully patched and saved ${savedCount} articles.`);
  process.exit(0);
}

patch();
