import React, { useState, useEffect } from 'react';
import { authApi, setToken } from '../services/apiClient';
import AuthCtx from './_authContext';

// Track auth check instances (dev logging only)
let authCheckId = 0;
let globalUser = null;
let globalUserListeners = new Set();
let authMePromise = null; // de-duplicate concurrent /auth/me requests
const USER_SNAPSHOT_KEY = 'auth_user_snapshot';

export function AuthProvider({ children }) {
  // Hydrate immediately from snapshot if available to avoid layout shift
  const snapshot = (() => {
    try { return JSON.parse(localStorage.getItem(USER_SNAPSHOT_KEY) || 'null'); } catch { return null; }
  })();
  if (snapshot && !globalUser) {
    globalUser = snapshot; // prime global cache
  }
  const [user, setUser] = useState(globalUser);
  const [loading, setLoading] = useState(!snapshot); // if we have snapshot, we can render while validating
  const [error, setError] = useState(null);
  const instanceId = ++authCheckId;

  // Sync with global user state
  useEffect(() => {
    const updateUser = (newUser) => setUser(newUser);
    globalUserListeners.add(updateUser);
    
    return () => {
      globalUserListeners.delete(updateUser);
    };
  }, []);

  // Function to update global user state
  const updateGlobalUser = (newUser) => {
    globalUser = newUser;
    if (newUser) {
      try { localStorage.setItem(USER_SNAPSHOT_KEY, JSON.stringify(newUser)); } catch { /* ignore storage quota */ }
    } else {
      localStorage.removeItem(USER_SNAPSHOT_KEY);
    }
    globalUserListeners.forEach(listener => listener(newUser));
  };

  useEffect(() => {
    const currentInstance = instanceId;
    let cancelled = false;
    console.log(`AuthContext[${currentInstance}]: Auth effect mounted`);

    const run = async () => {
      const token = localStorage.getItem('auth_token');
      console.log(`AuthContext[${currentInstance}]: Token present:`, !!token);
      if (!token) {
        updateGlobalUser(null);
        setLoading(false);
        return;
      }
      if (!authMePromise) {
        console.log(`AuthContext[${currentInstance}]: Initiating /auth/me network call`);
        authMePromise = authApi.me()
          .finally(() => {
            // release after a tick to allow late subscribers to reuse
            setTimeout(() => { authMePromise = null; }, 50);
          });
      } else {
        console.log(`AuthContext[${currentInstance}]: Reusing in-flight /auth/me promise`);
      }
      try {
        const data = await authMePromise;
        if (cancelled) return;
        if (data && data.user) {
          // Only update if changed to reduce rerenders
          if (!globalUser || globalUser.id !== data.user.id || JSON.stringify(globalUser) !== JSON.stringify(data.user)) {
            console.log(`AuthContext[${currentInstance}]: User restored (or updated)`);
            updateGlobalUser(data.user);
          }
        } else {
          console.log(`AuthContext[${currentInstance}]: Invalid /auth/me payload, clearing token`);
          localStorage.removeItem('auth_token');
          updateGlobalUser(null);
        }
      } catch (err) {
        if (cancelled) return;
        if (err.message === 'Unauthorized') {
            console.log(`AuthContext[${currentInstance}]: Unauthorized token, clearing`);
            localStorage.removeItem('auth_token');
            updateGlobalUser(null);
        } else {
            console.log(`AuthContext[${currentInstance}]: Non-fatal auth error:`, err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    const handleStorageChange = (e) => {
      if (e.key === 'auth_token' && !e.newValue) {
        console.log('AuthContext: Token removed via storage event, clearing user');
        updateGlobalUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorageChange);
      console.log(`AuthContext[${currentInstance}]: Auth effect cleaned up`);
    };
  }, [instanceId]);

  const getDashboardPath = (role) => {
    switch ((role || '').toLowerCase()) {
      case 'manager': return '/manager/dashboard';
      case 'admin':   return '/admin/dashboard';
      case 'teacher':
      case 'staff':
      case 'student':
      default:        return '/dashboard';
    }
  };

  const login = async (credentials) => {
    setError(null);
    console.log('AuthContext: Attempting login...');
    const { user, token } = await authApi.login(credentials);
    console.log('AuthContext: Login successful, setting token and user:', user);
    setToken(token);
    updateGlobalUser(user);
    return user; // allow caller to redirect
  };

  const signup = async (data) => {
    setError(null);
    // For signup, we don't automatically log the user in
    // Just register them and let them login manually
    const response = await authApi.signup(data);
    return response.user;
  };

  const logout = async () => {
    console.log('AuthContext: Logging out user');
    await authApi.logout();
    updateGlobalUser(null);
    console.log('AuthContext: User logged out, token cleared');
  };

  return (
    <AuthCtx.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      signup, 
      logout, 
      getDashboardPath,
      // Expose a normalized role shortcut so components that currently
      // destructure { role } (e.g. Sidebar, InventoryRoute) work correctly.
      // Previously these components received 'undefined' and fell back to
      // student menus, hiding manager/admin specific links like Manager Claims.
      role: (user?.role || '').toLowerCase(),
      // Add a manual refresh function for debugging
      refreshAuth: () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          console.log('Manual auth refresh triggered');
          setLoading(true);
          authApi.me()
            .then(d => d?.user && setUser(d.user))
            .catch(err => console.log('Manual refresh failed:', err.message))
            .finally(() => setLoading(false));
        }
      }
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

// (useAuth hook moved to useAuth.js to improve Fast Refresh compatibility)