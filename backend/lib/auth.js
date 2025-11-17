// backend/lib/auth.js
// Minimal JWT helper. In real production use Cognito or proper IdP.
// Here, JWT is optional. If missing/invalid, we fall back to anonymous user.

const jwt = require('jsonwebtoken');

/**
 * Extracts user information from JWT token if present.
 * Token is expected as ?token=... (querystring) on $connect.
 */
function parseUserFromEvent(event) {
  const { queryStringParameters = {} } = event;
  const token = queryStringParameters.token;
  const userNameFromQuery = queryStringParameters.userName;

  if (!token) {
    // Anonymous / dev mode
    return {
      userId: null,
      userName: userNameFromQuery || 'Guest',
      isAuthenticated: false
    };
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const payload = jwt.verify(token, secret);

    // Expect fields like sub / user_id / email / name depending on provider
    const userId = payload.sub || payload.user_id || payload.id || null;
    const userName =
      payload.name || payload.preferred_username || userNameFromQuery || 'User';

    return {
      userId,
      userName,
      isAuthenticated: true,
      raw: payload
    };
  } catch (err) {
    console.error('JWT validation failed', err);
    // fail-open for demo mode
    return {
      userId: null,
      userName: userNameFromQuery || 'Guest',
      isAuthenticated: false
    };
  }
}

module.exports = {
  parseUserFromEvent
};
