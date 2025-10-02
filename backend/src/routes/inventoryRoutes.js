import express from 'express';
import { authRequired, managerOrAdmin } from '../middleware/auth.js';
import { listItems, listItemsForUser, getItem, getItemForUser, createItem, updateItem, deleteItem, listStatusHistory, createClaim, listClaims, approveClaim, listClaimsPaged, requestEquipmentReturn, approveEquipmentReturn, listUserClaimedEquipment, listPendingReturns, listClaimsByUser, createItemRequest, listItemRequests, decideItemRequest, castVoteOnRequest, listApprovedRequestsForVoting } from '../models/inventoryModel.js';
import { pool } from '../db.js';

const router = express.Router();

// All inventory routes require authentication.
// Write operations (create/update/delete) remain restricted to manager/admin.
router.use(authRequired);

// Debug request logger (enabled via DEBUG_INVENTORY=true)
if (process.env.DEBUG_INVENTORY === 'true') {
  router.use((req,res,next) => {
    console.log('[inventory] incoming', req.method, req.originalUrl);
    next();
  });
}

// READ: Allow any authenticated role to list inventory (students/teachers/staff get read-only access)
router.get('/', async (req,res) => {
  const { category, status } = req.query;
  const filters = {};
  if (category) filters.category = category;
  if (status) filters.status = status;
  // Segmented visibility per manager inventory
  const items = await listItemsForUser(req.user, filters);
  res.json({ items });
});

// ------------------------------------------------------------
// CLAIMS (define BEFORE generic :id routes to avoid conflicts)
// ------------------------------------------------------------

// Consolidated paginated claims list (manager/admin). Query: ?page=&limit=&status=
router.get('/claims', managerOrAdmin, async (req,res) => {
  const { page, limit, status, itemStatus } = req.query;
  try {
    const data = await listClaimsPaged({ status: status || 'pending', page, limit, itemStatus });
    res.json(data);
  } catch(e) {
    res.status(400).json({ error: e.message || 'Cannot list claims' });
  }
});

// Analytics summary for manager dashboard (items, claims, returns)
router.get('/analytics/summary', managerOrAdmin, async (req,res) => {
  try {
    // Scope: manager sees only their own created items & claims related to their items; admin sees global.
    const managerId = req.user.role === 'manager' ? req.user.id : null;
    const whereItems = managerId ? 'WHERE created_by = $1' : '';
    const whereClaims = managerId ? 'WHERE i.created_by = $1' : '';
    const whereReturns = managerId ? 'AND i.created_by = $1' : '';
    const params = managerId ? [managerId] : [];
    const itemsSql = `SELECT status, category, COUNT(*)::int AS count FROM inventory_items ${whereItems} GROUP BY status, category`;
    const claimsSql = `SELECT c.status, COUNT(*)::int AS count FROM inventory_claims c JOIN inventory_items i ON i.id = c.item_id ${whereClaims} GROUP BY c.status`;
    const returnsPendingSql = `SELECT COUNT(*)::int AS pending_returns FROM inventory_items i WHERE i.status='in_use' AND i.return_status='pending' ${whereReturns}`;
    const returnsBreakdownSql = `SELECT COALESCE(NULLIF(i.return_status,''),'none') AS return_status, COUNT(*)::int AS count
                                 FROM inventory_items i
                                 WHERE i.category='equipment' AND i.status='in_use' ${whereReturns.replace('AND','AND')}
                                 GROUP BY COALESCE(NULLIF(i.return_status,''),'none')`;
    const totalInUseSql = `SELECT COUNT(*)::int AS total_in_use FROM inventory_items i WHERE i.category='equipment' AND i.status='in_use' ${whereReturns}`;
    const [itemsRes, claimsRes, returnsPendingRes, returnsBreakdownRes, totalInUseRes] = await Promise.all([
      pool.query(itemsSql, params),
      pool.query(claimsSql, params),
      pool.query(returnsPendingSql, params),
      pool.query(returnsBreakdownSql, params),
      pool.query(totalInUseSql, params)
    ]);
    res.json({
      items: itemsRes.rows,
      claims: claimsRes.rows,
      returns: {
        pending_returns: (returnsPendingRes.rows[0] || { pending_returns:0 }).pending_returns,
        total_in_use: (totalInUseRes.rows[0] || { total_in_use:0 }).total_in_use,
        breakdown: returnsBreakdownRes.rows
      }
    });
  } catch(e){
    res.status(400).json({ error: e.message || 'Analytics error' });
  }
});

