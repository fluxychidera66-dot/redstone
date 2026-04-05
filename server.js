const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // API routes
  if (pathname.startsWith('/api/')) {
    // Health check
    if (pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'redstone-unified', uptime: process.uptime() }));
      return;
    }

    // Pricing endpoint
    if (pathname === '/api/pricing') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        tiers: [
          { name: 'Free', price: 0, messages: 10, retention: 7 },
          { name: 'Basic', price: 30, messages: 2000, retention: 90 },
          { name: 'Pro', price: 80, messages: 10000, retention: 270 },
          { name: 'Business', price: 250, messages: 50000, retention: 540 },
          { name: 'Enterprise', price: 'custom', messages: 'unlimited', retention: 'unlimited' }
        ]
      }));
      return;
    }

    // OAuth endpoints (stub responses)
    if (pathname === '/api/slack/oauth') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: 'https://slack.com/oauth/v2/authorize?client_id=placeholder' }));
      return;
    }

    if (pathname === '/api/gmail/oauth') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=placeholder' }));
      return;
    }

    if (pathname === '/api/calendar/oauth') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=placeholder' }));
      return;
    }

    // Team endpoints
    if (pathname === '/api/team/usage') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        plan: 'free',
        messagesUsed: 5,
        messagesDaily: 10,
        retention: 7
      }));
      return;
    }

    // 404 for unknown API routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  // Serve frontend (index.html for all other routes)
  const indexPath = path.join(__dirname, 'frontend', 'index.html');
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Frontend not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Redstone unified server running on port ${PORT}`);
  console.log(`   Dashboard: http://localhost:${PORT}/`);
  console.log(`   API: http://localhost:${PORT}/api/health`);
});
