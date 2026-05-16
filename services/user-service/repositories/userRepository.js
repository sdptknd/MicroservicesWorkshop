const db = require('../db');

class UserRepository {
  async createUser(username, hashedPassword) {
    const result = await db.query(
      'INSERT INTO user_schema.users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    return result.rows[0];
  }

  async findByUsername(username) {
    const result = await db.query(
      'SELECT * FROM user_schema.users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }
}

module.exports = new UserRepository();