// User: list their claimed (in_use) equipment
router.get('/my/claimed-equipment', async (req,res) => {
  try {
    const rows = await listUserClaimedEquipment(req.user.id);
    res.json({ items: rows });
  } catch(e) { res.status(400).json({ error:e.message }); }
});

// User: list their claim requests (pending/approved/rejected)
router.get('/my/claims', async (req,res) => {
  const { status } = req.query;
  try {
    const rows = await listClaimsByUser(req.user.id, status);
    res.json({ claims: rows });
  } catch(e) { res.status(400).json({ error:e.message }); }
});

// User: request return of an in_use equipment row
router.post('/returns/:id/request', async (req,res) => {
  try {
    const updated = await requestEquipmentReturn(req.params.id, req.user.id);
    if(!updated) return res.status(404).json({ error:'Not found or not returnable' });
    res.json({ item: updated });
  } catch(e){ res.status(400).json({ error:e.message }); }
});

// Manager/Admin: list pending returns
router.get('/returns/pending', managerOrAdmin, async (_req,res) => {
  try {
    const rows = await listPendingReturns();
    res.json({ items: rows });
  } catch(e){ res.status(400).json({ error:e.message }); }
});

// Manager/Admin: approve a return (equipment goes back to available pool)
router.post('/returns/:id/approve', managerOrAdmin, async (req,res) => {
  try {
    await approveEquipmentReturn(req.params.id, req.user.id);
    res.json({ success:true });
  } catch(e){ res.status(400).json({ error:e.message }); }
});

// Approve / Reject claim (manager/admin only)
router.post('/claims/:claimId/decision', managerOrAdmin, async (req,res) => {
  try {
    const { approve = true } = req.body || {};
    await approveClaim(req.params.claimId, req.user.id, !!approve);
    res.json({ success:true });
  } catch(e) {
    const msg = (e && e.message) ? e.message : 'Decision failed';
    let code = 400;
    const lower = msg.toLowerCase();
    if (lower.includes('not found')) code = 404;
    else if (lower.includes('already decided')) code = 409; // conflict
    else if (lower.includes('insufficient') || lower.includes('out of stock') || lower.includes('not available')) code = 422; // unprocessable
    console.error('[claim-decision-error]', { claimId: req.params.claimId, approve: req.body?.approve, user: req.user?.id, role: req.user?.role, error: msg });
    res.status(code).json({ error: msg });
  }
});

// =====================
// Item Requests & Voting
// =====================
router.post('/requests', async (req,res) => {
  try {
    const created = await createItemRequest(req.user, req.body||{});
    res.status(201).json({ request: created });
  } catch(e){ res.status(400).json({ error: e.message||'Cannot create request' }); }
});

router.get('/requests', async (req,res) => {
  try {
    // Support a special pseudo-filter 'mine' to return only current user's requests
    const status = req.query.status;
    const rows = await listItemRequests(req.user, { status: (status && !['mine'].includes(status)) ? status : undefined });
    const filtered = status === 'mine' ? rows.filter(r => r.requested_by === req.user.id) : rows;
    res.json({ requests: filtered });
  } catch(e){
    console.error('[requests-list-error]', e); // surface full stack for debugging 400s
    res.status(400).json({ error:e.message || 'Cannot list requests' });
  }
});

router.post('/requests/:id/decision', managerOrAdmin, async (req,res) => {
  try {
    const { approve=true } = req.body||{};
    const updated = await decideItemRequest(req.params.id, req.user, !!approve);
    res.json({ request: updated });
  } catch(e){ res.status(400).json({ error:e.message }); }
});

