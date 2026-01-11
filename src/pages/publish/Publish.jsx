import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './Publish.css';

const CONDITIONS = [
  { value: 'neuf', label: '✨ Neuf' },
  { value: 'excellent', label: '👍 Excellent état' },
  { value: 'bon', label: '✓ Bon état' },
  { value: 'acceptable', label: '⚠️ Acceptable' }
];

const Publish = () => {
  const [fileInputKey, setFileInputKey] = useState(Date.now()); 
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dailyPrice: '',
    caution: '',
    location: '',
    condition: 'bon',
    category: '', // ✅ Commencer vide
    images: []
  });

  const [previews, setPreviews] = useState([]);
  const [step, setStep] = useState('form');
  const [token, setToken] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]); // ✅ AJOUTER
  const [categoryMap, setCategoryMap] = useState({}); // ✅ AJOUTER

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
  
  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      dailyPrice: '',
      caution: '',
      location: '',
      condition: 'bon',
      category: categories.length > 0 ? categories[0].value : '',
      images: []
    });
    setPreviews([]);
    setError('');
    setMsg('');
    setSuccess('');
    
    // Réinitialiser l'input file en changeant sa clé
    setFileInputKey(Date.now());
    
    // Nettoyer également les URLs d'objets créés pour les prévisualisations
    previews.forEach(preview => {
      if (preview.url) {
        URL.revokeObjectURL(preview.url);
      }
    });
  };

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.token) {
      window.location.href = '/connexion';
      return;
    }
    setToken(auth.token);

    // ✅ CHARGER LES CATÉGORIES
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        const data = await res.json();
        
        console.log('📦 Catégories chargées:', data); // DEBUG
        
        const map = {};
        const cats = data.map(cat => {
          map[cat.slug] = cat.id;
          return { value: cat.slug, label: `${cat.icon} ${cat.name}` };
        });
        
        setCategories(cats);
        setCategoryMap(map); // ✅ SET LE MAP
        console.log('🗺️ Category map:', map); // DEBUG

        // ✅ Définir la première catégorie par défaut
        if (cats.length > 0) {
          setFormData(prev => ({ ...prev, category: cats[0].value }));
        }
      } catch (err) {
        console.error('Erreur chargement catégories:', err);
      }
    };

    fetchCategories();
  }, [API_BASE]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Effacer erreur au changement
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limiter à 5 images
    if (files.length > 5) {
      setError('Maximum 5 images autorisées');
      return;
    }

    // ✅ ENLEVER storageService.compressImage - juste garder les fichiers bruts
    setLoading(true);
    try {
      // Les images seront compressées par le backend si nécessaire
      setFormData(prev => ({ ...prev, images: files }));

      // Créer les previews directement depuis les fichiers
      const newPreviews = files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }));
      setPreviews(newPreviews);
      setSuccess(`${files.length} image(s) prête(s) à publier`);
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    if (previews[index] && previews[index].url) {
      URL.revokeObjectURL(previews[index].url);
    }
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    // Validation
    if (!formData.title || formData.title.trim().length < 3) {
      setError('Titre min 3 caractères');
      return false;
    }
    if (!formData.description || formData.description.length < 10) {
      setError('Description min 10 caractères');
      return false;
    }
    if (!formData.dailyPrice || parseFloat(formData.dailyPrice) <= 0) {
      setError('Prix doit être > 0');
      return false;
    }
    if (formData.caution && parseFloat(formData.caution) <= 0) {
      setError('Caution doit être > 0');
      return false;
    }
    if (!formData.location || formData.location.trim().length < 2) {
      setError('Localisation min 2 caractères');
      return false;
    }
    return true;
  };

  const goPreview = () => {
    if (!validateForm()) {
      setMsg('❌ Veuillez corriger les erreurs ci-dessous');
      return;
    }
    
    setStep('preview');
    setMsg('');
  };

  const publish = async () => {
    if (!token) return;
    
    setLoading(true);
    setMsg('');

    try {
      setSuccess('Publication de l\'équipement...');

      // ✅ VÉRIFIER QUE LE MAP EST CHARGÉ
      console.log('🗺️ Utilisation du map:', categoryMap);
      console.log('📋 Catégorie sélectionnée:', formData.category);

      const categoryId = categoryMap[formData.category];
      
      console.log('🆔 Category ID résolu:', categoryId); // DEBUG
      
      if (!categoryId) {
        setMsg('❌ Catégorie invalide. Veuillez en sélectionner une.');
        setLoading(false);
        return;
      }

      // 1️⃣ PUBLIER L'ÉQUIPEMENT
      const payload = {
        title: formData.title,
        description: formData.description,
        daily_price: parseFloat(formData.dailyPrice),
        caution_deposit: formData.caution ? parseFloat(formData.caution) : null,
        location: formData.location,
        condition: formData.condition,
        category_id: categoryId // ✅ UUID réel
      };

      console.log('📤 Payload final:', payload); // DEBUG

      const res = await fetch(`${API_BASE}/api/equipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      console.log('📨 Réponse équipement:', res.status, data);

      if (!res.ok || !data.id) {
        console.error('❌ Erreur API:', data);
        setMsg(`❌ Erreur : ${data.message || 'Erreur serveur'}`);
        setLoading(false);
        return;
      }

      const equipmentId = data.id;

      // 2️⃣ UPLOAD LES IMAGES APRÈS
      if (formData.images.length > 0) {
        setSuccess('Téléchargement images...');
        
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i];
          const imgFormData = new FormData();
          imgFormData.append('image', file);
          imgFormData.append('sortOrder', i);
          imgFormData.append('isMain', i === 0);

          const imgRes = await fetch(
            `${API_BASE}/api/equipments/${equipmentId}/images`,
            {
              method: 'POST',
              body: imgFormData
            }
          );

          if (!imgRes.ok) {
            const errText = await imgRes.text();
            console.warn(`Erreur upload image ${i + 1}:`, errText);
          }
        }
      }

      setMsg('✅ Équipement publié avec succès !');
      setTimeout(() => {
        window.location.href = `/equipments/${equipmentId}`;
      }, 2000);
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      setMsg(`❌ Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'preview') {
    return (
      <section className="publish-page">
        <div className="publish-container">
          <h2>📋 Aperçu de l'annonce</h2>
          
          <div className="preview-card">
            <div className="preview-header">
              <h3>{formData.title}</h3>
              <p className="preview-meta">
                {categories.find(c => c.value === formData.category)?.label} • 
                {CONDITIONS.find(c => c.value === formData.condition)?.label}
              </p>
            </div>

            <div className="preview-body">
              <p><strong>📍 Localisation :</strong> {formData.location}</p>
              <p><strong>💬 Description :</strong> {formData.description}</p>
              <p><strong>💰 Prix :</strong> {formData.dailyPrice}€ / jour</p>
              {formData.caution && <p><strong>🛡️ Caution :</strong> {formData.caution}€</p>}
            </div>

            {previews.length > 0 && (
              <div className="preview-images">
                <p><strong>📸 Photos :</strong></p>
                <div className="images-grid">
                  {previews.map((src, i) => (
                    <img key={i} src={src.url} alt={`preview-${i}`} />
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
    <>
      <Header />
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
              value={formData.title}
              onChange={handleChange}
              placeholder="Décrivez brièvement votre outil"
              className={`form-input ${error && error.includes('Titre') ? 'error' : ''}`}
              required
            />
            {error && error.includes('Titre') && <span className="error-text">{error}</span>}
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
                value={formData.category}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {categories.map(c => (
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
                value={formData.condition}
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
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez votre équipement en détail..."
              rows="4"
              className={`form-input ${error && error.includes('Description') ? 'error' : ''}`}
              required
            />
            {error && error.includes('Description') && <span className="error-text">{error}</span>}
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
              value={formData.location}
              onChange={handleChange}
              placeholder="Paris (75001) ou France"
              className={`form-input ${error && error.includes('Localisation') ? 'error' : ''}`}
              required
            />
            {error && error.includes('Localisation') && <span className="error-text">{error}</span>}
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
                  value={formData.dailyPrice}
                  onChange={handleChange}
                  placeholder="25.99"
                  step="0.01"
                  min="0"
                  className={`form-input ${error && error.includes('Prix') ? 'error' : ''}`}
                  required
                />
                <span className="unit">€</span>
              </div>
              {error && error.includes('Prix') && <span className="error-text">{error}</span>}
            </div>

            <div className="form-group half">
              <label htmlFor="caution">
                <span className="label-title">Caution (€)</span>
                <span className="label-hint">Montant de sécurité optionnel</span>
              </label>
              <div className="input-with-unit">
                <input
                  id="caution"
                  type="number"
                  name="caution"
                  value={formData.caution}
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
              <span className="label-title">Images *</span>
              <span className="label-hint">Max 5 images, format JPG/PNG</span>
            </label>
            <input
              key={fileInputKey} 
              id="images"
              type="file"
              name="images"
              accept="image/*"
              onChange={handleImageChange}
              multiple
              className={`form-input ${error && error.includes('image') ? 'error' : ''}`}
              required={previews.length === 0}
            />
            {error && error.includes('image') && <span className="error-text">{error}</span>}

            {previews.length > 0 && (
              <div className="images-preview">
                <p className="preview-label">{previews.length} image(s) sélectionnée(s)</p>
                <div className="thumbs">
                  {previews.map((src, i) => (
                    <div key={i} className="thumb-container">
                      <img src={src.url} alt={`thumb-${i}`} className="thumb" />
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
              Aperçu
            </button>
            <button
              className="btn-outline"
              type="button"
              onClick={handleReset} 
              disabled={loading}
            >
              Réinitialiser
            </button>
          </div>

          {msg && <p className={msg.startsWith('✅') ? 'success' : msg.startsWith('⚠️') ? 'warning' : 'error'}>{msg}</p>}
        </form>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Publish;
