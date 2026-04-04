# 🔴 Redstone API Reference

**Base URL:** `http://localhost:3001/api`

All endpoints return JSON. The app currently uses mock data but the structure is production-ready.

---

## 🔐 Authentication Endpoints

### POST /auth/register
Create a new account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing fields or user exists
- `500` - Server error

---

### POST /auth/login
Login with email and password

**Request:**
```json
{
  "email": "demo@redstone.com",
  "password": "demo123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_1",
    "email": "demo@redstone.com",
    "name": "John Doe"
  }
}
```

---

### POST /auth/google
Google OAuth callback

**Request:**
```json
{
  "googleId": "google_123",
  "email": "user@gmail.com",
  "name": "Jane Smith",
  "avatar": "https://..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_456",
    "email": "user@gmail.com",
    "name": "Jane Smith"
  }
}
```

---

## 👥 Team Endpoints

### GET /team/status
Get current team information

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "team_1",
  "name": "Acme Corp",
  "plan": "pro",
  "planDetails": {
    "messagesPerDay": 10000,
    "retention": 200,
    "topics": "unlimited",
    "price": 80
  }
}
```

---

### GET /team/usage
Get current usage statistics

**Response:**
```json
{
  "messagesUsedToday": 840,
  "messagesLimit": 10000,
  "percentageUsed": 8,
  "retentionDays": 200,
  "topicsActive": 3,
  "topicsLimit": "unlimited"
}
```

---

### GET /team/activity
Get recent team activity

**Response:**
```json
[
  {
    "id": "act_1",
    "teamId": "team_1",
    "user": "Alex",
    "userInitials": "AS",
    "action": "searched for",
    "target": "\"Q3 goals\"",
    "timestamp": "2026-04-03T12:00:00Z"
  },
  {
    "id": "act_2",
    "teamId": "team_1",
    "user": "Maria",
    "userInitials": "MK",
    "action": "connected",
    "target": "Gmail",
    "timestamp": "2026-04-03T11:15:00Z"
  }
]
```

---

## 🔍 Recall (Search) Endpoints

### POST /recall
Semantic search across all messages

**Request:**
```json
{
  "query": "API key"
}
```

**Response:**
```json
{
  "query": "API key",
  "results": [
    {
      "id": "msg_1",
      "content": "make sure to update the API key in production before the release",
      "source": "slack",
      "channel": "#engineering-leads",
      "timestamp": "2026-04-03T14:00:00Z",
      "snippet": "...make sure to update the <span class=\"highlight\">API key</span> in production...",
      "highlighted": "<span class=\"highlight\">API</span> key"
    },
    {
      "id": "msg_2",
      "content": "The new API key for the Stripe integration is now available in the vault.",
      "source": "telegram",
      "channel": "Product Sync",
      "timestamp": "2026-04-02T10:00:00Z",
      "snippet": "The new <span class=\"highlight\">API key</span> for Stripe...",
      "highlighted": "<span class=\"highlight\">API</span> key"
    }
  ],
  "totalResults": 3,
  "executionTime": 145
}
```

**Query Types Supported:**
- Natural language: `"What's the API key?"`
- Keywords: `"API key"`
- Phrases: `"final security audit"`
- Names: `"Sarah"` or `"project deadline"`

---

## 📊 Pulse (Recap) Endpoints

### GET /pulse/latest
Get the most recent pulse (weekly recap)

**Response:**
```json
{
  "id": "pulse_1",
  "teamId": "team_1",
  "weekStart": "2026-03-10T00:00:00Z",
  "discussions": [
    "Finalized the Q2 roadmap for the mobile app redesign.",
    "Discussed migrating the database to TiDB for better scalability."
  ],
  "unresolvedQuestions": [
    "Who is responsible for the final security audit of the API?"
  ],
  "actionItems": [
    {
      "owner": "Sarah",
      "task": "Research TiDB migration options",
      "dueDate": "2026-03-24"
    },
    {
      "owner": "Mike",
      "task": "Update documentation for v2.0",
      "dueDate": "2026-03-20"
    }
  ],
  "createdAt": "2026-03-17T09:00:00Z"
}
```

---

### POST /pulse/generate
Generate a pulse (weekly recap) on-demand

**Response:**
```json
{
  "id": "pulse_999",
  "weekStart": "2026-03-27T00:00:00Z",
  "weekEnd": "2026-04-03T00:00:00Z",
  "discussions": [
    "Started Q2 planning discussions",
    "Reviewed API performance metrics"
  ],
  "unresolvedQuestions": [
    "Timeline for database migration?"
  ],
  "actionItems": [
    {
      "owner": "DevOps",
      "task": "Schedule sync with DevOps",
      "dueDate": "2026-04-05"
    }
  ],
  "generatedAt": "2026-04-03T18:30:00Z"
}
```

---

## 🔧 Tools (Integrations) Endpoints

### GET /tools
List all connected tools for the team

**Response:**
```json
[
  {
    "id": "tool_slack",
    "teamId": "team_1",
    "name": "Slack",
    "type": "slack",
    "status": "connected",
    "account": "Acme Corp Workspace",
    "lastSync": "2026-04-03T18:25:00Z",
    "connectedAt": "2026-03-04T00:00:00Z"
  },
  {
    "id": "tool_gmail",
    "teamId": "team_1",
    "name": "Gmail",
    "type": "email",
    "status": "connected",
    "account": "team@acme.com",
    "lastSync": "2026-04-03T18:00:00Z",
    "connectedAt": "2026-03-19T00:00:00Z"
  },
  {
    "id": "tool_calendar",
    "teamId": "team_1",
    "name": "Google Calendar",
    "type": "calendar",
    "status": "connected",
    "account": "team@acme.com",
    "lastSync": "2026-04-03T18:20:00Z",
    "connectedAt": "2026-02-17T00:00:00Z"
  }
]
```

---

### POST /tools/connect
Connect a new integration

**Request:**
```json
{
  "toolType": "slack",
  "account": "workspace@acme.com"
}
```

**Response:**
```json
{
  "success": true,
  "tool": {
    "id": "tool_slack_new",
    "teamId": "team_1",
    "name": "Slack",
    "type": "slack",
    "status": "connected",
    "account": "workspace@acme.com",
    "connectedAt": "2026-04-03T18:45:00Z"
  }
}
```

**Valid toolTypes:**
- `slack`
- `email`
- `calendar`
- `telegram` (future)
- `notes`

---

### POST /tools/disconnect
Disconnect an integration

**Request:**
```json
{
  "toolId": "tool_slack"
}
```

**Response:**
```json
{
  "success": true
}
```

---

## 🏥 Health & Status

### GET /health
Check if API is running

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-03T18:50:00Z",
  "version": "1.0.0"
}
```

