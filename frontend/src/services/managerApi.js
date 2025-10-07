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
export async function fetchManagerActivity(userId) {
  try {
    let base;
    try { const { getApiBase } = await import('./apiClient.js'); base = getApiBase(); } catch { base = 'http://localhost:5000/api'; }
    const response = await fetch(`${base}/users/${userId}/activity`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch activity');
    }
    const data = await response.json();
    return data.activity || [];
  } catch (error) {
    console.error('Error fetching manager activity:', error);
    // Fallback to empty array if API fails
    return [];
  }
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

// REPORTS (Real data implementation)
export async function generateReport({ month = '2025-09', scope = 'department' } = {}) {
  console.log('generate report', month, scope);
  
  try {
    // Import inventoryApi dynamically to avoid circular dependencies
    const { inventoryApi } = await import('./inventoryApi');
    
    // Fetch real data from the backend
    const [inventoryResponse, analyticsResponse] = await Promise.all([
      inventoryApi.list(),
      inventoryApi.analyticsSummary()
    ]);
    
    const items = inventoryResponse.items || [];
    const analytics = analyticsResponse || { items: [], claims: [], returns: { pending_returns: 0 } };
    
    // Filter data based on scope
    let filteredItems = items;
    let scopeDescription = 'All Items';
    
    if (scope === 'department') {
      // For now, since we don't have department info in items, we'll show all
      // In a real implementation, you'd filter by: items.filter(item => item.department === userDepartment)
      filteredItems = items;
      scopeDescription = 'Department Items';
    } else if (scope === 'campus') {
      // Show all items for campus-wide view
      filteredItems = items;
      scopeDescription = 'Campus-wide Items';
    } else if (scope === 'category') {
      // Keep all items but we'll show category breakdown
      filteredItems = items;
      scopeDescription = 'All Categories';
    }
    
    // Calculate real statistics
    const totalItems = filteredItems.length;
    const equipmentItems = filteredItems.filter(item => item.category === 'equipment');
    const suppliesItems = filteredItems.filter(item => item.category === 'supplies');
    
    const equipmentCount = equipmentItems.length;
    const suppliesCount = suppliesItems.length;
    
    // Status calculations
    const availableItems = filteredItems.filter(item => item.status === 'available').length;
    const inUseItems = filteredItems.filter(item => item.status === 'in_use').length;
    const outOfStockItems = filteredItems.filter(item => item.status === 'out_of_stock').length;
    const forRepairItems = filteredItems.filter(item => item.status === 'for_repair').length;
    const disposedItems = filteredItems.filter(item => item.status === 'disposed').length;
    
    // Additional metrics from analytics if available
    const pendingClaims = analytics.claims?.find(c => c.status === 'pending')?.count || 0;
    const approvedClaims = analytics.claims?.find(c => c.status === 'approved')?.count || 0;
    const rejectedClaims = analytics.claims?.find(c => c.status === 'rejected')?.count || 0;
    const pendingReturns = analytics.returns?.pending_returns || 0;
    
    // Calculate utilization rate
    const utilizationRate = equipmentCount > 0 ? 
      ((inUseItems / equipmentCount) * 100).toFixed(1) + '%' : '0%';
    
    // Create comprehensive summary with real data
    const realSummary = {
      'Total Items': totalItems,
      'Equipment Count': equipmentCount,
      'Supplies Count': suppliesCount,
      'Available Items': availableItems,
      'In Use Items': inUseItems,
      'Out of Stock': outOfStockItems,
      'For Repair': forRepairItems,
      'Disposed Items': disposedItems,
      'Equipment Utilization': utilizationRate,
      'Pending Claims': pendingClaims,
      'Approved Claims': approvedClaims,
      'Rejected Claims': rejectedClaims,
      'Pending Returns': pendingReturns,
      'Report Period': month,
      'Scope': scopeDescription,
      'Data Source': 'Live Database',
      'Last Updated': new Date().toLocaleString()
    };

    return {
      type: 'inventory-analysis',
      format: 'summary',
      summary: realSummary,
      scope: scope,
      itemsIncluded: totalItems,
      createdAt: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      dataSource: 'live',
      url: null // No static file since this is live data
    };
    
  } catch (error) {
    console.error('Error generating real report:', error);
    
    // Fallback to mock data if API fails
    const fallbackSummary = {
      'Error': 'Unable to fetch live data',
      'Fallback Mode': 'Active',
      'Total Items': 'N/A',
      'Equipment Count': 'N/A',
      'Supplies Count': 'N/A',
      'Status': 'Please check your connection',
      'Report Period': month,
      'Scope': scope.charAt(0).toUpperCase() + scope.slice(1)
    };

    return {
      type: 'error-report',
      format: 'summary',
      summary: fallbackSummary,
      error: error.message,
      createdAt: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      dataSource: 'fallback'
    };
  }
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