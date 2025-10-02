import express from 'express';
import { createUser, verifyUser, getUser } from '../models/userModel.js';
import { signToken, authRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    console.log('REGISTER_BODY:', req.body); // debug
  // Accept both legacy 'department' (old meaning) and new 'level'
  const { fullName, email, username, password, role, level, department, course, studentId } = req.body;

    // Basic validation
    if (!fullName || !email || !username || !password) {
      return res.status(422).json({ error: 'Missing required fields (fullName,email,username,password)' });
    }

    const user = await createUser({
      fullName,
      email,
      username,
      password,
      role,
      // prefer explicit level, fallback to legacy department field for backward compatibility
      level: level || department,
      course,
      studentId
    });

    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (e) {
    console.error('REGISTER_ERROR:', e.code, e.message);
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Email or Username already exists' });
    }
    if (e.code === '42P01') { // table missing
      return res.status(500).json({ error: 'Users table missing. Run migration.' });
    }
    return res.status(400).json({ error: 'Invalid data' });
  }
});

router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;
  if (!emailOrUsername || !password)
    return res.status(422).json({ error: 'Missing credentials' });
  const user = await verifyUser(emailOrUsername, password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(user);
  res.json({ user, token });
});

router.get('/me', authRequired, async (req, res) => {
  const user = await getUser(req.user.id);
  res.json({ user });
});

export default router;