import React, { useEffect, useState } from 'react';
import './Settings.css';

const Settings = () => {
  const [auth, setAuth] = useState({});
  const userId = auth.userId;
  const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
  const [form, setForm] = useState({ email:'', phone:'' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Load auth from localStorage only on client
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    setAuth(authData);
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE}/api/users/${userId}`)
      .then(r => r.ok ? r.json() : null)
      .then(u => u && setForm({ email: u.email || '', phone: u.phone || '' }));
  }, [userId, API_BASE]);

  const save = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) { setMsg('Paramètres enregistrés'); }
      else setMsg('Erreur save (mock)');
    } catch (e) { setMsg('Erreur réseau'); }
  };

  return (
    <div className="settings-page">
      <h2>Paramètres du compte</h2>
      <label>Email<input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
      <label>Téléphone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></label>
      <button className="btn-primary" onClick={save}>Enregistrer</button>
      {msg && <p className="info">{msg}</p>}
    </div>
  );
};

export default Settings;
