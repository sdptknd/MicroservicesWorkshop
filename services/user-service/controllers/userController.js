const userService = require('../services/userService');

class UserController {
  async register(req, res) {
    try {
      const { username, password } = req.body;
      const user = await userService.register(username, password);
      res.status(201).json({ message: 'User registered', user });
    } catch (err) {
      console.error(err);
      if (err.message === 'Username and password are required') {
        return res.status(400).json({ error: err.message });
      }
      // pg unique constraint error
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Username already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const token = await userService.login(username, password);
      res.json({ message: 'Login successful', token });
    } catch (err) {
      console.error(err);
      if (err.message === 'Invalid credentials' || err.message === 'Username and password are required') {
        return res.status(401).json({ error: err.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new UserController();
