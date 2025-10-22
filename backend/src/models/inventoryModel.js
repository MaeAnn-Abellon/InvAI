import { pool } from '../db.js';

// Base fields (no table prefix) for simple single-table queries
const FIELDS = `id, name, description, category, status, quantity, in_use_quantity AS "inUseQuantity", created_by AS "createdBy", created_at AS "createdAt", updated_at AS "updatedAt"`;
// Prefixed variant for JOIN queries to avoid ambiguous column errors
const FIELDS_JOIN = `
  i.id AS id,
  i.name,
  i.description,
  i.category,
  i.status,
  i.quantity,
  i.in_use_quantity AS "inUseQuantity",
  i.created_by AS "createdBy",
  i.created_at AS "createdAt",
  i.updated_at AS "updatedAt"`;
const HISTORY_FIELDS = `id, item_id AS "itemId", old_status AS "oldStatus", new_status AS "newStatus", changed_by AS "changedBy", changed_at AS "changedAt"`;

// Monthly analytics: aggregate new items and status transitions within a date range
export async function monthlyInventoryAnalytics(user, { start, end }) {
  if (!start || !end) throw new Error('Missing date range');
  // Restrict to manager-owned items if manager
  const params = [start, end];
  let idx = 3;
  let ownerClause = '';
  if (user && user.role === 'manager') {
    ownerClause = 'AND i.created_by = $3';
    params.push(user.id);
  }
  // New items created in range
  const newItemsSql = `SELECT COUNT(*)::int AS count FROM inventory_items i WHERE i.created_at >= $1 AND i.created_at < $2 ${ownerClause}`;
  // Status history joined to items (to filter by owner if needed)
  const historySql = `SELECT h.old_status, h.new_status FROM inventory_item_status_history h JOIN inventory_items i ON i.id = h.item_id WHERE h.changed_at >= $1 AND h.changed_at < $2 ${ownerClause}`;
  const [newItemsRes, historyRes] = await Promise.all([
    pool.query(newItemsSql, params),
    pool.query(historySql, params)
  ]);
  const history = historyRes.rows || [];
  const counts = { outOfStockEvents:0, repairsStarted:0, repairsCompleted:0, inUseTransitions:0 };
  for (const h of history) {
    const ns = h.new_status;
    const os = h.old_status;
    if (ns === 'out_of_stock') counts.outOfStockEvents++;
    if (ns === 'for_repair') counts.repairsStarted++;
    if (ns === 'available' && os === 'for_repair') counts.repairsCompleted++;
    if (ns === 'in_use') counts.inUseTransitions++;
  }
  return {
    range: { start, end },
    newItems: (newItemsRes.rows[0] || { count:0 }).count,
    ...counts,
    statusChanges: history.length
  };
}

// =============================
// Admin-wide Inventory Analytics
// =============================
// Provides global (or filtered by department/course) overview metrics for admin dashboard.
// Only routed for admin role (enforced at route level).
export async function adminInventoryOverview({ department = null, course = null } = {}) {
  const filters = [];
  const values = [];
  let i = 1;
  if (department) { filters.push(`lower(coalesce(u.department,'')) = lower($${i++}::text)`); values.push(department); }
  if (course) { filters.push(`lower(coalesce(u.course,'')) = lower($${i++}::text)`); values.push(course); }
  const where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

  const overviewSql = `SELECT 
      COUNT(*)::int AS total_items,
      COUNT(*) FILTER (WHERE i.category='equipment')::int AS equipment_items,
      COUNT(*) FILTER (WHERE i.category='supplies')::int AS supplies_items,
      COUNT(*) FILTER (WHERE i.status IN ('available','in_stock'))::int AS available_like,
      COUNT(*) FILTER (WHERE i.status='in_use')::int AS in_use_items,
      COUNT(*) FILTER (WHERE i.status='for_repair')::int AS for_repair_items,
      COUNT(*) FILTER (WHERE i.status='out_of_stock')::int AS out_of_stock_items
    FROM inventory_items i
    LEFT JOIN users u ON u.id = i.created_by
    ${where}`;

  const statusBreakdownSql = `SELECT i.status, COUNT(*)::int AS count
    FROM inventory_items i
    LEFT JOIN users u ON u.id = i.created_by
    ${where}
    GROUP BY i.status
    ORDER BY i.status`;

  const categoryStatusSql = `SELECT i.category, i.status, COUNT(*)::int AS count
    FROM inventory_items i
    LEFT JOIN users u ON u.id = i.created_by
    ${where}
    GROUP BY i.category, i.status
    ORDER BY i.category, i.status`;

  const newLast30Sql = `SELECT COUNT(*)::int AS new_last_30
    FROM inventory_items i
    LEFT JOIN users u ON u.id = i.created_by
    ${where ? where + ' AND' : 'WHERE'} i.created_at >= NOW() - INTERVAL '30 days'`;

  const recentChangesSql = `SELECT h.new_status, COUNT(*)::int AS count
    FROM inventory_item_status_history h
    JOIN inventory_items i ON i.id = h.item_id
    LEFT JOIN users u ON u.id = i.created_by
    ${where ? where + ' AND' : 'WHERE'} h.changed_at >= NOW() - INTERVAL '30 days'
    GROUP BY h.new_status`;

  const [overviewRes, statusRes, catStatusRes, new30Res, changesRes] = await Promise.all([
    pool.query(overviewSql, values),
    pool.query(statusBreakdownSql, values),
    pool.query(categoryStatusSql, values),
    pool.query(newLast30Sql, values),
    pool.query(recentChangesSql, values)
  ]);

  return {
    scope: { department: department || null, course: course || null },
    totals: overviewRes.rows[0] || {},
    statusBreakdown: statusRes.rows,
    categoryStatus: catStatusRes.rows,
    newItemsLast30: (new30Res.rows[0] || {}).new_last_30 || 0,
    recentStatusChanges: changesRes.rows
  };
}