router.get('/requests/approved/voting', async (req,res) => {
  try {
    const rows = await listApprovedRequestsForVoting(req.user);
    res.json({ requests: rows });
  } catch(e){ res.status(400).json({ error:e.message }); }
});

router.post('/requests/:id/vote', async (req,res) => {
  try {
    const result = await castVoteOnRequest(req.user, req.params.id);
    res.json(result);
  } catch(e){ res.status(400).json({ error:e.message }); }
});

// CREATE: Restricted
router.post('/', managerOrAdmin, async (req,res) => {
  try {
    const item = await createItem(req.body, req.user.id);
    res.status(201).json({ item });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Invalid item data' });
  }
});

router.get('/:id(\\d+)', async (req,res) => {
  const item = await getItemForUser(req.params.id, req.user);
  if (!item) return res.status(404).json({ error:'Not found' });
  if (item.__forbidden) return res.status(403).json({ error:'Forbidden' });
  res.json({ item });
});

// UPDATE: Restricted
router.put('/:id(\\d+)', managerOrAdmin, async (req,res) => {
  try {
    const item = await updateItem(req.params.id, req.body, req.user.id);
    if (!item) return res.status(404).json({ error:'Not found' });
    res.json({ item });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Update failed' });
  }
});

router.get('/:id(\\d+)/history', async (req,res) => {
  const item = await getItemForUser(req.params.id, req.user);
  if (!item) return res.status(404).json({ error:'Not found' });
  if (item.__forbidden) return res.status(403).json({ error:'Forbidden' });
  const history = await listStatusHistory(req.params.id);
  res.json({ history });
});

// Per-item claims endpoints (after /claims routes so they don't get shadowed)
router.get('/:id(\\d+)/claims', async (req,res) => {
  const item = await getItemForUser(req.params.id, req.user);
  if (!item) return res.status(404).json({ error:'Not found' });
  if (item.__forbidden) return res.status(403).json({ error:'Forbidden' });
  const filters = { itemId: req.params.id };
  if (!['manager','admin'].includes(req.user.role)) filters.requestedBy = req.user.id;
  const claims = await listClaims(filters);
  res.json({ claims });
});

// Alias without numeric regex (some environments reported 404 with regex variant)
router.get('/:id/claims', async (req,res, next) => {
  if (/^\d+$/.test(req.params.id)) return next(); // let the regex route handle
  return res.status(400).json({ error:'Invalid item id' });
});

router.post('/:id(\\d+)/claims', async (req,res) => {
  try {
    const item = await getItemForUser(req.params.id, req.user);
    if (!item) return res.status(404).json({ error:'Not found' });
    if (item.__forbidden) return res.status(403).json({ error:'Forbidden' });
    const { quantity, note } = req.body || {};
    const claim = await createClaim(req.params.id, req.user.id, quantity, note);
    res.status(201).json({ claim });
  } catch(e) {
    res.status(400).json({ error: e.message || 'Cannot create claim' });
  }
});

// Alias non-regex version for environments where pattern may fail to match
router.post('/:id/claims', async (req,res,next) => {
  if (/^\d+$/.test(req.params.id)) return next(); // let regex handler above run first
  return res.status(400).json({ error:'Invalid item id' });
});

// DELETE: Restricted
router.delete('/:id(\\d+)', managerOrAdmin, async (req,res) => {
  const item = await getItem(req.params.id);
  if (!item) return res.status(404).json({ error:'Not found' });
  await deleteItem(req.params.id);
  res.status(204).end();
});

export default router;

// Optionally list registered inventory routes for debugging when DEBUG_INVENTORY=true
if (process.env.DEBUG_INVENTORY === 'true') {
  const routes = [];
  router.stack.forEach(layer => {
    if (!layer.route) return;
    const methods = Object.keys(layer.route.methods).filter(m=>layer.route.methods[m]).join(',');
    routes.push({ methods, path: layer.route.path });
  });
  console.log('[inventory] registered routes:', routes);
}
