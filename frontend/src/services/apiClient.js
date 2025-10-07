let TOKEN = localStorage.getItem('auth_token') || null;

export function setToken(t) {
  TOKEN = t;
  if (t) {
    localStorage.setItem('auth_token', t);
    console.log('apiClient: Token set and stored in localStorage');
  } else {
    localStorage.removeItem('auth_token');
    console.log('apiClient: Token cleared from localStorage');
  }
}

// Resolve API base dynamically:
// 1. Use VITE_API_BASE if defined
// 2. Else try to swap common Vite port (5173) with backend default 5000
// 3. Fallback to absolute localhost:5000
function deriveBase() {
  const envBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : null;
  if (envBase) return envBase.replace(/\/?$/, '');
  if (typeof window !== 'undefined') {
    try {
      const url = new URL(window.location.href);
      // If frontend dev server (vite default 5173), assume backend 5000
      if (url.port === '5173') {
        return `${url.protocol}//${url.hostname}:5000/api`;
      }
      // If served from same origin and already includes /api path, keep it
      if (url.pathname.startsWith('/api')) {
        return `${url.origin}/api`;
      }
    } catch { /* ignore */ }
  }
  return 'http://localhost:5000/api';
}

let BASE = deriveBase();
console.log('apiClient BASE:', BASE);

// Warn if deployed (non-localhost host) but BASE resolved to localhost fallback
try {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalFrontend = ['localhost','127.0.0.1','::1'].includes(host);
    const baseIsLocal = /localhost:5000/.test(BASE);
    if (!isLocalFrontend && baseIsLocal) {
      console.warn('[apiClient] WARNING: Frontend is deployed on', host, 'but API base fell back to localhost:5000. Set VITE_API_BASE to your Render URL (e.g. https://YOUR-BACKEND.onrender.com/api) in Vercel project settings and redeploy.');
    }
  }
} catch { /* ignore */ }

async function req(path, options = {}) {
  // Always check localStorage for the latest token
  const currentToken = localStorage.getItem('auth_token');
  if (currentToken && currentToken !== TOKEN) {
    TOKEN = currentToken;
    console.log('apiClient: Updated TOKEN from localStorage');
  }
  
  const headers = { 'Content-Type':'application/json', ...(options.headers||{}) };
  if (TOKEN) {
    headers.Authorization = 'Bearer ' + TOKEN;
    console.log('apiClient: Making request to', path, 'with token');
  } else {
    console.log('apiClient: Making request to', path, 'without token');
  }
  
  // If base accidentally lacks /api ensure path concatenation still works
  const full = BASE.endsWith('/api') || BASE.match(/\/api$/) ? BASE + path : BASE.replace(/\/$/, '') + path;
  let res;
  try {
    res = await fetch(full, { headers, ...options });
  } catch (netErr) {
    console.error('Network error calling', full, netErr);
    throw new Error('Cannot reach server. Ensure backend is running.');
  }

  let data;
  const ct = res.headers.get('content-type') || '';
  if (res.status === 204) {
    data = {};
  } else {
    const text = await res.text();
    if (!text) {
      data = {};
    } else if (ct.includes('application/json')) {
      try { data = JSON.parse(text); }
      catch (err) {
        console.warn('JSON parse failed:', err, 'raw text:', text);
        data = { error: 'Invalid JSON response', _raw: text };
      }
    } else {
      data = { _raw: text };
    }
  }

  if (!res.ok) {
    console.warn('API ERROR', res.status, path, data);
    // For /auth/me endpoint, always throw error for proper handling
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error(data.error || data._raw || 'Request failed');
  }
  console.log('apiClient: Request successful to', path);
  return data;
}

export const authApi = {
  signup: b => req('/auth/register', { method:'POST', body: JSON.stringify(b) }),
  login: b => req('/auth/login', { method:'POST', body: JSON.stringify(b) }),
  me: () => req('/auth/me'),
  logout: () => { setToken(null); return Promise.resolve({}); }
};

export async function pingBackend() {
  try {
    const res = await fetch(BASE + '/health');
    if (!res.ok) return { ok:false, status: res.status };
    return { ok:true };
  } catch (e) {
    return { ok:false, error: e.message };
  }
}

export const userApi = {
  list: () => req('/users'),
  get: id => req(`/users/${id}`),
  update: (id, b) => req(`/users/${id}`, { method:'PUT', body: JSON.stringify(b) }),
  remove: id => req(`/users/${id}`, { method:'DELETE' })
};