---

## 🔒 Authentication

### How to Use Tokens

After logging in, you'll receive a JWT token. Use it in the header:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  http://localhost:3001/api/team/status
```

### Token Expiration

- Development: 7 days
- Production: 7 days (configurable)
- Refresh: Not yet implemented (plan for next phase)

### OAuth Flows

For Slack, Gmail, and Google Calendar:

1. User clicks "Connect [Tool]"
2. Redirected to provider (Slack/Google)
3. User approves permissions
4. Redirected back to app with code
5. Backend exchanges code for token
6. Token stored in database (encrypted in production)

---

## 📈 Pagination (Future)

Currently, all results return fully. Future updates will add:

```
?page=1&limit=20
```

For Recall, Pulse, and Activity endpoints.

---

## ⏱️ Rate Limiting (Future)

Currently unlimited. Production implementation will include:

- Per-user: 100 requests/minute
- Per-team: 1000 requests/minute
- Response header: `X-RateLimit-Remaining`

---

## 🧪 Testing Endpoints

### Test with cURL

```bash
# Check if server is running
curl http://localhost:3001/api/health

# Search for messages
curl -X POST http://localhost:3001/api/recall \
  -H "Content-Type: application/json" \
  -d '{"query": "API key"}'

# Get latest pulse
curl http://localhost:3001/api/pulse/latest

# Get tools
curl http://localhost:3001/api/tools

# Get team usage
curl http://localhost:3001/api/team/usage
```

### Test with Postman

Import this Postman collection URL:
*(Will be added after deployment)*

### Test with JavaScript

```javascript
const API_URL = 'http://localhost:3001/api';

// Search
const response = await fetch(`${API_URL}/recall`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'API key' })
});
const data = await response.json();
console.log(data.results);
```

---

## 🚨 Error Handling

### Error Response Format

```json
{
  "error": "Query required"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing data) |
| 401 | Unauthorized (invalid token) |
| 404 | Not found |
| 500 | Server error |

---

## 🔮 Future Endpoints (Not Yet Implemented)

These are planned but not in MVP:

```
POST   /api/messages                - Store raw message
POST   /api/notes                   - Create/update internal note
GET    /api/notes/:id               - Get note
DELETE /api/notes/:id               - Delete note
POST   /api/users/profile           - Update profile
GET    /api/stripe/subscribe        - Create subscription
POST   /api/webhook/slack           - Slack event webhook
POST   /api/webhook/gmail           - Gmail push notification webhook
GET    /api/admin/logs              - View admin logs
POST   /api/admin/team/:id/reset    - Admin reset team usage
```

---

## 📚 API Documentation

For each endpoint in production, full OpenAPI/Swagger docs will be available at:
```
GET /api/docs
```

This will auto-generate interactive documentation.

---

## 💡 Tips

1. **Auth:** Most endpoints don't require auth yet (using mock data). In production, add `Authorization` header.

2. **Embedding:** When connecting to real APIs, the `/recall` endpoint will generate embeddings using OpenAI API.

3. **Groq Integration:** The `/pulse/generate` endpoint will call Groq API to analyze messages.

4. **Slack Commands:** `/recall query` and `/pulse` commands will hit these endpoints.

5. **Caching:** Add caching to `/team/usage` (updated every hour) for performance.

---

**Created:** April 3, 2026
**API Version:** 1.0.0
**Status:** MVP (Mock data)