// Distinct department / course options for filters (based on managers owning inventory)
export async function adminInventoryOptions() {
  const depSql = `SELECT DISTINCT TRIM(LOWER(u.department)) AS department
                  FROM users u
                  WHERE u.role='manager' AND COALESCE(TRIM(u.department),'') <> ''
                  ORDER BY 1`;
  const courseSql = `SELECT DISTINCT TRIM(LOWER(u.course)) AS course
                     FROM users u
                     WHERE u.role='manager' AND COALESCE(TRIM(u.course),'') <> ''
                     ORDER BY 1`;
  const depCourseSql = `SELECT DISTINCT TRIM(LOWER(u.department)) AS department, TRIM(LOWER(u.course)) AS course
                        FROM users u
                        WHERE u.role='manager' AND COALESCE(TRIM(u.department),'') <> '' AND COALESCE(TRIM(u.course),'') <> ''`;
  const [depRes, courseRes, depCourseRes] = await Promise.all([
    pool.query(depSql),
    pool.query(courseSql),
    pool.query(depCourseSql)
  ]);
  return {
    departments: depRes.rows.map(r => r.department),
    courses: courseRes.rows.map(r => r.course),
    departmentCourses: depCourseRes.rows
  };
}

// =============================
// Additional Admin Aggregate Analytics (Users / Claims / Votes)
// =============================
export async function adminUserAnalytics() {
  const rolesSql = `SELECT role, COUNT(*)::int AS count FROM users GROUP BY role ORDER BY role`;
  const levelSql = `SELECT department AS level, COUNT(*)::int AS count FROM users GROUP BY department`;
  const courseSql = `SELECT course, COUNT(*)::int AS count FROM users WHERE course IS NOT NULL AND course <> '' GROUP BY course ORDER BY course`;
  const [rolesRes, levelRes, courseRes] = await Promise.all([
    pool.query(rolesSql),
    pool.query(levelSql),
    pool.query(courseSql)
  ]);
  return { roles: rolesRes.rows, levels: levelRes.rows, courses: courseRes.rows };
}

export async function adminClaimAnalytics() {
  const statusSql = `SELECT status, COUNT(*)::int AS count FROM inventory_claims GROUP BY status`;
  const recentSql = `SELECT DATE(decided_at) AS date, COUNT(*)::int AS count
                     FROM inventory_claims
                     WHERE decided_at >= NOW() - INTERVAL '14 days' AND decided_at IS NOT NULL
                     GROUP BY DATE(decided_at)
                     ORDER BY DATE(decided_at)`;
  const pendingAgeSql = `SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (NOW()-created_at))/3600),2),0) AS avg_pending_hours
                         FROM inventory_claims WHERE status='pending'`;
  const [statusRes, recentRes, pendingRes] = await Promise.all([
    pool.query(statusSql),
    pool.query(recentSql),
    pool.query(pendingAgeSql)
  ]);
  return { status: statusRes.rows, recent: recentRes.rows, avgPendingHours: pendingRes.rows[0]?.avg_pending_hours || 0 };
}

export async function adminVoteAnalytics() {
  // Votes per request + top voted
  const votesSql = `SELECT r.id, r.item_name, r.category, r.status, COALESCE(v.cnt,0) AS votes
                    FROM item_requests r
                    LEFT JOIN (
                      SELECT request_id, COUNT(*)::int AS cnt FROM item_request_votes GROUP BY request_id
                    ) v ON v.request_id = r.id
                    WHERE r.status='approved'
                    ORDER BY votes DESC, r.id DESC
                    LIMIT 25`;
  const totalVotesSql = `SELECT COUNT(*)::int AS total_votes FROM item_request_votes`;
  const voterRoleSql = `SELECT u.role, COUNT(*)::int AS count
                        FROM item_request_votes v
                        JOIN users u ON u.id = v.user_id
                        GROUP BY u.role`;
  const [votesRes, totalRes, voterRes] = await Promise.all([
    pool.query(votesSql),
    pool.query(totalVotesSql),
    pool.query(voterRoleSql)
  ]);
  return { topRequests: votesRes.rows, totalVotes: totalRes.rows[0]?.total_votes || 0, voterRoles: voterRes.rows };
}

