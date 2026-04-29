const Parser = require('rss-parser');
const parser = new Parser({ timeout: 5000 });

const urlsToTest = [
  'https://www.thedailystar.net/business/rss.xml',
  'https://www.thedailystar.net/frontpage/rss.xml',
  'https://www.dhakatribune.com/business/feed',
  'https://www.dhakatribune.com/rss.xml',
  'https://en.prothomalo.com/feed',
  'https://tbsnews.net/feed',
  'https://www.tbsnews.net/business/feed',
  'https://thefinancialexpress.com.bd/api/rss',
  'https://thefinancialexpress.com.bd/rss'
];

async function run() {
  for (const u of urlsToTest) {
    try {
      const feed = await parser.parseURL(u);
      console.log(`✅ WORKS: ${u} [${feed.items.length} items] (Latest: ${feed.items[0]?.pubDate || 'N/A'}) - ${feed.items[0]?.title}`);
    } catch (e) {
      console.log(`❌ FAILS: ${u} [${e.message.split('\n')[0]}]`);
    }
  }
}
run();
