import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '../config/database.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, floor } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Benutzername, E-Mail und Passwort erforderlich' });
    }

    // Check if user exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser) {
      return res.status(409).json({ error: 'Benutzer existiert bereits' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await queryOne(
      `INSERT INTO users (username, email, password_hash, full_name, floor)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, full_name, floor`,
      [username, email, passwordHash, fullName, floor]
    );

    // Generate token
    const token = jwt.sign(
      { userId: result.id, email: result.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: result,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registrierung fehlgeschlagen' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' });
    }

    // Find user
    const user = await queryOne(
      'SELECT id, username, email, password_hash, full_name, floor FROM users WHERE username = $1',
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Anmeldung fehlgeschlagen' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }

  res.json({ userId: req.userId, email: req.userEmail });
});

export default router;
