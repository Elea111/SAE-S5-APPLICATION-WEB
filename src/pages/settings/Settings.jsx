import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './Settings.css';

const Settings = () => {
  const [auth, setAuth] = useState({});
  const userId = auth.userId || auth.id;
  const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
  const [form, setForm] = useState({ 
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    setAuth(authData);
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`${API_BASE}/api/users/${userId}`)
      .then(r => r.ok ? r.json() : null)
      .then(u => {
        if (u) {
          setForm({ 
            first_name: u.first_name || '',
            last_name: u.last_name || '',
            email: u.email || '',
            phone: u.phone || '',
            address: u.address || ''
          });
        }
        setLoading(false);
      })
      .catch(e => {
        console.warn('Erreur fetch user:', e);
        setLoading(false);
      });
  }, [userId, API_BASE]);

  const save = async () => {
    if (!userId) { setMsg('❌ User ID manquant'); return; }
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) { 
        setMsg('✅ Paramètres enregistrés');
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        auth.first_name = form.first_name;
        auth.last_name = form.last_name;
        auth.email = form.email;
        auth.phone = form.phone;
        localStorage.setItem('auth', JSON.stringify(auth));
      }
      else setMsg('❌ Erreur serveur');
    } catch (e) { 
      setMsg('❌ Erreur: ' + e.message); 
    }
  };

  return (
    <>
      <Header />
      <div className="settings-page">
        <h2>📋 Paramètres du compte</h2>
        {loading ? <p>Chargement...</p> : (
          <form onSubmit={(e) => { e.preventDefault(); save(); }}>
            <label>Prénom<input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} /></label>
            <label>Nom<input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} /></label>
            <label>Email<input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></label>
            <label>Téléphone<input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></label>
            <label>Adresse<input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></label>
            <button type="submit" className="btn-primary">💾 Enregistrer</button>
            {msg && <p className={msg.includes('✅') ? 'success' : 'error'}>{msg}</p>}
          </form>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Settings;
