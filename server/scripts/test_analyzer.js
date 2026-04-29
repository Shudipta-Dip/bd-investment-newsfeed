const { isRelevant } = require('./services/analyzer');
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 5000 });

async function test() {
  const feed = await parser.parseURL('https://en.prothomalo.com/feed');
  const articles = [];
  feed.items.forEach(item => {
    const title = item.title || '';
    const snippet = item.contentSnippet || item.content || item.summary || '';
    const url = item.link || item.guid || '';
    
    if (!url) return;
    
    const rel = isRelevant(title, snippet, 'Bangladesh');
    if (rel) {
      console.log(`✅ RELEVANT: ${title}`);
      articles.push({ title });
    } else {
      console.log(`❌ IRRELEVANT: ${title}`);
    }
  });
  console.log(`Total relevant: ${articles.length}`);
}

test();
