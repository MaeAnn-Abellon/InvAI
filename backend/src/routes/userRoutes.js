import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authRequired, managerOrAdmin } from '../middleware/auth.js';
import { getAllUsers, getUser, updateUser, deleteUser } from '../models/userModel.js';

// Simple disk storage for avatars (development). In production, use object storage.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads', 'avatars');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)||'.png';
    cb(null, `u${req.user.id}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) return cb(new Error('Invalid file type'));
    cb(null,true);
  }
});

const router = express.Router();

router.get('/', authRequired, managerOrAdmin, async (_req, res) => {
  res.json({ users: await getAllUsers() });
});

// Convenience: current user
router.get('/me', authRequired, async (req,res) => {
  const u = await getUser(req.user.id);
  res.json({ user: u });
});

router.get('/:id', authRequired, async (req, res) => {
  const u = await getUser(req.params.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json({ user: u });
});

// Full replace (legacy)
router.put('/:id', authRequired, async (req, res) => {
  if (String(req.user.id) !== req.params.id && !['admin','manager'].includes(req.user.role))
    return res.status(403).json({ error: 'Forbidden' });
  const u = await updateUser(req.params.id, req.body);
  res.json({ user: u });
});

// Partial update (preferred)
router.patch('/:id', authRequired, async (req,res) => {
  if (String(req.user.id) !== req.params.id && !['admin','manager'].includes(req.user.role))
    return res.status(403).json({ error: 'Forbidden' });
  // Restrict fields regular users can change
  const allowed = ['fullName','name','department','course','studentId','password'];
  const body = {};
  for (const k of allowed) if (req.body[k] !== undefined) body[k] = req.body[k];
  if (body.name && !body.fullName) body.fullName = body.name; // alias
  delete body.name;
  const user = await updateUser(req.params.id, body);
  res.json({ user });
});

// Avatar upload
router.post('/:id/avatar', authRequired, upload.single('avatar'), async (req,res) => {
  try {
    if (String(req.user.id) !== req.params.id) return res.status(403).json({ error:'Forbidden' });
    const relPath = `/uploads/avatars/${path.basename(req.file.path)}`;
    const user = await updateUser(req.user.id, { avatarUrl: relPath });
    res.json({ user });
  } catch(e) {
    console.error('[avatar-upload-error]', e);
    res.status(400).json({ error: e.message || 'Upload failed' });
  }
});

router.delete('/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  await deleteUser(req.params.id);
  res.json({ success: true });
});

export default router;