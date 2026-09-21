import { useEffect, useMemo, useState } from 'react';
import { apiRequest, clearSession, loadSession, saveSession } from './api.js';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'USER'
};

function loadTheme() {
  return localStorage.getItem('theme') || 'light';
}

export default function App() {
  const [session, setSession] = useState(loadSession);
  const [theme, setTheme] = useState(loadTheme);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState(emptyForm);
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const isEditing = useMemo(() => editingId !== null, [editingId]);
  const isAdmin = session?.user.role === 'ADMIN';
  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = !query
        || user.name.toLowerCase().includes(query)
        || user.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);
  const userStats = useMemo(() => ({
    total: users.length,
    admins: users.filter((user) => user.role === 'ADMIN').length,
    standard: users.filter((user) => user.role === 'USER').length
  }), [users]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    } else {
      setUsers([]);
    }
  }, [isAdmin]);

  async function loadUsers() {
    setError('');
    setIsLoadingUsers(true);
    try {
      const data = await apiRequest('/users');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingUsers(false);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus('');

    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
    const payload = authMode === 'login'
      ? { email: authForm.email, password: authForm.password }
      : authForm;

    try {
      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      saveSession(data);
      setSession(loadSession());
      setAuthForm(emptyForm);
      setStatus(`Signed in as ${data.name}`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUserSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus('');

    const payload = {
      ...userForm,
      password: userForm.password.trim()
    };

    if (isEditing && !payload.password) {
      delete payload.password;
    }

    try {
      await apiRequest(isEditing ? `/users/${editingId}` : '/users', {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      setUserForm(emptyForm);
      setEditingId(null);
      setStatus(isEditing ? 'User updated' : 'User created');
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteUser() {
    if (!deleteTarget) {
      return;
    }

    setError('');
    setStatus('');

    try {
      await apiRequest(`/users/${deleteTarget.id}`, { method: 'DELETE' });
      setStatus('User deleted');
      setDeleteTarget(null);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  function editUser(user) {
    setEditingId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
  }

  function signOut() {
    clearSession();
    setSession(null);
    setUsers([]);
    setStatus('');
    setError('');
  }

  function toggleTheme() {
    setTheme((current) => current === 'dark' ? 'light' : 'dark');
  }

  const themeLabel = theme === 'dark' ? 'Light mode' : 'Dark mode';

  if (!session) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <button className="theme-toggle" type="button" onClick={toggleTheme}>
            {themeLabel}
          </button>

          <div>
            <p className="eyebrow">Spring Boot + JWT + Postgres</p>
            <h1>User Management</h1>
            <p className="lede">Sign in to manage users, or create a standard account to test role-based access.</p>
          </div>

          <div className="tabs">
            <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Login</button>
            <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Register</button>
          </div>

          <form onSubmit={handleAuthSubmit} className="form">
            {authMode === 'register' && (
              <label>
                Name
                <input value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />
              </label>
            )}
            <label>
              Email
              <input type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
            </label>
            <label>
              Password
              <input type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required minLength={6} />
            </label>
            {error && <p className="error">{error}</p>}
            {status && <p className="success">{status}</p>}
            <button className="primary" type="submit">{authMode === 'login' ? 'Login' : 'Create Account'}</button>
          </form>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Authenticated account</p>
            <h1>User Management</h1>
          </div>
          <div className="session">
            <span>{session.user.name}</span>
            <span className="role">{session.user.role}</span>
            <button onClick={toggleTheme}>{themeLabel}</button>
            <button onClick={signOut}>Sign out</button>
          </div>
        </header>

        <section className="access-panel">
          <h2>Admin access required</h2>
          <p>
            You are signed in as a standard user. User management actions are protected
            by the backend and require the ADMIN role.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Authenticated CRUD app</p>
          <h1>User Management</h1>
        </div>
        <div className="session">
          <span>{session.user.name}</span>
          <span className="role">{session.user.role}</span>
          <button onClick={toggleTheme}>{themeLabel}</button>
          <button onClick={signOut}>Sign out</button>
          </div>
        </header>

      {(status || error) && (
        <div className={`toast ${error ? 'error' : 'success'}`}>
          {error || status}
        </div>
      )}

      <section className="workspace">
        <form onSubmit={handleUserSubmit} className="form editor">
          <h2>{isEditing ? 'Edit user' : 'Add user'}</h2>
          <label>
            Name
            <input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
          </label>
          <label>
            Password
            <input
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              required={!isEditing}
              minLength={isEditing && userForm.password.length === 0 ? undefined : 6}
              placeholder={isEditing ? 'Leave blank to keep current password' : ''}
            />
          </label>
          <label>
            Role
            <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <div className="actions">
            <button className="primary" type="submit">{isEditing ? 'Save changes' : 'Add user'}</button>
            {isEditing && (
              <button type="button" onClick={() => { setEditingId(null); setUserForm(emptyForm); }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="users-panel">
          <div className="stats-grid">
            <div className="stat">
              <span>Total users</span>
              <strong>{userStats.total}</strong>
            </div>
            <div className="stat">
              <span>Admins</span>
              <strong>{userStats.admins}</strong>
            </div>
            <div className="stat">
              <span>Standard users</span>
              <strong>{userStats.standard}</strong>
            </div>
          </div>

          <div className="panel-heading">
            <h2>Users</h2>
            <button onClick={loadUsers}>Refresh</button>
          </div>

          <div className="table-tools">
            <label>
              Search
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name or email"
              />
            </label>
            <label>
              Role
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="ALL">All roles</option>
                <option value="ADMIN">Admins</option>
                <option value="USER">Users</option>
              </select>
            </label>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {isLoadingUsers && (
                  <tr>
                    <td colSpan="5" className="empty">Loading users...</td>
                  </tr>
                )}
                {!isLoadingUsers && filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`role ${user.role.toLowerCase()}`}>{user.role}</span></td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="row-actions">
                      <button onClick={() => editUser(user)}>Edit</button>
                      <button className="danger" onClick={() => setDeleteTarget(user)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {!isLoadingUsers && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty">
                      {users.length === 0 ? 'No users yet.' : 'No users match your filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {deleteTarget && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <h2 id="delete-title">Delete user?</h2>
            <p>
              This will permanently delete {deleteTarget.name} from the database.
            </p>
            <div className="actions">
              <button type="button" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="danger solid" type="button" onClick={deleteUser}>Delete user</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
