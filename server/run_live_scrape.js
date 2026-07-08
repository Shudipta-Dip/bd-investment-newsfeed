require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { scrapeAll } = require('./services/scraper');

const { checkAndDispatchAlerts } = require('./services/alertDispatcher');

async function run() {
  console.log('Starting fresh scrape with AI classification + deep-dive...');
  const results = await scrapeAll();
  console.log('===== SCRAPE RESULTS =====');
  console.log(`Sources checked: ${results.sourcesChecked}`);
  console.log(`Articles found: ${results.articlesFound}`);
  console.log(`Articles relevant: ${results.articlesRelevant}`);
  console.log(`Articles saved: ${results.articlesSaved}`);
  console.log(`Sources failed: ${results.sourcesFailed}`);
  
  // Post-scrape: check and send email alerts
  await checkAndDispatchAlerts();
  
  process.exit(0);
}
run();
