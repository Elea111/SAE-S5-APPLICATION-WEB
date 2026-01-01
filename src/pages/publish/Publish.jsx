import React, { useState, useEffect } from 'react';
import './Publish.css';

const CATEGORIES = [
  { value: 'electroportatif', label: '🔌 Électroportatif' },
  { value: 'jardinage', label: '🌱 Jardinage' },
  { value: 'construction', label: '🔨 Construction' },
  { value: 'nettoyage', label: '🧹 Nettoyage' },
  { value: 'soudure', label: '⚡ Soudure' },
  { value: 'mesure', label: '📏 Mesure' },
  { value: 'peinture', label: '🎨 Peinture' },
  { value: 'autre', label: '📦 Autre' }
];

const CONDITIONS = [
  { value: 'neuf', label: '✨ Neuf' },
  { value: 'excellent', label: '👍 Excellent état' },
  { value: 'bon', label: '✓ Bon état' },
  { value: 'acceptable', label: '⚠️ Acceptable' }
];

const Publish = () => {
  const [step, setStep] = useState('form'); // 'form' | 'preview'
  const [token, setToken] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'electroportatif',
    condition: 'bon',
    description: '',
    dailyPrice: '',
    deposit: '',
    location: '',
    images: []
  });
  const [previewData, setPreviewData] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.token) {
      window.location.href = '/connexion';
      return;
    }
    setToken(auth.token);
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setMsg('❌ Veuillez sélectionner une image valide');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setMsg('❌ L\'image ne doit pas dépasser 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(prev => ({ 
        ...prev, 
        images: [...prev.images, ev.target.result] 
      }));
      setMsg('✅ Image ajoutée');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) newErrors.title = 'Le titre est requis';
    if (!form.dailyPrice || parseFloat(form.dailyPrice) <= 0) {
      newErrors.dailyPrice = 'Le prix doit être positif';
    }
    if (!form.location.trim()) newErrors.location = 'La localisation est requise';
    if (!form.description.trim()) newErrors.description = 'La description est requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goPreview = () => {
    if (!validateForm()) {
      setMsg('❌ Veuillez corriger les erreurs ci-dessous');
      return;
    }
    
    setPreviewData({ ...form });
    setStep('preview');
    setMsg('');
  };

  const publish = async () => {
    if (!token) return;
    
    setLoading(true);
    setMsg('');

    try {
      const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
      
      // ✅ VÉRIFIER LES NOMS DES CHAMPS - Frontend utilise camelCase, API utilise snake_case
      const payload = {
        title: form.title,
        description: form.description,
        daily_price: parseFloat(form.dailyPrice),  // ← dailyPrice → daily_price
        caution_deposit: form.deposit ? parseFloat(form.deposit) : null,  // ← deposit → caution_deposit
        location: form.location,
        condition: form.condition,
        category: form.category  // ← AJOUTER CETTE LIGNE
      };

      console.log('📤 Payload final envoyé:', payload);

      const res = await fetch(`${API_BASE}/api/equipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      console.log('📨 Réponse:', res.status, data);

      if (res.ok && data.id) {
        setMsg('✅ Équipement publié avec succès !');
        setTimeout(() => {
          window.location.href = `/equipments/${data.id}`;
        }, 2000);
      } else {
        console.error('❌ Erreur API:', data);
        setMsg(`❌ Erreur : ${data.message || 'Erreur serveur'}`);
      }
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      setMsg(`❌ Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'preview' && previewData) {
    return (
      <section className="publish-page">
        <div className="publish-container">
          <h2>📋 Aperçu de l'annonce</h2>
          
          <div className="preview-card">
            <div className="preview-header">
              <h3>{previewData.title}</h3>
              <p className="preview-meta">
                {CATEGORIES.find(c => c.value === previewData.category)?.label} • 
                {CONDITIONS.find(c => c.value === previewData.condition)?.label}
              </p>
            </div>

            <div className="preview-body">
              <p><strong>📍 Localisation :</strong> {previewData.location}</p>
              <p><strong>💬 Description :</strong> {previewData.description}</p>
              <p><strong>💰 Prix :</strong> {previewData.dailyPrice}€ / jour</p>
              {previewData.deposit && <p><strong>🛡️ Caution :</strong> {previewData.deposit}€</p>}
            </div>

            {previewData.images.length > 0 && (
              <div className="preview-images">
                <p><strong>📸 Photos :</strong></p>
                <div className="images-grid">
                  {previewData.images.map((src, i) => (
                    <img key={i} src={src} alt={`preview-${i}`} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="preview-actions">
            <button 
              className="btn-outline" 
              onClick={() => setStep('form')}
              disabled={loading}
            >
              ← Modifier
            </button>
            <button 
              className="btn-primary" 
              onClick={publish}
              disabled={loading}
            >
              {loading ? '⏳ Publication...' : '✓ Publier'}
            </button>
          </div>
          
          {msg && <p className={msg.startsWith('✅') ? 'success' : 'error'}>{msg}</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="publish-page">
      <div className="publish-container">
        <h1>📦 Publier un outil</h1>
        <p className="section-subtitle">Remplissez les informations ci-dessous pour proposer votre équipement</p>

        <form className="publish-form" onSubmit={(e) => { e.preventDefault(); goPreview(); }}>
          
          {/* TITRE */}
          <div className="form-group">
            <label htmlFor="title">
              <span className="label-title">Titre de l'annonce *</span>
              <span className="label-hint">Ex: Perceuse électrique 18V professionnelle</span>
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Décrivez brièvement votre outil"
              className={`form-input ${errors.title ? 'error' : ''}`}
              required
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          {/* CATÉGORIE ET ÉTAT */}
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="category">
                <span className="label-title">Catégorie *</span>
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="form-select"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group half">
              <label htmlFor="condition">
                <span className="label-title">État *</span>
              </label>
              <select
                id="condition"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className="form-select"
              >
                {CONDITIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label htmlFor="description">
              <span className="label-title">Description détaillée *</span>
              <span className="label-hint">Incluez les caractéristiques, le mode d'emploi, les accessoires</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Décrivez votre équipement en détail..."
              rows="4"
              className={`form-input ${errors.description ? 'error' : ''}`}
              required
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          {/* LOCALISATION */}
          <div className="form-group">
            <label htmlFor="location">
              <span className="label-title">Localisation *</span>
              <span className="label-hint">Ville, code postal ou adresse</span>
            </label>
            <input
              id="location"
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Paris (75001) ou France"
              className={`form-input ${errors.location ? 'error' : ''}`}
              required
            />
            {errors.location && <span className="error-text">{errors.location}</span>}
          </div>

          {/* PRIX */}
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="dailyPrice">
                <span className="label-title">Prix journalier (€) *</span>
                <span className="label-hint">Montant par jour de location</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="dailyPrice"
                  type="number"
                  name="dailyPrice"
                  value={form.dailyPrice}
                  onChange={handleChange}
                  placeholder="25.99"
                  step="0.01"
                  min="0"
                  className={`form-input ${errors.dailyPrice ? 'error' : ''}`}
                  required
                />
                <span className="unit">€</span>
              </div>
              {errors.dailyPrice && <span className="error-text">{errors.dailyPrice}</span>}
            </div>

            <div className="form-group half">
              <label htmlFor="deposit">
                <span className="label-title">Caution (€)</span>
                <span className="label-hint">Montant de sécurité optionnel</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="deposit"
                  type="number"
                  name="deposit"
                  value={form.deposit}
                  onChange={handleChange}
                  placeholder="50.00"
                  step="0.01"
                  min="0"
                  className="form-input"
                />
                <span className="unit">€</span>
              </div>
            </div>
          </div>

          {/* IMAGES */}
          <div className="form-group">
            <label htmlFor="images">
              <span className="label-title">📸 Photos</span>
              <span className="label-hint">Max 5 MB par image, format JPG/PNG</span>
            </label>
            <input
              id="images"
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="form-input"
            />
            
            {form.images.length > 0 && (
              <div className="images-preview">
                <p className="preview-label">{form.images.length} image(s)</p>
                <div className="thumbs">
                  {form.images.map((src, i) => (
                    <div key={i} className="thumb-container">
                      <img src={src} alt={`thumb-${i}`} className="thumb" />
                      <button
                        type="button"
                        className="thumb-remove"
                        onClick={() => removeImage(i)}
                        title="Supprimer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={loading}>
              👁️ Aperçu
            </button>
            <button
              className="btn-outline"
              type="button"
              onClick={() => {
                setForm({
                  title: '',
                  category: 'electroportatif',
                  condition: 'bon',
                  description: '',
                  dailyPrice: '',
                  deposit: '',
                  location: '',
                  images: []
                });
                setErrors({});
                setMsg('');
              }}
            >
              🔄 Réinitialiser
            </button>
          </div>

          {msg && <p className={msg.startsWith('✅') ? 'success' : msg.startsWith('⚠️') ? 'warning' : 'error'}>{msg}</p>}
        </form>
      </div>
    </section>
  );
};

export default Publish;
