import React, { useState } from 'react';
import './Connexion.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Header from '../../components/layout/header/Header.jsx';
import Footer from '../../components/layout/footer/Footer.jsx';
import { OAuthButtons } from './OAuthButtons.jsx';

const Connexion = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
        const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
      
        const res = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (res.ok && data.id) {
            // ✅ SAUVEGARDER les données utilisateur + token
            localStorage.setItem('auth', JSON.stringify({
                userId: data.id,        // ← Clé canonique
                id: data.id,            // ← Alias pour compatibilité
                email: data.email,
                token: data.token,      // ← Token en localStorage (dev mode)
                isPro: data.isPro || false,
                first_name: data.first_name || '',
                last_name: data.last_name || ''
            }));

            setMessage('Connexion réussie !');
            setTimeout(() => {
                window.location.href = '/profil';
            }, 1000);
        } else {
            setMessage(`Erreur : ${data.message || 'Identifiants incorrects'}`);
        }
    } catch (error) {
        console.error('Erreur connexion:', error);
        setMessage(`Erreur : ${error.message}`);
    }
  };

  return (
    <>
      <Header />
      <section className="connexion-section">
        <div className="connexion-container">
          <div className="connexion-content">
            <form className="connexion-form" onSubmit={handleSubmit}>
            <h1 className="connexion-title">Connexion</h1>
            <p className="form-description">
              Connectez-vous à votre compte pour accéder à tous les outils disponibles.
            </p>

            <div className="form-field">
              <label className="field-label">Email</label>
              <input
                type="email"
                name="email"
                placeholder="m@example.com"
                className="form-input"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-field">
              <label className="field-label">Mot de passe</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="form-input password-input"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="login-btn">
                Se connecter
              </button>
            </div>

            {message && (
              <p className={message.startsWith('Erreur') ? 'error' : 'success'}>
                {message}
              </p>
            )}

            <div className="divider-section">
              <div className="divider">OU</div>
            </div>

            <OAuthButtons />

            <p className="signup-redirect">
              Pas encore inscrit ? <a href="/inscription" className="signup-link">Créer un compte</a>
            </p>
          </form>
        </div>
      </div>
      </section>
      <Footer />
    </>
  );
};

export default Connexion;
