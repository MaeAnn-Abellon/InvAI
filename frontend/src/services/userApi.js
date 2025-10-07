// User management API client
let base = 'http://localhost:5000/api';
try {
  // dynamic import avoids circular issues during build
  (async()=>{
    try { const { getApiBase } = await import('./apiClient.js'); base = getApiBase(); }
    catch { /* fallback remains localhost */ }
  })();
} catch { /* ignore */ }

function authHeaders() {
  const token = localStorage.getItem('auth_token');
  const h = { 'Content-Type':'application/json' };
  if (token) h.Authorization = 'Bearer ' + token;
  return h;
}

export async function listUsers(params={}) {
  const qs = new URLSearchParams();
  if (params.department) qs.append('department', params.department);
  if (params.course) qs.append('course', params.course);
  const res = await fetch(`${base}/users?${qs.toString()}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error||'Failed to fetch users');
  return data.users||[];
}

export async function createUser(user) {
  const res = await fetch(`${base}/users`, { method:'POST', headers: authHeaders(), body: JSON.stringify(user) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error||'Failed to create user');
  return data.user;
}

export async function updateUser(id, patch) {
  const res = await fetch(`${base}/users/${id}`, { method:'PATCH', headers: authHeaders(), body: JSON.stringify(patch) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error||'Failed to update user');
  return data.user;
}

export async function deleteUserApi(id) {
  const res = await fetch(`${base}/users/${id}`, { method:'DELETE', headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error||'Failed to delete user');
  return true;
}
