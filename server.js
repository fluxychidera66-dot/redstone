const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

console.log('🚀 [STARTUP] Redstone server starting...');
console.log(`📍 [CONFIG] PORT=${PORT}`);
console.log(`📍 [CONFIG] NODE_ENV=${process.env.NODE_ENV}`);

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  console.log(`📡 [REQUEST] ${req.method} ${pathname}`);

  // ========== API ROUTES ==========
  
  // Health check
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'redstone-unified', uptime: process.uptime() }));
    return;
  }

  // Pricing tiers
  if (pathname === '/api/pricing') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      tiers: [
        { name: 'Free', price: 0, messages: 10, retention: 7, topics: 3, tools: ['calendar'] },
        { name: 'Basic', price: 30, messages: 2000, retention: 90, topics: 999, tools: ['calendar', 'email', 'notes'] },
        { name: 'Pro', price: 80, messages: 10000, retention: 270, topics: 999, tools: ['all'] },
        { name: 'Business', price: 250, messages: 50000, retention: 540, topics: 999, tools: ['all'] },
        { name: 'Enterprise', price: 'custom', messages: 'unlimited', retention: 'unlimited', topics: 999, tools: ['all'] }
      ]
    }));
    return;
  }

  // Team usage (mock data)
  if (pathname === '/api/team/usage') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      plan: 'Free',
      messagesUsed: 5,
      messagesLimit: 10,
      retentionDays: 7,
      maxRetention: 7
    }));
    return;
  }

  // Team activity
  if (pathname === '/api/team/activity') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      activities: [
        { id: 1, type: 'message', source: 'slack', timestamp: Date.now() - 3600000, title: 'Team standup in #general' },
        { id: 2, type: 'email', source: 'gmail', timestamp: Date.now() - 7200000, title: 'Project kickoff meeting scheduled' }
      ]
    }));
    return;
  }

  // Integrations status
  if (pathname === '/api/team/integrations') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      integrations: [
        { name: 'Slack', connected: false, icon: 'slack' },
        { name: 'Gmail', connected: false, icon: 'gmail' },
        { name: 'Google Calendar', connected: false, icon: 'calendar' },
        { name: 'Notion', connected: false, icon: 'notion' },
        { name: 'Jira', connected: false, icon: 'jira' }
      ]
    }));
    return;
  }

  // ========== OAUTH ROUTES ==========

  // Slack OAuth start
  if (pathname === '/api/slack/oauth') {
    const clientId = process.env.SLACK_CLIENT_ID || '10844551339572.10842664950550';
    const redirectUri = 'https://redstone-backend-1.onrender.com/api/slack/oauth/callback';
    const scopes = 'channels:read,users:read,chat:write,conversations.history:read';
    const oauthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url: oauthUrl }));
    return;
  }

  // Slack OAuth callback
  if (pathname === '/api/slack/oauth/callback') {
    const code = query.code;
    const error = query.error;
    
    console.log(`🔐 [SLACK_CALLBACK] code=${code}, error=${error}`);
    
    if (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error }));
      return;
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No authorization code' }));
      return;
    }

    // Redirect to dashboard with success
    res.writeHead(302, { 'Location': `https://redstone-backend-1.onrender.com/?slack=connected` });
    res.end();
    return;
  }

  // Gmail OAuth start
  if (pathname === '/api/gmail/oauth') {
    const clientId = process.env.GOOGLE_CLIENT_ID || '250848059224-qrkpqiopqp0nifg19b85a7l3uj367u41.apps.googleusercontent.com';
    const redirectUri = 'https://redstone-backend-1.onrender.com/api/gmail/oauth/callback';
    const scopes = 'https://www.googleapis.com/auth/gmail.readonly';
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}`;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url: oauthUrl }));
    return;
  }

  // Gmail OAuth callback
  if (pathname === '/api/gmail/oauth/callback') {
    const code = query.code;
    const error = query.error;
    
    console.log(`🔐 [GMAIL_CALLBACK] code=${code}, error=${error}`);
    
    if (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error }));
      return;
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No authorization code' }));
      return;
    }

    res.writeHead(302, { 'Location': `https://redstone-backend-1.onrender.com/?gmail=connected` });
    res.end();
    return;
  }

  // Calendar OAuth start
  if (pathname === '/api/calendar/oauth') {
    const clientId = process.env.GOOGLE_CLIENT_ID || '250848059224-qrkpqiopqp0nifg19b85a7l3uj367u41.apps.googleusercontent.com';
    const redirectUri = 'https://redstone-backend-1.onrender.com/api/calendar/oauth/callback';
    const scopes = 'https://www.googleapis.com/auth/calendar.readonly';
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}`;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url: oauthUrl }));
    return;
  }

  // Calendar OAuth callback
  if (pathname === '/api/calendar/oauth/callback') {
    const code = query.code;
    const error = query.error;
    
    console.log(`🔐 [CALENDAR_CALLBACK] code=${code}, error=${error}`);
    
    if (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error }));
      return;
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No authorization code' }));
      return;
    }

    res.writeHead(302, { 'Location': `https://redstone-backend-1.onrender.com/?calendar=connected` });
    res.end();
    return;
  }

  // ========== STATIC FILES ==========

  // Serve frontend
  const frontendPath = path.join(__dirname, 'frontend');
  const filePath = pathname === '/' ? path.join(frontendPath, 'index.html') : path.join(frontendPath, pathname);
  
  // Security: prevent directory traversal
  if (!filePath.startsWith(frontendPath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  // Check if file exists
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Try index.html
      const indexPath = path.join(filePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
        return;
      }
    } else {
      // Serve file with appropriate content type
      const ext = path.extname(filePath);
      let contentType = 'application/octet-stream';
      if (ext === '.html') contentType = 'text/html; charset=utf-8';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.json') contentType = 'application/json';
      else if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.woff') contentType = 'font/woff';
      else if (ext === '.woff2') contentType = 'font/woff2';

      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      return;
    }
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ [READY] Redstone unified server running on port ${PORT}`);
  console.log(`🌐 [DASHBOARD] http://0.0.0.0:${PORT}/`);
  console.log(`📡 [API] http://0.0.0.0:${PORT}/api/health`);
});

server.on('error', (err) => {
  console.error(`❌ [ERROR] Server error:`, err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error(`❌ [FATAL] Uncaught exception:`, err);
  process.exit(1);
});
