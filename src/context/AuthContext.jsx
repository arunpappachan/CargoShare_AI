import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../lib/apiConfig';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cargoshare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cargoshare_token') || null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (token) {
      refreshProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const refreshProfile = async () => {
    try {
      const activeToken = token || localStorage.getItem('cargoshare_token');
      if (!activeToken) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
        localStorage.setItem('cargoshare_user', JSON.stringify(json.data));

      } else if (res.status === 401) {
        // Only force-logout on 401 (invalid/expired token).
        // 403 means "authenticated but not authorised" — don't wipe the session.
        logout();
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    let res;
    try {
      res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
    } catch (networkErr) {
      throw new Error(`Unable to connect to backend server at ${API_BASE}. Please make sure the backend is running.`);
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('cargoshare_token', data.token);
    localStorage.setItem('cargoshare_user', JSON.stringify(data.user));

    return data;
  };

  const register = async (userData) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('cargoshare_token', data.token);
      localStorage.setItem('cargoshare_user', JSON.stringify(data.user));


    }

    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cargoshare_token');
    localStorage.removeItem('cargoshare_user');
  };

  const updateProfile = async (profileData) => {
    const res = await fetch(`${API_BASE}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    setUser(data.data);
    localStorage.setItem('cargoshare_user', JSON.stringify(data.data));
    return data;
  };



  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