export async function listItems(filters = {}) {
  const clauses = []; const values = []; let i = 1;
  if (filters.category) { clauses.push(`category = $${i++}`); values.push(filters.category); }
  if (filters.status) { clauses.push(`status = $${i++}`); values.push(filters.status); }
  if (filters.createdBy) { clauses.push(`created_by = $${i++}`); values.push(filters.createdBy); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query(`SELECT ${FIELDS} FROM inventory_items ${where} ORDER BY id DESC`, values);
  return rows;
}

// Segmented visibility: each manager has their own inventory.
// Non-manager users (student/teacher/staff) can only see items of managers whose department & course match their own.
export async function listItemsForUser(user, filters = {}) {
  if (!user) return [];
  const baseFilters = { category: filters.category, status: filters.status };
  // Admin sees all
  if (user.role === 'admin') {
    return listItems(baseFilters);
  }
  // Manager sees only their own
  if (user.role === 'manager') {
    return listItems({ ...baseFilters, createdBy: user.id });
  }
  // Student / Teacher / Staff: only see items owned by managers with same department & (course OR both null)
  const clauses = ['m.role = \'' + 'manager' + '\''];
  const values = [];
  let idx = 1;
  if (baseFilters.category) { clauses.push(`i.category = $${idx++}`); values.push(baseFilters.category); }
  if (baseFilters.status) { clauses.push(`i.status = $${idx++}`); values.push(baseFilters.status); }
  // department compare (case-insensitive)
  clauses.push(`coalesce(lower(m.department), '') = coalesce(lower($${idx}::text), '')`);
  values.push(user.department || ''); idx++;
  // course compare
  clauses.push(`coalesce(lower(m.course), '') = coalesce(lower($${idx}::text), '')`);
  values.push(user.course || ''); idx++;
  const where = 'WHERE ' + clauses.join(' AND ');
  const sql = `SELECT ${FIELDS_JOIN}
               FROM inventory_items i
               JOIN users m ON m.id = i.created_by
               ${where}
               ORDER BY i.id DESC`;
  const { rows } = await pool.query(sql, values);
  return rows;
}

// Fetch single item respecting visibility rules (see listItemsForUser)
export async function getItemForUser(id, user) {
  if (!user) return null;
  // Get raw item first
  const base = await getItem(id);
  if (!base) return null; // true not found
  if (user.role === 'admin') return base;
  if (user.role === 'manager') {
    return base.createdBy === user.id ? base : null;
  }
  // Non-manager: verify owning manager's dept/course
  const { rows: mgrRows } = await pool.query(
    `SELECT role, department, course FROM users WHERE id=$1 LIMIT 1`,
    [base.createdBy]
  );
  if (!mgrRows.length || mgrRows[0].role !== 'manager') return null; // treat as not visible
  const mgr = mgrRows[0];
  const depOk = (mgr.department || '').toLowerCase() === (user.department || '').toLowerCase();
  const courseOk = (mgr.course || '').toLowerCase() === (user.course || '').toLowerCase();
  if (depOk && courseOk) return base;
  // Return special marker object to let routes distinguish forbidden vs not found
  return { __forbidden: true };
}

export async function getItem(id) {
  const { rows } = await pool.query(`SELECT ${FIELDS} FROM inventory_items WHERE id=$1`, [id]);
  return rows[0];
}

function normalizeCategory(cat) {
  if (!cat) return 'supplies';
  const c = cat.toLowerCase();
  return ['supplies','equipment'].includes(c) ? c : 'supplies';
}

function validateStatus(category, status) {
  const sup = ['in_stock','out_of_stock'];
  const eqp = ['available','in_use','for_repair','disposed'];
  if (category === 'supplies') return sup.includes(status);
  if (category === 'equipment') return eqp.includes(status);
  return false;
}

export async function createItem(data, userId) {
  if (!data.name || typeof data.name !== 'string') throw new Error('Invalid name');
  const category = normalizeCategory(data.category);
  let status = (data.status || '').toLowerCase();
  if (!status) status = category === 'equipment' ? 'available' : 'in_stock';
  if (!validateStatus(category, status)) throw new Error('Invalid status for category');
  const qty = Number.isFinite(+data.quantity) ? Math.max(0, +data.quantity) : 0;
  const { rows } = await pool.query(
    `INSERT INTO inventory_items (name, description, category, status, quantity, created_by)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING ${FIELDS}`,
    [data.name.trim(), data.description || null, category, status, qty, userId || null]
  );
  return rows[0];
}

export async function updateItem(id, data, userId) {
  const existing = await getItem(id);
  if (!existing) return null;
  const map = { name:'name', description:'description', category:'category', status:'status', quantity:'quantity' };
  const next = { ...existing, ...data };
  next.category = normalizeCategory(next.category);
  if (data.status !== undefined) next.status = (data.status || '').toLowerCase();
  if (!validateStatus(next.category, next.status)) throw new Error('Invalid status for category');
  if (data.quantity !== undefined) {
    next.quantity = Math.max(0, Number.isFinite(+data.quantity) ? +data.quantity : existing.quantity);
  }
  const sets = []; const values = []; let i=1;
  for (const k of Object.keys(map)) {
    if (next[k] !== undefined) { sets.push(`${map[k]}=$${i++}`); values.push(next[k]); }
  }
  values.push(id);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`UPDATE inventory_items SET ${sets.join(', ')} WHERE id=$${i} RETURNING ${FIELDS}`, values);
    const updated = rows[0];
    if (existing.status !== updated.status) {
      await client.query(
        `INSERT INTO inventory_item_status_history (item_id, old_status, new_status, changed_by) VALUES ($1,$2,$3,$4)`,
        [id, existing.status, updated.status, userId || null]
      );
    }
    await client.query('COMMIT');
    return updated;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally { client.release(); }
}

