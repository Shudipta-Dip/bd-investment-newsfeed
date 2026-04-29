const Parser = require('rss-parser');
const p = new Parser();
p.parseURL('https://thefinancialexpress.com.bd/feed')
  .then(v => console.log(v.items.length + ' items found'))
  .catch(console.error);
