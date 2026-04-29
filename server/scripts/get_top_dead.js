const fs = require('fs');
const failed = JSON.parse(fs.readFileSync('failed_sources.json', 'utf8'));
const sources = require('./services/sources');

// The failed list was 238 items. But we fixed 55 of them.
// Let's filter out the ones that have been successfully mapped to an RSS/feed url in sources.js
const currentlyDead = failed.filter(f => {
  const currentSource = sources.find(s => s.name === f.name);
  if (!currentSource) return true;
  return !currentSource.url.includes('rss') && !currentSource.url.includes('feed') && !currentSource.url.includes('.xml');
});

console.log('Still dead count:', currentlyDead.length);
console.log(currentlyDead.slice(0, 15).map(s => s.name));
