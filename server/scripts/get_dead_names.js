const fs = require('fs');
const sources = require('./services/sources');
const failed = JSON.parse(fs.readFileSync('failed_sources.json', 'utf8'));

const currentlyDead = failed.filter(f => {
  const s = sources.find(x => x.name === f.name);
  if (!s) return true;
  return !s.url.includes('rss') && !s.url.includes('feed') && !s.url.includes('.xml');
});

console.log(currentlyDead.map(s => s.name).slice(0, 15).join('\n'));
