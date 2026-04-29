const cheerio = require('cheerio');

async function genericHtmlScraper(url) {
  try {
    const res = await fetch(url, { timeout: 5000, headers: {'User-Agent': 'Mozilla/5.0'} });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const items = [];
    // Super generic approach: look for all links that might be articles
    $('a').each((i, el) => {
      const title = $(el).text().trim();
      let link = $(el).attr('href');
      
      // Filter out junk
      if (!link || title.length < 20 || title.split(' ').length < 4) return;
      
      // Resolve relative URLs
      if (link.startsWith('/')) {
        link = new URL(link, url).href;
      }
      
      // Deduplicate roughly
      if (!items.find(item => item.title === title || item.link === link)) {
        items.push({ title, link, contentSnippet: '' });
      }
    });
    
    return items;
  } catch (err) {
    return [];
  }
}

async function run() {
  console.log('Testing HTML fallback on Financial Express...');
  const items = await genericHtmlScraper('https://thefinancialexpress.com.bd/');
  console.log(`Found ${items.length} potential headlines.`);
  console.log(items.slice(0, 5));
}
run();
