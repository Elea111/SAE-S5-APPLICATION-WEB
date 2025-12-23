import React, { useState } from 'react';
import './Publish.css';

const Publish = () => {
  const [form, setForm] = useState({ title:'', description:'', dailyPrice:'' });
  const [msg, setMsg] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${window.location.hostname === 'localhost' ? 'http://localhost:4000' : ''}/api/equipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: JSON.parse(localStorage.getItem('auth') || '{}').userId || null,
          title: form.title,
          description: form.description,
          dailyPrice: Number(form.dailyPrice)
        })
      });
      if (!res.ok) throw new Error('Erreur publication');
      const data = await res.json();
      setMsg('Outil publié (mock)');
      window.location.href = `/equipments/${data.id}`;
    } catch (err) {
      setMsg(err.message || 'Erreur');
    }
  };

  return (
    <section className="publish-page">
      <div className="publish-container">
        <h2>Publier un outil</h2>
        <form onSubmit={handleSubmit} className="publish-form">
          <label>Intitulé<input name="title" value={form.title} onChange={handleChange} required/></label>
          <label>Description<textarea name="description" value={form.description} onChange={handleChange} /></label>
          <label>Prix journalier (€)<input name="dailyPrice" type="number" value={form.dailyPrice} onChange={handleChange} required/></label>
          <button className="btn-primary" type="submit">Publier</button>
          {msg && <p className="info">{msg}</p>}
        </form>
      </div>
    </section>
  );
};

export default Publish;
