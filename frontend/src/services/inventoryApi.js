// inventoryApi uses a lightweight wrapper around fetch; apiClient side effects (token storage) are leveraged via localStorage token.

// Re-use generic req via dynamic import pattern
// We'll just implement simple wrappers using fetch via existing apiClient req function

const basePath = '/inventory';

async function raw(path, options) {
  // leverage existing private req by calling apiClient exported functions pattern
  // Since req isn't exported, we can create minimal fetch wrapper replicating token header logic if needed
  // Simpler: use fetch directly with auth token from localStorage
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type':'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch('http://localhost:5000/api' + path, { headers, ...options });
  const text = await res.text();
  let data = {};
  if (text) {
    try { data = JSON.parse(text); }
    catch { data = { _raw: text }; }
  }
  if (!res.ok) {
    const msg = data.error || data._raw || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const inventoryApi = {
  list: (params={}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.status) query.set('status', params.status);
    const qs = query.toString();
    return raw(`${basePath}${qs ? ('?' + qs) : ''}`);
  },
  create: (b) => raw(basePath, { method:'POST', body: JSON.stringify(b) }),
  update: (id,b) => raw(`${basePath}/${id}`, { method:'PUT', body: JSON.stringify(b) }),
  remove: (id) => raw(`${basePath}/${id}`, { method:'DELETE' }),
  history: (id) => raw(`${basePath}/${id}/history`)
  , listClaims: (id) => raw(`${basePath}/${id}/claims`)
  , createClaim: (id, body) => raw(`${basePath}/${id}/claims`, { method:'POST', body: JSON.stringify(body||{}) })
  , decideClaim: (claimId, approve=true) => raw(`${basePath}/claims/${claimId}/decision`, { method:'POST', body: JSON.stringify({ approve }) })
  , listPendingClaims: (params={}) => {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.limit) query.set('limit', params.limit);
      if (params.status) query.set('status', params.status);
      if (params.itemStatus) query.set('itemStatus', params.itemStatus);
      const qs = query.toString();
      return raw(`${basePath}/claims${qs?`?${qs}`:''}`);
    }
  , listMyClaimedEquipment: () => raw(`${basePath}/my/claimed-equipment`)
  , listMyClaims: (status) => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      return raw(`${basePath}/my/claims${qs}`);
    }
  , requestReturn: (id) => raw(`${basePath}/returns/${id}/request`, { method:'POST' })
  , listPendingReturns: () => raw(`${basePath}/returns/pending`)
  , approveReturn: (id) => raw(`${basePath}/returns/${id}/approve`, { method:'POST' })
  , analyticsSummary: () => raw(`${basePath}/analytics/summary`)
  // Requests & Voting
  , createRequest: (body) => raw(`${basePath}/requests`, { method:'POST', body: JSON.stringify(body||{}) })
  , listRequests: (status) => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      return raw(`${basePath}/requests${qs}`);
    }
  , decideRequest: (id, approve=true) => raw(`${basePath}/requests/${id}/decision`, { method:'POST', body: JSON.stringify({ approve }) })
  , listApprovedForVoting: () => raw(`${basePath}/requests/approved/voting`)
  , voteOnRequest: (id) => raw(`${basePath}/requests/${id}/vote`, { method:'POST' })
};
