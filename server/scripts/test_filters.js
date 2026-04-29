async function test() {
  const tests = [
    { name: 'All', url: 'http://localhost:5002/api/news' },
    { name: 'Critical only', url: 'http://localhost:5002/api/news?sentiment=critical' },
    { name: 'Critical+Growth', url: 'http://localhost:5002/api/news?sentiment=critical,growth' },
    { name: 'Local', url: 'http://localhost:5002/api/news?region=local' },
    { name: 'Global', url: 'http://localhost:5002/api/news?region=global' },
    { name: 'Local+Critical', url: 'http://localhost:5002/api/news?region=local&sentiment=critical' },
  ];
  
  for (const t of tests) {
    const r = await fetch(t.url);
    const j = await r.json();
    console.log(`${t.name}: ${j.data?.length || 0} articles`);
  }
}
test();