export async function listStatusHistory(itemId) {
  const query = `
    SELECT 
      h.id,
      h.item_id AS "itemId",
      h.old_status AS "oldStatus", 
      h.new_status AS "newStatus",
      h.changed_by AS "changedBy",
      h.changed_at AS "changedAt",
      u.full_name AS "changedByName",
      u.role AS "changedByRole",
      u.email AS "changedByEmail",
      'status_change' as "actionType",
      NULL as "claimQuantity",
      NULL as "approvedByName",
      NULL as "approvedByRole"
    FROM inventory_item_status_history h
    LEFT JOIN users u ON h.changed_by = u.id
    WHERE h.item_id = $1 
    
    UNION ALL
    
    SELECT 
      NULL as id,
      c.item_id AS "itemId",
      NULL as "oldStatus",
      CASE 
        WHEN c.status = 'approved' THEN 'claimed'
        WHEN c.status = 'rejected' THEN 'claim_rejected'
        ELSE 'claim_pending'
      END as "newStatus", 
      c.requested_by AS "changedBy",
      COALESCE(c.decided_at, c.created_at) AS "changedAt",
      req_user.full_name AS "changedByName",
      req_user.role AS "changedByRole", 
      req_user.email AS "changedByEmail",
      'claim' as "actionType",
      c.quantity as "claimQuantity",
      app_user.full_name AS "approvedByName",
      app_user.role AS "approvedByRole"
    FROM inventory_claims c
    LEFT JOIN users req_user ON c.requested_by = req_user.id
    LEFT JOIN users app_user ON c.approved_by = app_user.id
    WHERE c.item_id = $1
    
    ORDER BY "changedAt" DESC
  `;
  const { rows } = await pool.query(query, [itemId]);
  return rows;
}

export async function deleteItem(id) {
  await pool.query('DELETE FROM inventory_items WHERE id=$1', [id]);
  return { success:true };
}

