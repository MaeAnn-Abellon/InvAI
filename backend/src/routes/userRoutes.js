import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authRequired, managerOrAdmin } from '../middleware/auth.js';
import { getAllUsers, getUser, updateUser, deleteUser, createUser } from '../models/userModel.js';
import { pool } from '../db.js';

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

router.get('/', authRequired, managerOrAdmin, async (req, res) => {
  let users = await getAllUsers();
  const { department, course } = req.query;
  if (department) {
    const dep = department.toLowerCase();
    users = users.filter(u => (u.department||'').toLowerCase() === dep);
  }
  if (course) {
    const c = course.toLowerCase();
    users = users.filter(u => (u.course||'').toLowerCase() === c);
  }
  res.json({ users });
});

// Create user (admin only)
router.post('/', authRequired, async (req,res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const user = await createUser(req.body);
    res.status(201).json({ user });
  } catch(e) {
    res.status(400).json({ error: e.message || 'Create failed' });
  }
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

// Manager activity endpoint
router.get('/:id/activity', authRequired, async (req, res) => {
  try {
    // Only managers can access their own activity, or admins can access any manager's activity
    const targetUserId = parseInt(req.params.id);
    if (req.user.role !== 'admin' && (req.user.id !== targetUserId || req.user.role !== 'manager')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const activity = [];

    // Get recent approved/rejected requests
    const requestQuery = `
      SELECT 
        'request_decision' as type,
        'Approved request #' || r.id || ' (' || r.item_name || ')' as description,
        r.decided_at as activity_time
      FROM item_requests r
      WHERE r.approved_by = $1 AND r.decided_at IS NOT NULL
      ORDER BY r.decided_at DESC
      LIMIT 5
    `;
    const { rows: requests } = await pool.query(requestQuery, [targetUserId]);
    activity.push(...requests);

    // Get recent inventory items created
    const inventoryQuery = `
      SELECT 
        'inventory_create' as type,
        'Created inventory item: ' || i.name as description,
        i.created_at as activity_time
      FROM inventory_items i
      WHERE i.created_by = $1
      ORDER BY i.created_at DESC
      LIMIT 5
    `;
    const { rows: inventory } = await pool.query(inventoryQuery, [targetUserId]);
    activity.push(...inventory);

    // Get recent inventory status changes
    const statusQuery = `
      SELECT 
        'inventory_status' as type,
        'Updated ' || i.name || ' status' as description,
        h.changed_at as activity_time
      FROM inventory_item_status_history h
      JOIN inventory_items i ON h.item_id = i.id
      WHERE h.changed_by = $1
      ORDER BY h.changed_at DESC
      LIMIT 5
    `;
    const { rows: statusChanges } = await pool.query(statusQuery, [targetUserId]);
    activity.push(...statusChanges);

    // Sort all activities by time (most recent first) and take top 10
    const sortedActivity = activity
      .sort((a, b) => new Date(b.activity_time) - new Date(a.activity_time))
      .slice(0, 10)
      .map(item => ({
        type: item.type,
        description: item.description,
        time: item.activity_time,
        timeAgo: getTimeAgo(item.activity_time)
      }));

    res.json({ activity: sortedActivity });
  } catch(e) {
    console.error('[manager-activity-error]', e);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Helper function to calculate time ago
function getTimeAgo(dateTime) {
  const now = new Date();
  const past = new Date(dateTime);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}

router.delete('/:id', authRequired, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  await deleteUser(req.params.id);
  res.json({ success: true });
});

export default router;