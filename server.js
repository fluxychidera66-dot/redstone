const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
console.log(`[${new Date().toISOString()}] Starting server on port ${PORT}`);

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    return;
  }

  if (req.url === '/api/pricing') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ tiers: ['Free', 'Basic', 'Pro', 'Business', 'Enterprise'] }));
    return;
  }

  if (req.url === '/api/team/usage') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ plan: 'Free', used: 5, limit: 10 }));
    return;
  }

  if (req.url === '/api/team/activity') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ activities: [] }));
    return;
  }

  if (req.url === '/api/team/integrations') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ integrations: [
      { name: 'Slack', connected: false },
      { name: 'Gmail', connected: false },
      { name: 'Calendar', connected: false }
    ]}));
    return;
  }

  if (req.url === '/api/slack/oauth') {
    const clientId = '10844551339572.10842664950550';
    const url = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=channels:read&redirect_uri=https://redstone-backend-1.onrender.com/api/slack/oauth/callback`;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url }));
    return;
  }

  if (req.url === '/api/gmail/oauth') {
    const clientId = '250848059224-qrkpqiopqp0nifg19b85a7l3uj367u41.apps.googleusercontent.com';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&redirect_uri=https://redstone-backend-1.onrender.com/api/gmail/oauth/callback&scope=https://www.googleapis.com/auth/gmail.readonly`;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url }));
    return;
  }

  if (req.url === '/api/calendar/oauth') {
    const clientId = '250848059224-qrkpqiopqp0nifg19b85a7l3uj367u41.apps.googleusercontent.com';
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&redirect_uri=https://redstone-backend-1.onrender.com/api/calendar/oauth/callback&scope=https://www.googleapis.com/auth/calendar.readonly`;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url }));
    return;
  }

  // Serve static frontend files
  const frontendPath = path.join(__dirname, 'frontend');
  let filePath = path.join(frontendPath, req.url === '/' ? 'index.html' : req.url);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const content = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    let contentType = 'application/octet-stream';
    if (ext === '.html') contentType = 'text/html';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] ✅ Server listening on port ${PORT}`);
});

server.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] ❌ Server error:`, err);
  process.exit(1);
});
