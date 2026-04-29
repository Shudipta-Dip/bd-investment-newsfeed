const RSSParser = require('rss-parser');
const sources = require('./services/sources');

const parser = new RSSParser({
  timeout: 4000,
  headers: { 'User-Agent': 'BD-Investment-Newsfeed/1.0' },
});

async function findFailed() {
  const BATCH = 20;
  const failed = [];
  const success = [];

  for (let i = 0; i < sources.length; i += BATCH) {
    const batch = sources.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(async (s) => {
      try {
        await parser.parseURL(s.url);
        return { ...s, ok: true };
      } catch (e) {
        return { ...s, ok: false, error: e.message.split('\n')[0] };
      }
    }));
    results.forEach(r => r.ok ? success.push(r) : failed.push(r));
    process.stdout.write(`\rChecked ${Math.min(i + BATCH, sources.length)}/${sources.length}`);
  }

  console.log(`\n\nSUCCESS: ${success.length} sources work fine`);
  console.log(`FAILED: ${failed.length} sources need fixing\n`);
  
  // Group failures
  const byType = {};
  failed.forEach(f => {
    const err = f.error;
    let type = 'other';
    if (err.includes('timed out')) type = 'timeout';
    else if (err.includes('Status code 4')) type = 'http_4xx';
    else if (err.includes('Status code 5')) type = 'http_5xx';
    else if (err.includes('Status code 3')) type = 'redirect';
    else if (err.includes('not recognized') || err.includes('Attribute') || err.includes('entity') || err.includes('Unable to parse')) type = 'not_rss';
    else if (err.includes('Status code 403')) type = 'forbidden';
    if (!byType[type]) byType[type] = [];
    byType[type].push(f);
  });
  
  console.log('Failure types:', Object.keys(byType).map(k => `${k}: ${byType[k].length}`).join(', '));

  // Output just the names for searching
  console.log('\n=== FAILED SOURCE NAMES (for RSS search) ===');
  failed.forEach(f => console.log(`${f.name} | ${f.url} | ${f.error}`));
  
  // Write to JSON for later use
  const fs = require('fs');
  fs.writeFileSync(__dirname + '/failed_sources.json', JSON.stringify(failed, null, 2));
  console.log('\nSaved to failed_sources.json');
}

findFailed();
