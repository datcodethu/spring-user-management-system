const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || data?.detail || 'Request failed');
  }

  return data;
}

export function saveSession(authResponse) {
  localStorage.setItem('token', authResponse.token);
  localStorage.setItem('currentUser', JSON.stringify({
    id: authResponse.id,
    name: authResponse.name,
    email: authResponse.email,
    role: authResponse.role
  }));
}

export function loadSession() {
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('currentUser');

  if (!token || !currentUser) {
    return null;
  }

  return {
    token,
    user: JSON.parse(currentUser)
  };
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
}
