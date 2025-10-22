import express from 'express';
import { authRequired, managerOrAdmin } from '../middleware/auth.js';
import { listItems, listItemsForUser, getItem, getItemForUser, createItem, updateItem, deleteItem, listStatusHistory, createClaim, listClaims, approveClaim, listClaimsPaged, requestEquipmentReturn, approveEquipmentReturn, listUserClaimedEquipment, listPendingReturns, listClaimsByUser, createItemRequest, listItemRequests, decideItemRequest, castVoteOnRequest, listApprovedRequestsForVoting, forecastDepletion, monthlyInventoryAnalytics, adminInventoryOverview, adminInventoryOptions, adminUserAnalytics, adminClaimAnalytics, adminVoteAnalytics, weeklyTopRequestForManager, deleteItemRequest, convertRequestToInventory } from '../models/inventoryModel.js';
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
    // Pass the current user to allow manager-scoped filtering inside the model
    const data = await listClaimsPaged({ status: status || 'pending', page, limit, itemStatus, currentUser: req.user });
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

// Forecast (AI-ish depletion projection)
router.get('/forecast/depletion', managerOrAdmin, async (req,res) => {
  try {
    const { windowDays, limit } = req.query;
    const data = await forecastDepletion(req.user, { windowDays, limit });
    res.json({ forecasts: data });
  } catch(e) {
    res.status(400).json({ error: e.message || 'Forecast error' });
  }
});

// Monthly analytics: new items & status transitions in selected month
router.get('/analytics/monthly', managerOrAdmin, async (req,res) => {
  try {
    const { month } = req.query; // format YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) return res.status(400).json({ error:'Invalid or missing month (YYYY-MM)' });
    const start = new Date(month + '-01T00:00:00Z');
    const end = new Date(start); end.setUTCMonth(end.getUTCMonth()+1);
    const data = await monthlyInventoryAnalytics(req.user, { start, end });
    res.json({ analytics: data });
  } catch(e){
    res.status(400).json({ error: e.message || 'Monthly analytics error' });
  }
});

// =============================
// Admin Global Inventory Overview
// =============================
router.get('/analytics/admin/overview', async (req,res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error:'Forbidden' });
    const { department, course } = req.query;
    const data = await adminInventoryOverview({ department, course });
    res.json({ overview: data });
  } catch(e){ res.status(400).json({ error:e.message || 'Overview error' }); }
});

// Distinct department & course options for filters
router.get('/analytics/admin/options', async (req,res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error:'Forbidden' });
    const data = await adminInventoryOptions();
    res.json(data);
  } catch(e){ res.status(400).json({ error:e.message || 'Options error' }); }
});

// User role / level / course analytics
router.get('/analytics/admin/users', async (req,res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error:'Forbidden' });
    const data = await adminUserAnalytics();
    res.json({ users: data });
  } catch(e){ res.status(400).json({ error:e.message || 'User analytics error' }); }
});

// Claims analytics
router.get('/analytics/admin/claims', async (req,res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error:'Forbidden' });
    const data = await adminClaimAnalytics();
    res.json({ claims: data });
  } catch(e){ res.status(400).json({ error:e.message || 'Claim analytics error' }); }
});

// Voting analytics
router.get('/analytics/admin/votes', async (req,res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error:'Forbidden' });
    const data = await adminVoteAnalytics();
    res.json({ votes: data });
  } catch(e){ res.status(400).json({ error:e.message || 'Vote analytics error' }); }
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

// Delete (withdraw) a pending claim. Allowed if:
//  - requester themselves, OR
//  - manager/admin (any pending claim)
// Restrictions:
//  - Only status 'pending' deletable (approved claims are historical records tying to inventory changes)
router.delete('/claims/:claimId', async (req,res) => {
  try {
    const claimId = req.params.claimId;
    const { rows } = await pool.query('SELECT * FROM inventory_claims WHERE id=$1', [claimId]);
    const claim = rows[0];
    if (!claim) return res.status(404).json({ error:'Not found' });
    if (claim.status !== 'pending') return res.status(409).json({ error:'Already decided' });
    const isOwner = claim.requested_by === req.user.id;
    const elevated = ['manager','admin'].includes(req.user.role);
    if (!isOwner && !elevated) return res.status(403).json({ error:'Forbidden' });
    await pool.query('DELETE FROM inventory_claims WHERE id=$1', [claimId]);
    return res.status(204).end();
  } catch(e){
    console.error('[claim-delete-error]', e);
    res.status(400).json({ error: e.message || 'Delete failed' });
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

// Manager weekly top voted request (read-only)
router.get('/requests/voting/weekly-top', async (req,res) => {
  try {
    if (req.user.role !== 'manager') return res.status(403).json({ error:'Forbidden' });
    const top = await weeklyTopRequestForManager(req.user);
    res.json({ top });
  } catch(e){ res.status(400).json({ error: e.message || 'Weekly top error' }); }
});

// Delete a request (approved or pending) by manager/admin
router.delete('/requests/:id', managerOrAdmin, async (req,res) => {
  try {
    await deleteItemRequest(req.params.id, req.user);
    res.status(204).end();
  } catch(e){
    const msg = e.message || 'Delete failed';
    let code = 400;
    if (/not found/i.test(msg)) code = 404; else if (/forbidden/i.test(msg)) code = 403; else if (/cannot delete/i.test(msg)) code = 409;
    res.status(code).json({ error: msg });
  }
});

// Convert approved request to inventory item
router.post('/requests/:id/convert', managerOrAdmin, async (req,res) => {
  try {
    const created = await convertRequestToInventory(req.params.id, req.user);
    res.json(created);
  } catch(e){
    const msg = e.message || 'Convert failed';
    let code = 400;
    if (/not found/i.test(msg)) code=404; else if(/forbidden/i.test(msg)) code=403; else if(/approved/i.test(msg)===false) code=409;
    res.status(code).json({ error: msg });
  }
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
