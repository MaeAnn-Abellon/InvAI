// Central Manager Service (mock stubs)

// DASHBOARD
export async function fetchManagerDashboard() {
  return {
    overview: { totalItems: 128, pending: 5, lowStock: 7 },
    recentRequests: [
      { id: 1, item: 'Laptop', user: 'Alice', role: 'Teacher', status: 'pending' },
      { id: 2, item: 'Seeds', user: 'Bob', role: 'Student', status: 'approved' },
    ],
    forecastHighlights: [
      { id: 'fertilizer', text: 'Fertilizer usage to spike next month (+18%).' },
      { id: 'lan-cable', text: 'LAN Cables nearing reorder threshold.' },
    ],
  };
}

// PROFILE
export async function saveManagerProfile(profile) {
  console.log('save profile', profile);
  return { success: true };
}
export async function fetchManagerActivity() {
  return [
    'Last Excel upload: 2025-09-20',
    'Last item edit: 2025-09-22',
  ];
}

// NOTIFICATIONS
export async function fetchManagerNotifications() {
  return [
    { id: 1, type: 'low-stock', msg: 'Seeds below threshold.' },
    { id: 2, type: 'pending-request', msg: '3 requests awaiting approval.' },
    { id: 3, type: 'system', msg: 'Excel upload succeeded.' },
  ];
}

// INVENTORY
let _items = [
  { id: 1, name: 'Laptop', category: 'IT', department: 'IT', qty: 12, status: 'active' },
  { id: 2, name: 'Fertilizer', category: 'Agri', department: 'Agriculture', qty: 3, status: 'low' },
];
export async function fetchInventoryItems() { return _items; }
export async function createOrUpdateItem(item) {
  if (item.id) {
    _items = _items.map(i => i.id === item.id ? item : i);
  } else {
    _items.push({ ...item, id: Date.now() });
  }
  return { success: true };
}
export async function deleteItem(id) {
  _items = _items.filter(i => i.id !== id);
  return { success: true };
}
export async function uploadInventoryExcel(file) {
  console.log('upload excel', file?.name);
  return { success: true, processed: 25, updated: 10, added: 15 };
}

// REQUESTS & VOTING (migrated to real backend via inventoryApi; keeping placeholder)
// These stubs retained for backward compatibility; prefer inventoryApi methods.

// FORECASTS
export async function fetchForecastData({ department = 'All' } = {}) {
  return {
    department,
    forecasts: [
      { id: 1, label: 'Agri Seeds', data: [5,7,9,14,13], unit: 'packs' },
      { id: 2, label: 'IT Cables', data: [2,3,5,5,8], unit: 'pcs' },
    ],
    suggestions: [
      { item: 'Fertilizer', reason: 'Projected shortage in 3 weeks' },
      { item: 'LAN Cable', reason: 'Usage trending up' },
    ]
  };
}

// REPORTS (placeholder)
export async function generateReport({ type = 'monthly-inventory', format = 'pdf' } = {}) {
  console.log('generate report', type, format);
  return {
    type,
    format,
    generatedAt: new Date().toISOString(),
    url: '/downloads/mock-report.' + (format === 'excel' ? 'xlsx' : format)
  };
}

// AUDIT LOG (mock)
export async function fetchAuditLog({ limit = 25 } = {}) {
  // Mock entries
  return [
    { id: 1, at: '2025-09-25 09:12', user: 'manager1', action: 'UPLOAD_EXCEL', details: 'inventory_sep.xlsx (32 rows)' },
    { id: 2, at: '2025-09-26 11:03', user: 'manager1', action: 'UPDATE_ITEM', details: 'Edited item Laptop (qty 10 -> 12)' },
    { id: 3, at: '2025-09-27 14:41', user: 'manager2', action: 'REQUEST_STATUS', details: 'Request#101 -> approved' },
  ].slice(0, limit);
}