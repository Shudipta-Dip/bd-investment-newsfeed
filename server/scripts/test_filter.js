require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const models = require('./models');

async function test() {
  console.log('Testing single magnitude: "systemic"');
  let res1 = await models.getArticles({ magnitude: 'systemic', limit: 5 });
  console.log('systemic ->', res1.error || res1.data.map(d => d.impact_score));

  console.log('\nTesting valid AND inside OR: "systemic,notable"');
  let res2 = await models.getArticles({ magnitude: 'systemic,notable', limit: 5 });
  console.log('systemic,notable ->', res2.error || res2.data.map(d => d.impact_score));
  
  process.exit(0);
}

test();
