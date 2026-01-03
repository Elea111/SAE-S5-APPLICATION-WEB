import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/header/Header';
import Footer from '../../components/layout/footer/Footer';
import './EditEquipment.css';

const CONDITIONS = [
  { value: 'neuf', label: '✨ Neuf' },
  { value: 'excellent', label: '👍 Excellent état' },
  { value: 'bon', label: '✓ Bon état' },
  { value: 'acceptable', label: '⚠️ Acceptable' }
];

const EditEquipment = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dailyPrice: '',
    caution: '',
    location: '',
    condition: 'bon',
    category: '',
    images: []
  });

  const [previews, setPreviews] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [token, setToken] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [itemId, setItemId] = useState(null);
  const [equipment, setEquipment] = useState(null);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

  // 📥 CHARGER L'ITEM À L'ÉDITION
  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    if (!auth.token) {
      window.location.href = '/connexion';
      return;
    }
    setToken(auth.token);

    // Récupérer l'ID depuis le query param
    const params = new URLSearchParams(window.location.search);
    const id = params.get('item');
    
    if (!id) {
      setError('ID d\'équipement manquant');
      return;
    }

    setItemId(id);

    // Charger l'équipement
    const fetchEquipment = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/equipments/${id}`);
        if (!res.ok) throw new Error('Équipement non trouvé');
        const data = await res.json();
        
        console.log('📦 Équipement chargé:', data);
        
        setEquipment(data);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          dailyPrice: data.daily_price?.toString() || '',
          caution: data.caution_deposit?.toString() || '',
          location: data.location || '',
          condition: data.condition || 'bon',
          category: data.category_slug || data.category_id || '',
          images: []
        });

        // Charger les photos existantes
        if (data.photos && Array.isArray(data.photos)) {
          setExistingPhotos(data.photos);
        }
      } catch (err) {
        console.error('Erreur chargement équipement:', err);
        setError('Impossible de charger l\'équipement');
      }
    };

    fetchEquipment();

    // Charger les catégories
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        const data = await res.json();
        
        const map = {};
        const cats = data.map(cat => {
          map[cat.slug] = cat.id;
          return { value: cat.slug, label: `${cat.icon} ${cat.name}` };
        });
        
        setCategories(cats);
        setCategoryMap(map);
      } catch (err) {
        console.error('Erreur chargement catégories:', err);
      }
    };

    fetchCategories();
  }, [API_BASE]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > 5) {
      setError('Maximum 5 images autorisées');
      return;
    }

    setLoading(true);
    try {
      setFormData(prev => ({ ...prev, images: files }));

      const newPreviews = files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        isNew: true
      }));
      setPreviews(newPreviews);
      setSuccess(`${files.length} image(s) prête(s) à remplacer`);
    } catch (err) {
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeExistingPhoto = (photoId) => {
    setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const validateForm = () => {
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

  const saveChanges = async () => {
    if (!token || !itemId) return;
    
    if (!validateForm()) {
      setMsg('❌ Veuillez corriger les erreurs ci-dessous');
      return;
    }

    setLoading(true);
    setMsg('');

    try {
      setSuccess('Mise à jour de l\'équipement...');

      const categoryId = categoryMap[formData.category];
      if (!categoryId) {
        setError('Catégorie invalide');
        setLoading(false);
        return;
      }

      // 1️⃣ METTRE À JOUR LES INFOS DE L'ÉQUIPEMENT
      const payload = {
        title: formData.title,
        description: formData.description,
        daily_price: parseFloat(formData.dailyPrice),
        caution_deposit: formData.caution ? parseFloat(formData.caution) : null,
        location: formData.location,
        condition: formData.condition,
        category_id: categoryId
      };

      const updateRes = await fetch(`${API_BASE}/api/equipments/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!updateRes.ok) {
        const err = await updateRes.json();
        throw new Error(err.message || 'Erreur mise à jour');
      }

      setSuccess('Équipement mis à jour avec succès ✅');

      // 2️⃣ SI NOUVELLES IMAGES -> UPLOAD
      if (formData.images.length > 0) {
        const formDataImg = new FormData();
        formData.images.forEach((img, idx) => {
          formDataImg.append(`images`, img);
        });

        const imageRes = await fetch(`${API_BASE}/api/equipments/${itemId}/images`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataImg
        });

        if (!imageRes.ok) {
          console.error('Erreur upload images');
        } else {
          setSuccess('Images mises à jour ✅');
          setPreviews([]);
          setFormData(prev => ({ ...prev, images: [] }));
        }
      }

      setTimeout(() => {
        window.location.href = `/equipments/${itemId}`;
      }, 2000);
    } catch (err) {
      console.error('Erreur:', err);
      setMsg(`❌ Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteEquipment = async () => {
    if (!window.confirm('⚠️ Êtes-vous sûr? Cette action est irréversible.')) return;
    
    if (!token || !itemId) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/equipments/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Erreur suppression');
      }

      setSuccess('Équipement supprimé ✅');
      setTimeout(() => {
        window.location.href = '/profil-proprietaire';
      }, 2000);
    } catch (err) {
      setMsg(`❌ Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!equipment) {
    return (
      <>
        <Header />
        <div className="edit-equipment-page">
          <div className="edit-container">
            <p>Chargement de l'équipement...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="edit-equipment-page">
        <div className="edit-container">
          <h1>✏️ Modifier l'équipement</h1>

          {error && <div className="message error">{error}</div>}
          {msg && <div className="message">{msg}</div>}
          {success && <div className="message success">{success}</div>}

          <div className="edit-form">
            {/* 📝 INFOS PRINCIPALES */}
            <section className="form-section">
              <h2>Informations principales</h2>
              
              <div className="form-group">
                <label>Titre *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Perceuse Makita 18V"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez l'état, les fonctionnalités, accessoires inclus..."
                  rows="6"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="">-- Sélectionner --</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>État *</label>
                  <select name="condition" value={formData.condition} onChange={handleChange}>
                    {CONDITIONS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prix par jour (€) *</label>
                  <input
                    type="number"
                    name="dailyPrice"
                    value={formData.dailyPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label>Caution (€)</label>
                  <input
                    type="number"
                    name="caution"
                    value={formData.caution}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Localisation *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ex: Paris 12e, France"
                />
              </div>
            </section>

            {/* 📸 PHOTOS EXISTANTES */}
            {existingPhotos.length > 0 && (
              <section className="form-section">
                <h2>Photos actuelles</h2>
                <div className="photos-grid">
                  {existingPhotos.map(photo => (
                    <div key={photo.id} className="photo-item">
                      <img src={photo.image_url} alt="Photo" />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeExistingPhoto(photo.id)}
                      >
                        ✕ Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 📸 AJOUTER NOUVELLES IMAGES */}
            <section className="form-section">
              <h2>Ajouter/Remplacer les photos</h2>
              <div className="image-upload">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                  id="image-input"
                />
                <label htmlFor="image-input" className="upload-label">
                  📁 Sélectionner des images (max 5)
                </label>
              </div>

              {previews.length > 0 && (
                <div className="photos-grid">
                  {previews.map((preview, idx) => (
                    <div key={idx} className="photo-item">
                      <img src={preview.url} alt={`Preview ${idx}`} />
                      <span className="badge">Nouvelle</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 🎯 ACTIONS */}
            <section className="form-actions">
              <button
                className="btn-primary"
                onClick={saveChanges}
                disabled={loading}
              >
                {loading ? '⏳ Mise à jour...' : '💾 Enregistrer les modifications'}
              </button>

              <button
                className="btn-danger"
                onClick={deleteEquipment}
                disabled={loading}
              >
                {loading ? '⏳ Suppression...' : '🗑️ Supprimer l\'équipement'}
              </button>

              <button
                className="btn-outline"
                onClick={() => window.location.href = `/equipments/${itemId}`}
                disabled={loading}
              >
                Annuler
              </button>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditEquipment;
