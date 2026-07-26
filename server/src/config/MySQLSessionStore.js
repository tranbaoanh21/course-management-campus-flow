const session = require('express-session');
const { createHash } = require('node:crypto');

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

function hashSessionId(sessionId) {
  return createHash('sha256').update(sessionId).digest('hex');
}

class MySQLSessionStore extends session.Store {
  constructor(pool, defaultMaxAge) {
    super();
    this.pool = pool;
    this.defaultMaxAge = defaultMaxAge;
    this.lastCleanupAt = 0;
  }

  get(sessionId, callback) {
    this.pool
      .execute(
        `SELECT session_data
         FROM sessions
         WHERE session_id_hash = ? AND expires_at > NOW()`,
        [hashSessionId(sessionId)],
      )
      .then(([rows]) => {
        if (rows.length === 0) {
          callback(null, null);
          return;
        }

        const sessionData = rows[0].session_data;
        callback(null, typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData);
      })
      .catch(callback);
  }

  set(sessionId, sessionData, callback = () => {}) {
    const userId = sessionData.user?.id;

    if (!userId) {
      callback(new Error('Authenticated session is missing a user ID.'));
      return;
    }

    const expiresAt = sessionData.cookie?.expires
      ? new Date(sessionData.cookie.expires)
      : new Date(Date.now() + this.defaultMaxAge);

    this.pool
      .execute(
        `INSERT INTO sessions (session_id_hash, user_id, session_data, expires_at)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           user_id = VALUES(user_id),
           session_data = VALUES(session_data),
           expires_at = VALUES(expires_at)`,
        [hashSessionId(sessionId), userId, JSON.stringify(sessionData), expiresAt],
      )
      .then(() => {
        callback(null);
        this.cleanupExpiredSessions();
      })
      .catch(callback);
  }

  destroy(sessionId, callback = () => {}) {
    this.pool
      .execute('DELETE FROM sessions WHERE session_id_hash = ?', [hashSessionId(sessionId)])
      .then(() => callback(null))
      .catch(callback);
  }

  touch(sessionId, sessionData, callback = () => {}) {
    const expiresAt = sessionData.cookie?.expires
      ? new Date(sessionData.cookie.expires)
      : new Date(Date.now() + this.defaultMaxAge);

    this.pool
      .execute(
        `UPDATE sessions
         SET session_data = ?, expires_at = ?
         WHERE session_id_hash = ?`,
        [JSON.stringify(sessionData), expiresAt, hashSessionId(sessionId)],
      )
      .then(() => callback(null))
      .catch(callback);
  }

  cleanupExpiredSessions() {
    if (Date.now() - this.lastCleanupAt < ONE_HOUR_IN_MS) {
      return;
    }

    this.lastCleanupAt = Date.now();
    this.pool.execute('DELETE FROM sessions WHERE expires_at <= NOW()').catch((error) => {
      console.error('Unable to clean expired sessions:', error.message);
    });
  }
}

module.exports = {
  MySQLSessionStore,
  hashSessionId,
};
