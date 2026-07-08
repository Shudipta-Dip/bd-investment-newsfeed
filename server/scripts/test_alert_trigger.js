// ---------------------------------------------------------------------------
// Manual Alert Trigger Script
// ---------------------------------------------------------------------------
// Run this script locally using 'node server/scripts/test_alert_trigger.js'
// to test SMTP email dispatch and database conditions instantly without running
// a full RSS scrape.

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });
const { checkAndDispatchAlerts } = require('../services/alertDispatcher');

async function run() {
  console.log('🚀 Manually triggering BIDA alert dispatcher check...');
  console.log('Checking environment configurations...');
  console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
  console.log(`SMTP User: ${process.env.SMTP_USER}`);
  console.log(`Supabase URL: ${process.env.SUPABASE_URL}`);
  
  await checkAndDispatchAlerts();
  
  console.log('✅ Manual alert run complete.');
  process.exit(0);
}

run();