// CLAIMS
export async function createClaim(itemId, userId, qty = 1, note = null) {
  const item = await getItem(itemId);
  if (!item) throw new Error('Item not found');
  const isEquipment = item.category === 'equipment';
  const quantity = Math.max(1, Number.isFinite(+qty) ? +qty : 1);
  if (isEquipment) {
    if (item.status !== 'available') throw new Error('Equipment not available');
    if ((item.quantity || 0) < quantity) throw new Error('Insufficient available units');
  } else {
    if (item.status === 'out_of_stock') throw new Error('Item out of stock');
    if (item.quantity < quantity) throw new Error('Insufficient quantity');
  }

  const { rows } = await pool.query(
    `INSERT INTO inventory_claims (item_id, requested_by, quantity, note)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [itemId, userId || null, quantity, note || null]
  );
  return rows[0];
}

export async function listClaims(filters = {}) {
  const clauses = []; const values = []; let i = 1;
  if (filters.itemId) { clauses.push(`c.item_id = $${i++}`); values.push(filters.itemId); }
  if (filters.requestedBy) { clauses.push(`c.requested_by = $${i++}`); values.push(filters.requestedBy); }
  if (filters.status) { clauses.push(`c.status = $${i++}`); values.push(filters.status); }
  // If currentUser is a manager, scope to claims requested by users in the same department
  if (filters.currentUser && filters.currentUser.role === 'manager') {
    const mgrDept = (filters.currentUser.department || '').toString().trim().toLowerCase();
    if (mgrDept) {
      clauses.push(`COALESCE(lower(TRIM(u.department)),'') = $${i++}`);
      values.push(mgrDept);
    } else {
      // manager without department should see none
      clauses.push('1=0');
    }
  }
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  const { rows } = await pool.query(
    `SELECT c.*, u.username AS requested_by_username, u.department AS requested_by_department, i.name AS item_name
       FROM inventory_claims c
       LEFT JOIN users u ON u.id = c.requested_by
       LEFT JOIN inventory_items i ON i.id = c.item_id
     ${where}
     ORDER BY c.id DESC`, values);
  return rows;
}

// List all claims (optionally by status) for a specific user with item snapshot
export async function listClaimsByUser(userId, status) {
  const clauses = ['c.requested_by = $1'];
  const values = [userId];
  if (status) { clauses.push('c.status = $2'); values.push(status); }
  const where = 'WHERE ' + clauses.join(' AND ');
  const { rows } = await pool.query(
    `SELECT c.*, i.name AS item_name, i.category AS item_category, i.status AS item_status
       FROM inventory_claims c
       LEFT JOIN inventory_items i ON i.id = c.item_id
       ${where}
     ORDER BY c.id DESC`, values);
  return rows;
}

export async function listClaimsPaged(filters = {}) {
  const { page = 1, limit = 20 } = filters;
  const p = Math.max(1, parseInt(page,10)||1);
  const l = Math.min(100, Math.max(1, parseInt(limit,10)||20));
  const offset = (p - 1) * l;
  const clauses = []; const values = []; let i = 1;
  if (filters.itemId) { clauses.push(`c.item_id = $${i++}`); values.push(filters.itemId); }
  if (filters.requestedBy) { clauses.push(`c.requested_by = $${i++}`); values.push(filters.requestedBy); }
  if (filters.status) { clauses.push(`c.status = $${i++}`); values.push(filters.status); }
  if (filters.itemStatus) { clauses.push(`i.status = $${i++}`); values.push(filters.itemStatus); }
  // If a currentUser is provided and is a manager, scope to claims requested by users from the same department
  if (filters.currentUser && filters.currentUser.role === 'manager') {
    const mgrDept = (filters.currentUser.department || '').toString().trim();
    if (mgrDept) {
      // Use the joined users alias `u` to filter by department (case-insensitive, trimmed)
      clauses.push(`COALESCE(lower(TRIM(u.department)),'') = $${i}`);
      values.push(mgrDept.toLowerCase().trim());
      i++;
    } else {
      // Manager has no department assigned: return no rows to avoid broad exposure
      clauses.push('1=0');
    }
  }
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  const baseQuery = `FROM inventory_claims c
      LEFT JOIN users u ON u.id = c.requested_by
      LEFT JOIN inventory_items i ON i.id = c.item_id ${where}`;
  const { rows } = await pool.query(
    `SELECT c.*, u.username AS requested_by_username, u.department AS requested_by_department, i.name AS item_name, i.status AS item_status
      ${baseQuery}
      ORDER BY c.id DESC LIMIT ${l} OFFSET ${offset}`, values);
  const { rows: countRows } = await pool.query(`SELECT COUNT(*)::int AS total ${baseQuery}`, values);
  const total = countRows[0]?.total || 0;
  return { claims: rows, page: p, limit: l, total, totalPages: Math.max(1, Math.ceil(total / l)) };
}

export async function approveClaim(claimId, managerId, approve = true) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: claimRows } = await client.query('SELECT * FROM inventory_claims WHERE id=$1 FOR UPDATE', [claimId]);
    const claim = claimRows[0];
    if (!claim) throw new Error('Claim not found');
    if (claim.status !== 'pending') throw new Error('Already decided');
    const { rows: itemRows } = await client.query('SELECT * FROM inventory_items WHERE id=$1 FOR UPDATE', [claim.item_id]);
    const item = itemRows[0];
    if (!item) throw new Error('Item not found');

    if (approve) {
      if (item.category === 'equipment') {
        if (item.status !== 'available') throw new Error('Equipment not available');
        if (claim.quantity > item.quantity) throw new Error('Insufficient available units');
        const remaining = item.quantity - claim.quantity;
        // IMPORTANT: Do NOT delete the original item row before updating the claim because
        // inventory_claims.item_id has ON DELETE CASCADE. Deleting would remove the claim row,
        // and later inserting an in_use row referencing claim_id would violate FK.
        // Instead, keep the original row as the parent (quantity may become 0).
        if (remaining > 0) {
          await client.query('UPDATE inventory_items SET quantity=$1, updated_at=NOW() WHERE id=$2', [remaining, item.id]);
        } else {
          // Keep record with quantity 0 ("exhausted" available units) so claim history & FK remain valid.
          await client.query('UPDATE inventory_items SET quantity=0, updated_at=NOW() WHERE id=$1', [item.id]);
        }
        // Insert new in-use row capturing claimed units. Always reference parent_item_id = original item id.
        await client.query(
          `INSERT INTO inventory_items (name, description, category, status, quantity, created_by, parent_item_id, claimed_by, claim_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [item.name, item.description, 'equipment', 'in_use', claim.quantity, managerId || null, item.id, claim.requested_by, claim.id]
        );
      } else {
        if (item.status === 'out_of_stock') throw new Error('Out of stock');
        if (item.quantity < claim.quantity) throw new Error('Insufficient quantity');
        const newQty = item.quantity - claim.quantity;
        const newStatus = newQty === 0 ? 'out_of_stock' : item.status;
        await client.query('UPDATE inventory_items SET quantity=$1, status=$2, updated_at = NOW() WHERE id=$3', [newQty, newStatus, item.id]);
      }
      await client.query(
        `UPDATE inventory_claims SET status='approved', approved_by=$1, decided_at=NOW() WHERE id=$2`,
        [managerId || null, claim.id]
      );
    } else {
      await client.query(
        `UPDATE inventory_claims SET status='rejected', approved_by=$1, decided_at=NOW() WHERE id=$2`,
        [managerId || null, claim.id]
      );
    }
    await client.query('COMMIT');
    return { success:true };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally { client.release(); }
}

