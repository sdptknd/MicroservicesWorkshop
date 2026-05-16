const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

class UserService {
  async register(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return userRepository.createUser(username, hashedPassword);
  }

  async login(username, password) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    return token;
  }
}

module.exports = new UserService();
