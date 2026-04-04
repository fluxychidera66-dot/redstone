const jwt = require('jsonwebtoken');
const { query } = require('../services/db');

/**
 * Demo mode user (when MOCK_MODE is enabled)
 */
const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@redstone.ai',
  display_name: 'Demo User',
  avatar_url: null,
  role: 'admin',
  team_id: 'demo-team-001',
  plan: 'free',
  daily_message_limit: 999,
  memory_days: 90,
  max_topics: 50
};

/**
 * Verify JWT and attach user + team to req
 * In demo mode (MOCK_MODE=true), skip auth and use demo user
 */
const authenticate = async (req, res, next) => {
  try {
    // Demo mode: skip auth
    if (process.env.MOCK_MODE === 'true') {
      req.user = DEMO_USER;
      req.teamId = DEMO_USER.team_id;
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB
    const result = await query(
      `SELECT u.*, t.plan, t.daily_message_limit, t.memory_days, t.max_topics,
              t.stripe_customer_id, t.stripe_subscription_id
       FROM users u
       JOIN teams t ON t.id = u.team_id
       WHERE u.id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    req.teamId = result.rows[0].team_id;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    next(err);
  }
};

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * Check daily usage limits
 * Skip in demo mode
 */
const checkUsageLimit = async (req, res, next) => {
  try {
    // Demo mode: skip usage limits
    if (process.env.MOCK_MODE === 'true') {
      req.usageUsed = 0;
      req.usageLimit = 999;
      return next();
    }

    const result = await query(
      `SELECT message_count FROM usage_logs
       WHERE team_id = $1 AND date = CURRENT_DATE`,
      [req.teamId]
    );

    const used = result.rows[0]?.message_count || 0;
    const limit = req.user.daily_message_limit;

    if (used >= limit) {
      const planNames = { free: 'Basic ($30/mo)', basic: 'Pro ($80/mo)', pro: 'Business ($250/mo)' };
      const upgrade = planNames[req.user.plan] || 'a higher plan';
      return res.status(429).json({
        error: `Free limit reached (${limit} msgs/day). Upgrade to ${upgrade} for more.`,
        used,
        limit,
        plan: req.user.plan
      });
    }

    req.usageUsed = used;
    req.usageLimit = limit;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Increment message usage count
 */
const incrementUsage = async (teamId, type = 'message') => {
  const col = type === 'recall' ? 'recall_count' : 'message_count';
  await query(
    `INSERT INTO usage_logs (team_id, date, ${col})
     VALUES ($1, CURRENT_DATE, 1)
     ON CONFLICT (team_id, date)
     DO UPDATE SET ${col} = usage_logs.${col} + 1, updated_at = NOW()`,
    [teamId]
  );
};

module.exports = { authenticate, requireAdmin, checkUsageLimit, incrementUsage };