// Return workflow
export async function requestEquipmentReturn(itemId, userId) {
  // User marks an in_use equipment row for return; set return_status='pending'
  const { rows } = await pool.query(
    `UPDATE inventory_items SET return_status='pending', updated_at=NOW()
     WHERE id=$1 AND category='equipment' AND status='in_use' AND claimed_by=$2 AND (return_status IS NULL OR return_status='')
     RETURNING ${FIELDS}, return_status`, [itemId, userId]);
  return rows[0];
}

export async function approveEquipmentReturn(itemId, managerId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT * FROM inventory_items WHERE id=$1 FOR UPDATE', [itemId]);
    const row = rows[0];
    if (!row) throw new Error('Return item not found');
    if (row.category !== 'equipment' || row.status !== 'in_use') throw new Error('Not an in-use equipment item');
    if (row.return_status !== 'pending') throw new Error('Return not pending');

    // Determine merge target (parent or create new available row)
    if (row.parent_item_id) {
      // If parent still exists and is available, add quantity back
      const { rows: parentRows } = await client.query('SELECT * FROM inventory_items WHERE id=$1 FOR UPDATE', [row.parent_item_id]);
      const parent = parentRows[0];
      if (parent && parent.status === 'available') {
        await client.query('UPDATE inventory_items SET quantity=quantity+$1, updated_at=NOW() WHERE id=$2', [row.quantity, parent.id]);
        await client.query('DELETE FROM inventory_items WHERE id=$1', [row.id]);
      } else {
        // Parent missing or not available -> create new available record
        await client.query(
          `INSERT INTO inventory_items (name, description, category, status, quantity, created_by)
           VALUES ($1,$2,'equipment','available',$3,$4)`,
          [row.name, row.description, row.quantity, managerId || null]
        );
        await client.query('DELETE FROM inventory_items WHERE id=$1', [row.id]);
      }
    } else {
      // No parent link: just convert this row back to available
      await client.query('UPDATE inventory_items SET status='+'$1'+', return_status=NULL, claimed_by=NULL, updated_at=NOW() WHERE id=$2', ['available', row.id]);
    }
    await client.query('COMMIT');
    return { success:true };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally { client.release(); }
}

export async function listUserClaimedEquipment(userId) {
  const { rows } = await pool.query(
    `SELECT ${FIELDS}, return_status FROM inventory_items
     WHERE category='equipment' AND status='in_use' AND claimed_by=$1
     ORDER BY updated_at DESC`, [userId]);
  return rows;
}

export async function listPendingReturns() {
  // Include claimant (user) name & role for manager view
  const { rows } = await pool.query(
    `SELECT 
       i.id,
       i.name,
       i.description,
       i.category,
       i.status,
       i.quantity,
       i.in_use_quantity AS "inUseQuantity",
       i.created_by AS "createdBy",
       i.created_at AS "createdAt",
       i.updated_at AS "updatedAt",
       i.claimed_by AS "claimedBy",
       i.return_status,
       u.full_name AS "claimedByName",
       u.role AS "claimedByRole"
     FROM inventory_items i
     LEFT JOIN users u ON u.id = i.claimed_by
     WHERE i.category='equipment' AND i.status='in_use' AND i.return_status='pending'
     ORDER BY i.updated_at ASC`);
  return rows;
}

