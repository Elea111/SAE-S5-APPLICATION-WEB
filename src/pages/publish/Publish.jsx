import React, { useState, useEffect } from 'react';
import './Publish.css';

const CATEGORIES = ['power_tools','garden','building','measurement','other'];
const CONDITIONS = ['new','like_new','good','used','broken'];

const Publish = () => {
  const [step, setStep] = useState('form'); // 'form' | 'preview'
  const [token, setToken] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    title:'', category:CATEGORIES[0], condition:CONDITIONS[2], description:'', dailyPrice:'', deposit:'', location:'', images: []
  });
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.token) {
      window.location.href = '/connexion';
      return;
    }
    setToken(auth.token);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(prev => ({ ...prev, images: [...prev.images, ev.target.result] }));
    };
    reader.readAsDataURL(file);
  };

  const goPreview = () => {
    // basic validation
    if (!form.title || !form.dailyPrice) { setMsg('Titre et prix requis'); return; }
    setPreviewData({ ...form });
    setStep('preview');
    setMsg('');
  };

  const publish = async () => {
    if (!token) return;

    try {
      const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
      
      const res = await fetch(`${API_BASE}/api/equipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          daily_price: parseFloat(form.dailyPrice),
          caution_deposit: form.deposit ? parseFloat(form.deposit) : null,
          location: form.location,
          condition: form.condition
        })
      });

      const data = await res.json();

      if (res.ok && data.id) {
        setMsg('✅ Équipement publié avec succès !');
        setTimeout(() => {
          window.location.href = `/equipments/${data.id}`;
        }, 2000);
      } else {
        setMsg(`❌ Erreur : ${data.message}`);
      }
    } catch (err) {
      setMsg(`❌ Erreur : ${err.message}`);
    }
  };

  if (step === 'preview' && previewData) {
    return (
      <section className="publish-page">
        <div className="publish-container">
          <h2>Aperçu de l'annonce</h2>
          <div className="preview-card">
            <h3>{previewData.title}</h3>
            <p className="muted">{previewData.category} • {previewData.condition}</p>
            <p>{previewData.description}</p>
            <p><strong>{previewData.dailyPrice} € / jour</strong> {previewData.deposit ? `• Caution ${previewData.deposit} €` : ''}</p>
            <div className="preview-images">
              {previewData.images.map((src, i) => <img key={i} src={src} alt="" />)}
            </div>
          </div>

          <div className="preview-actions">
            <button className="btn-outline" onClick={()=>setStep('form')}>Modifier</button>
            <button className="btn-primary" onClick={publish}>Publier</button>
          </div>
          {msg && <p className="info">{msg}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="publish-page">
      <div className="publish-container">
        <h2>Publier un outil</h2>
        <form className="publish-form" onSubmit={(e)=>{e.preventDefault(); goPreview();}}>
          <label>Titre<input name="title" value={form.title} onChange={handleChange} required/></label>

          <label>Catégorie
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label>État
            <select name="condition" value={form.condition} onChange={handleChange}>
              {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label>Description<textarea name="description" value={form.description} onChange={handleChange} /></label>

          <label>Prix journalier (€)<input name="dailyPrice" type="number" value={form.dailyPrice} onChange={handleChange} required/></label>

          <label>Caution (€)<input name="deposit" type="number" value={form.deposit} onChange={handleChange} /></label>

          <label>Localisation<input name="location" value={form.location} onChange={handleChange} /></label>

          <label>Images<input type="file" accept="image/*" onChange={handleImage} /></label>
          <div className="thumbs">
            {form.images.map((s,i)=> <img key={i} src={s} alt="" />)}
          </div>

          <div className="form-actions">
            <button className="btn-primary" type="submit">Aperçu</button>
            <button className="btn-outline" type="button" onClick={()=>setForm({ title:'', category:CATEGORIES[0], condition:CONDITIONS[2], description:'', dailyPrice:'', deposit:'', location:'', images:[] })}>Réinitialiser</button>
          </div>
          {msg && <p className="info">{msg}</p>}
        </form>
      </div>
    </section>
  );
};

export default Publish;
