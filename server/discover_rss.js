const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BATCH_SIZE = 20;

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 5000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
}

async function discoverRssLink(url) {
  try {
    const res = await fetchWithTimeout(url, { timeout: 5000 });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Look for standard RSS link tags
    let rssUrl = $('link[type="application/rss+xml"]').attr('href');
    if (!rssUrl) {
      rssUrl = $('link[type="application/atom+xml"]').attr('href');
    }

    if (rssUrl) {
      // Handle relative URLs
      if (rssUrl.startsWith('/')) {
        const urlObj = new URL(url);
        return `${urlObj.origin}${rssUrl}`;
      }
      return rssUrl;
    }
    
    // Fallback guess if no link tag
    const urlObj = new URL(url);
    return `${urlObj.origin}/feed`;
  } catch (err) {
    // If it fails (timeout, network error), fallback to a basic guess
    try {
      const urlObj = new URL(url);
      return `${urlObj.origin}/feed`;
    } catch {
      return null;
    }
  }
}

async function runDiscovery() {
  const filePath = path.join(__dirname, '..', 'RSS News Source.txt');
  const d = fs.readFileSync(filePath, 'utf-8');
  const lines = d.split('\n').map(l => l.trim()).filter(Boolean);
  
  const rawSources = [];
  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length >= 2) {
      let region = parts[0].trim();
      let url = parts[1].trim();
      let name = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
      if (url && url !== 'N/A' && url.startsWith('http')) {
        rawSources.push({ name, url, region });
      }
    }
  }

  console.log(`🔎 Starting Auto-Discovery Engine for ${rawSources.length} sources...`);
  const finalSources = [];

  for (let i = 0; i < rawSources.length; i += BATCH_SIZE) {
    const batch = rawSources.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(async (source) => {
      // If it already looks like an XML or feed link, keep it
      if (source.url.includes('.xml') || source.url.includes('/feed') || source.url.includes('/rss')) {
        return source;
      }
      
      const discoveredUrl = await discoverRssLink(source.url);
      if (discoveredUrl) {
        return { ...source, url: discoveredUrl };
      }
      return source;
    });

    const results = await Promise.all(promises);
    finalSources.push(...results);
    
    process.stdout.write(`\rProgress: ${Math.min(i + BATCH_SIZE, rawSources.length)} / ${rawSources.length}`);
  }

  console.log('\n✅ Auto-Discovery Complete!');
  
  // Also append the initial 15 reliable sources we already picked out, ensuring no exact name duplicates
  const fallbackSources = [
    { name: 'WSJ Business',        url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml',             region: 'United States' },
    { name: 'Bloomberg',           url: 'https://feeds.bloomberg.com/markets/news.rss',                region: 'United States' },
    { name: 'Financial Times',     url: 'https://www.ft.com/?format=rss',                              region: 'United Kingdom' },
    { name: 'SCMP Economy',        url: 'https://www.scmp.com/rss/91/feed',                            region: 'Asia-Pacific' },
    { name: 'CNBC',                url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', region: 'United States' },
    { name: 'Prothom Alo',         url: 'https://en.prothomalo.com/feed',                              region: 'Bangladesh' },
    { name: 'bdnews24',            url: 'https://bdnews24.com/business/?widgetName=rssfeed&widgetId=1150&getXml=1', region: 'Bangladesh' },
    { name: 'The Business Standard',url: 'https://www.tbsnews.net/rss.xml',                            region: 'Bangladesh' },
    { name: 'Economic Times',      url: 'https://economictimes.indiatimes.com/rssfeedstopstories.cms', region: 'India' },
    { name: 'Straits Times',       url: 'https://www.straitstimes.com/news/business/rss.xml',          region: 'Asia-Pacific' },
    { name: 'UN News',             url: 'https://news.un.org/feed/subscribe/en/news/topic/economic-development/feed/rss.xml', region: 'Global' },
    { name: 'The Diplomat',        url: 'https://thediplomat.com/feed/',                               region: 'Asia-Pacific' },
    { name: 'BBC Business',        url: 'https://feeds.bbci.co.uk/news/business/rss.xml',              region: 'United Kingdom' },
    { name: 'Al Jazeera Economy',  url: 'https://www.aljazeera.com/xml/rss/all.xml',                   region: 'Global' },
    { name: 'DW Business',         url: 'https://rss.dw.com/xml/rss-en-bus',                           region: 'Global' },
  ];
  
  for (const fs of fallbackSources) {
    if (!finalSources.find(s => s.name === fs.name)) {
      finalSources.push(fs);
    }
  }

  // Write the new sources.js file
  const fileContent = `// Auto-generated by Auto-Discovery Engine
const sources = ${JSON.stringify(finalSources, null, 2)};
module.exports = sources;
`;

  fs.writeFileSync(path.join(__dirname, 'services', 'sources.js'), fileContent);
  console.log(`💾 Saved ${finalSources.length} total sources to server/services/sources.js`);
  process.exit(0);
}

runDiscovery();
