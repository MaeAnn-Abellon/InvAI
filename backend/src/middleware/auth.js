import jwt from 'jsonwebtoken';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, username: user.username, department: user.department || null, course: user.course || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function managerOrAdmin(req, res, next) {
  if (['manager', 'admin'].includes(req.user.role)) return next();
  return res.status(403).json({ error: 'Forbidden' });
}