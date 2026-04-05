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

    // OAuth endpoints
    if (pathname === '/api/slack/oauth') {
      const slackClientId = '10844551339572.10842664950550';
      const slackScopes = 'channels:read,chat:write,users:read,search:read,reactions:read';
      const redirectUri = process.env.SLACK_REDIRECT_URI || 'https://redstone-backend-1.onrender.com/api/slack/oauth/callback';
      const oauthUrl = `https://slack.com/oauth/v2/authorize?client_id=${slackClientId}&scope=${encodeURIComponent(slackScopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: oauthUrl }));
      return;
    }

    if (pathname === '/api/gmail/oauth') {
      const googleClientId = '250848059224-qrkpqiopqp0nifg19b85a7l3uj367u41.apps.googleusercontent.com';
      const googleScopes = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify';
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://redstone-backend-1.onrender.com/api/gmail/oauth/callback';
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(googleScopes)}&access_type=offline&prompt=consent`;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: oauthUrl }));
      return;
    }

    if (pathname === '/api/calendar/oauth') {
      const googleClientId = '250848059224-qrkpqiopqp0nifg19b85a7l3uj367u41.apps.googleusercontent.com';
      const googleScopes = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar';
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://redstone-backend-1.onrender.com/api/calendar/oauth/callback';
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(googleScopes)}&access_type=offline&prompt=consent`;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ url: oauthUrl }));
      return;
    }

    // OAuth Callback Handlers
    if (pathname === '/api/slack/oauth/callback') {
      const code = query.code;
      const error = query.error;
      
      if (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error }));
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No authorization code provided' }));
        return;
      }

      // Exchange code for token
      const clientId = '10844551339572.10842664950550';
      const clientSecret = process.env.SLACK_CLIENT_SECRET || '4a1c6856e964970200d895dc627b12b6';
      const redirectUri = 'https://redstone-backend-1.onrender.com/api/slack/oauth/callback';

      const postData = `client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`;

      // For now, redirect to frontend with success (real token exchange would happen here)
      res.writeHead(302, { 'Location': `https://redstone-backend-1.onrender.com?slack=connected&code=${code}` });
      res.end();
      return;
    }

    if (pathname === '/api/gmail/oauth/callback') {
      const code = query.code;
      const error = query.error;
      
      if (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error }));
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No authorization code provided' }));
        return;
      }

      // Redirect back to frontend
      res.writeHead(302, { 'Location': `https://redstone-backend-1.onrender.com?gmail=connected&code=${code}` });
      res.end();
      return;
    }

    if (pathname === '/api/calendar/oauth/callback') {
      const code = query.code;
      const error = query.error;
      
      if (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error }));
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No authorization code provided' }));
        return;
      }

      // Redirect back to frontend
      res.writeHead(302, { 'Location': `https://redstone-backend-1.onrender.com?calendar=connected&code=${code}` });
      res.end();
      return;
    }

    // Team endpoints
    if (pathname === '/api/team/usage') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        plan: 'free',
        messagesUsed: 5,
        messagesDaily: 10,
        retention: 7,
        pricing: {
          free: { name: 'Free', price: 0, messages: 10, retention: 7, topics: 3 },
          basic: { name: 'Basic', price: 30, messages: 2000, retention: 90, topics: 'unlimited' },
          pro: { name: 'Pro', price: 80, messages: 10000, retention: 270, topics: 'unlimited' },
          business: { name: 'Business', price: 250, messages: 50000, retention: 540, topics: 'unlimited' },
          enterprise: { name: 'Enterprise', price: 'custom', messages: 'unlimited', retention: 'unlimited', topics: 'unlimited' }
        }
      }));
      return;
    }

    if (pathname === '/api/team/activity') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        activity: [
          { id: 1, description: 'Slack connected', display_name: 'Demo User', created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: 2, description: 'Gmail synced 45 messages', display_name: 'Demo User', created_at: new Date(Date.now() - 7200000).toISOString() },
          { id: 3, description: 'Calendar imported 12 events', display_name: 'Demo User', created_at: new Date(Date.now() - 10800000).toISOString() }
        ]
      }));
      return;
    }

    if (pathname === '/api/team/integrations') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        slack: { status: 'not_connected', metadata: {} },
        gmail: { status: 'not_connected', metadata: {} },
        google_calendar: { status: 'not_connected', metadata: {} }
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