// =====================
// Requests & Voting
// =====================
export async function createItemRequest(user, data) {
  const { itemName, category, quantity, description, reason } = data || {};
  if (!itemName || !quantity) throw new Error('Missing fields');
  const qty = Math.max(1, parseInt(quantity,10)||1);
  const cat = (category||'supplies').toLowerCase();
  const { rows } = await pool.query(
    `INSERT INTO item_requests (requested_by,item_name,category,quantity,description,reason,department,course)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
     [user.id, itemName.trim(), cat, qty, description||null, reason||null, user.department||null, user.course||null]
  );
  return rows[0];
}

export async function listItemRequests(user, filters={}) {
  const values = []; let i=1; const where = [];
  // Limit visibility: managers/admin see requests in their dept/course; requester sees their own; others see only approved in same dept/course
  if (user.role === 'manager') {
    where.push(`r.department = $${i++}`); values.push(user.department||'');
    where.push(`r.course = $${i++}`); values.push(user.course||'');
  } else if (user.role !== 'admin') {
    // teacher/student/staff: only approved in own dept+course plus their own any status
    where.push(`( (r.status='approved' AND r.department = $${i} AND r.course = $${i+1}) OR r.requested_by = $${i+2} )`);
    values.push(user.department||''); values.push(user.course||''); values.push(user.id); i+=3;
  }
  if (filters.status) { where.push(`r.status = $${i++}`); values.push(filters.status); }
  const clause = where.length ? 'WHERE '+where.join(' AND ') : '';
  const { rows } = await pool.query(`
    SELECT r.*, u.username AS requested_by_username, u.full_name AS requested_by_full_name, u.role AS requested_by_role
    FROM item_requests r
    LEFT JOIN users u ON u.id = r.requested_by
    ${clause}
    ORDER BY r.id DESC`, values);
  return rows;
}

export async function decideItemRequest(id, manager, approve=true) {
  if (!['manager','admin'].includes(manager.role)) throw new Error('Forbidden');
  // Ensure manager's dept/course match request if manager
  const { rows } = await pool.query('SELECT * FROM item_requests WHERE id=$1', [id]);
  const req = rows[0]; if (!req) throw new Error('Not found');
  if (manager.role==='manager' && ( (req.department||'').toLowerCase() !== (manager.department||'').toLowerCase() || (req.course||'').toLowerCase() !== (manager.course||'').toLowerCase())) {
    throw new Error('Forbidden');
  }
  if (req.status !== 'pending') throw new Error('Already decided');
  const nextStatus = approve ? 'approved' : 'rejected';
  const { rows: upd } = await pool.query(`UPDATE item_requests SET status=$1, approved_by=$2, decided_at=NOW() WHERE id=$3 RETURNING *`, [nextStatus, manager.id, id]);
  return upd[0];
}

export async function castVoteOnRequest(user, requestId) {
  // Only users in same dept/course and not the requester can vote; only approved requests
  const { rows } = await pool.query('SELECT * FROM item_requests WHERE id=$1', [requestId]);
  const req = rows[0]; if (!req) throw new Error('Not found');
  if (req.status !== 'approved') throw new Error('Not votable');
  const depOk = (req.department||'').toLowerCase() === (user.department||'').toLowerCase();
  const courseOk = (req.course||'').toLowerCase() === (user.course||'').toLowerCase();
  if (!(depOk && courseOk)) throw new Error('Forbidden');
  if (req.requested_by === user.id) throw new Error('Cannot vote own request');
  try {
    await pool.query('INSERT INTO item_request_votes (request_id, user_id) VALUES ($1,$2)', [requestId, user.id]);
  } catch (e) {
    if (e.code === '23505') throw new Error('Already voted');
    throw e;
  }
  const { rows: count } = await pool.query('SELECT COUNT(*)::int AS votes FROM item_request_votes WHERE request_id=$1', [requestId]);
  return { votes: count[0].votes };
}

export async function listApprovedRequestsForVoting(user) {
  // Approved requests in same dept/course excluding own (optional include own with flag)
  const { rows } = await pool.query(
    `SELECT r.*, COALESCE(v.cnt,0) AS votes, EXISTS(SELECT 1 FROM item_request_votes vr WHERE vr.request_id=r.id AND vr.user_id=$3) AS voted
       FROM item_requests r
       LEFT JOIN (
         SELECT request_id, COUNT(*)::int AS cnt FROM item_request_votes GROUP BY request_id
       ) v ON v.request_id = r.id
     WHERE r.status='approved' AND r.department = $1 AND r.course = $2
     ORDER BY r.decided_at DESC NULLS LAST, r.id DESC`, [user.department||'', user.course||'', user.id]);
  return rows;
}

// Manager weekly top voted request (current ISO week)
export async function weeklyTopRequestForManager(user) {
  if (!user || user.role !== 'manager') return null;
  const sql = `WITH week_bounds AS (
                 SELECT date_trunc('week', NOW()) AS ws, date_trunc('week', NOW()) + INTERVAL '7 days' AS we
               ),
               votes_week AS (
                 SELECT r.id, COUNT(v.id)::int AS votes_week
                 FROM item_requests r
                 LEFT JOIN item_request_votes v ON v.request_id = r.id
                 JOIN week_bounds wb ON v.created_at >= wb.ws AND v.created_at < wb.we
                 WHERE r.status='approved' AND r.department=$1 AND r.course=$2
                 GROUP BY r.id
               ),
               votes_total AS (
                 SELECT r.id, COUNT(v.id)::int AS votes_total
                 FROM item_requests r
                 LEFT JOIN item_request_votes v ON v.request_id = r.id
                 WHERE r.status='approved' AND r.department=$1 AND r.course=$2
                 GROUP BY r.id
               )
               SELECT r.*, COALESCE(vw.votes_week,0) AS votes_week, COALESCE(vt.votes_total,0) AS votes_total,
                      EXTRACT(WEEK FROM NOW())::int AS week_number,
                      TO_CHAR(date_trunc('week', NOW()), 'YYYY-MM-DD') AS week_start
               FROM item_requests r
               LEFT JOIN votes_week vw ON vw.id = r.id
               LEFT JOIN votes_total vt ON vt.id = r.id
               WHERE r.status='approved' AND r.department=$1 AND r.course=$2
               ORDER BY vw.votes_week DESC, vt.votes_total DESC, r.id DESC
               LIMIT 1;`;
  const { rows } = await pool.query(sql, [user.department||'', user.course||'']);
  return rows[0] || null;
}

export async function deleteItemRequest(id, user) {
  if (!user || !['manager','admin'].includes(user.role)) throw new Error('Forbidden');
  const { rows } = await pool.query('SELECT * FROM item_requests WHERE id=$1', [id]);
  const req = rows[0];
  if (!req) throw new Error('Not found');
  if (user.role==='manager' && ((req.department||'').toLowerCase() !== (user.department||'').toLowerCase() || (req.course||'').toLowerCase() !== (user.course||'').toLowerCase())) {
    throw new Error('Forbidden');
  }
  // Allow delete only if approved (still in voting) or pending (cleanup) per spec focus.
  if (!['approved','pending'].includes(req.status)) throw new Error('Cannot delete in current status');
  await pool.query('DELETE FROM item_requests WHERE id=$1', [id]);
  return { success:true };
}

export async function convertRequestToInventory(id, user) {
  if (!user || !['manager','admin'].includes(user.role)) throw new Error('Forbidden');
  const { rows } = await pool.query('SELECT * FROM item_requests WHERE id=$1', [id]);
  const req = rows[0];
  if (!req) throw new Error('Not found');
  if (req.status !== 'approved') throw new Error('Only approved requests can be converted');
  if (user.role==='manager' && ((req.department||'').toLowerCase() !== (user.department||'').toLowerCase() || (req.course||'').toLowerCase() !== (user.course||'').toLowerCase())) {
    throw new Error('Forbidden');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Create inventory item
    const category = (req.category||'supplies').toLowerCase();
    const status = category === 'equipment' ? 'available' : 'in_stock';
    const { rows: itemRows } = await client.query(
      `INSERT INTO inventory_items (name, description, category, status, quantity, created_by)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING ${FIELDS}`,
      [req.item_name, req.description||null, category, status, req.quantity||1, user.id]
    );
    // Remove request so it no longer appears in voting
    await client.query('DELETE FROM item_requests WHERE id=$1', [id]);
    await client.query('COMMIT');
    return { item: itemRows[0] };
  } catch(e) {
    await client.query('ROLLBACK');
    throw e;
  } finally { client.release(); }
}

// =====================
// AI-ish Forecasting (Depletion Projection)
// =====================
// Heuristic: For supplies, use approved claim history over a window (default 30 days) to
// estimate average daily consumption and project days until depletion.
// This is a lightweight statistical approach (no external ML dependency) but structured so
// you can later swap in a proper regression / external AI service.
export async function forecastDepletion(user, { windowDays = 30, limit = 20 } = {}) {
  if (!user || !['manager','admin'].includes(user.role)) return [];
  const w = Math.max(7, Math.min(120, parseInt(windowDays,10) || 30)); // clamp 7..120 days
  const l = Math.max(1, Math.min(100, parseInt(limit,10) || 20));

  // For managers scope to their created items; admins see all.
  const managerFilterId = user.role === 'manager' ? user.id : null;
  // Build query: aggregate usage per item (approved claims) within window, compute avg daily usage,
  // project days to depletion and date.
  const sql = `
    WITH usage AS (
      SELECT item_id,
             SUM(quantity)::numeric AS total_used,
             COUNT(DISTINCT DATE(decided_at)) AS usage_days
      FROM inventory_claims
      WHERE status='approved'
        AND decided_at >= NOW() - ($1 || ' days')::interval
      GROUP BY item_id
    )
    SELECT i.id,
           i.name,
           i.quantity,
           i.status,
           i.category,
           i.created_by AS "createdBy",
           COALESCE((u.total_used / NULLIF(u.usage_days,0)),0)::float AS avg_daily_usage,
           CASE
             WHEN COALESCE((u.total_used / NULLIF(u.usage_days,0)),0) > 0 AND i.quantity > 0
               THEN (i.quantity / (u.total_used / u.usage_days))::float
             ELSE NULL
           END AS days_to_deplete,
           CASE
             WHEN COALESCE((u.total_used / NULLIF(u.usage_days,0)),0) > 0 AND i.quantity > 0
               THEN (NOW() + ((i.quantity / (u.total_used / u.usage_days)) * INTERVAL '1 day'))
             ELSE NULL
           END AS projected_depletion_ts,
           u.total_used::float AS total_used_in_window,
           u.usage_days
    FROM inventory_items i
    LEFT JOIN usage u ON u.item_id = i.id
    WHERE i.category='supplies'
      AND (i.status IN ('in_stock','out_of_stock'))
      AND ($2::int IS NULL OR i.created_by = $2)
    ORDER BY days_to_deplete NULLS LAST, avg_daily_usage DESC
    LIMIT $3;`;
  const { rows } = await pool.query(sql, [w, managerFilterId, l]);
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    category: r.category,
    status: r.status,
    quantity: r.quantity,
    avgDailyUsage: r.avg_daily_usage,
    daysToDeplete: r.days_to_deplete,
    projectedDepletionDate: r.projected_depletion_ts ? new Date(r.projected_depletion_ts).toISOString() : null,
    windowDays: w,
    totalUsedInWindow: r.total_used_in_window || 0,
    usageDays: r.usage_days || 0
  }));
}
