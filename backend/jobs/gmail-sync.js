const cron = require('node-cron');
const { google } = require('googleapis');
const { query } = require('../services/db');
const { indexMessage } = require('../services/embeddings');

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('[Gmail Sync] Starting hourly sync...');

  try {
    const integrations = await query(
      `SELECT i.*, i.team_id FROM integrations i
       WHERE i.type = 'gmail' AND i.status = 'connected'`
    );

    for (const integration of integrations.rows) {
      try {
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({
          access_token: integration.access_token,
          refresh_token: integration.refresh_token
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        // Fetch emails from last hour
        const listResult = await gmail.users.messages.list({
          userId: 'me',
          maxResults: 20,
          q: 'newer_than:2h' // slight overlap to avoid missing
        });

        const messages = listResult.data.messages || [];

        for (const msg of messages) {
          // Check if already indexed
          const exists = await query(
            'SELECT id FROM messages WHERE source_id = $1 AND team_id = $2',
            [msg.id, integration.team_id]
          );
          if (exists.rows.length > 0) continue;

          const full = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From', 'Date']
          });

          const headers = full.data.payload?.headers || [];
          const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
          const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
          const date = headers.find(h => h.name === 'Date')?.value;
          const snippet = full.data.snippet || '';

          if (snippet.length < 10) continue;

          await indexMessage({ query }, {
            teamId: integration.team_id,
            source: 'gmail',
            sourceId: msg.id,
            sourceChannel: 'Email',
            sourceUrl: `https://mail.google.com/mail/u/0/#inbox/${msg.id}`,
            authorName: from,
            authorId: from,
            content: `Subject: ${subject}\n${snippet}`,
            sentAt: date ? new Date(date) : new Date(),
            metadata: { subject, from }
          });
        }

        console.log(`[Gmail Sync] Synced ${messages.length} emails for team ${integration.team_id}`);
      } catch (err) {
        console.error(`[Gmail Sync] Failed for team ${integration.team_id}:`, err.message);
        // Mark as error if token refresh fails
        if (err.message?.includes('invalid_grant')) {
          await query(
            `UPDATE integrations SET status = 'error' WHERE id = $1`,
            [integration.id]
          );
        }
      }
    }

    console.log('[Gmail Sync] Done.');
  } catch (err) {
    console.error('[Gmail Sync] Fatal error:', err);
  }
});

console.log('[Gmail Sync] Scheduled — runs every hour');
