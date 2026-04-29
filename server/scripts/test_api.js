const http = require('http');

http.get('http://localhost:5002/api/news?magnitude=sectoral', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (!response.success && response.error) {
         console.error('API Error:', response.error);
         return;
      }
      const impacts = response.data.map(d => d.impact_score);
      console.log('Sectoral impacts:', impacts);
    } catch(e) { console.error('Parse Error', e); }
  });
});
