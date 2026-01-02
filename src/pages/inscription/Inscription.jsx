import React, { useState } from 'react';
import './Inscription.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Header from '../../components/layout/header/Header.jsx';
import Footer from '../../components/layout/footer/Footer.jsx';

const Inscription = () => {
    const [message, setMessage] = useState(''); // pour afficher le succès ou l'erreur
    const [showPassword, setShowPassword] = useState(false);
    const [isPro, setIsPro] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleRoleChange = (e) => {
        setIsPro(e.target.value === 'pro');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';
      
            const res = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Erreur lors de l\'inscription');
            }

            const created = await res.json();
            
            // ✅ SAUVEGARDER EXACTEMENT COMME CONNEXION
            localStorage.setItem('auth', JSON.stringify({
                userId: created.id,        // ← Clé canonique
                id: created.id,            // ← Alias
                token: created.token,
                email: created.email,
                isPro: isPro,
                first_name: formData.firstName,
                last_name: formData.lastName
            }));

            setMessage("Inscription réussie !");
            setTimeout(() => {
                window.location.href = '/profil';
            }, 1000);
        } catch (error) {
            console.error('Erreur inscription:', error);
            setMessage(`Erreur : ${error.message}`);
        }
    };

    return (
        <>
            <Header />
            <section className="inscription-section">
            <div className="inscription-container">
                <div className="inscription-content">
                    <form className="inscription-form" onSubmit={handleSubmit}>
                        <h1 className="inscription-title">Inscription</h1>
                        <p className="form-description">
                            Créez votre compte pour commencer à louer ou proposer des outils.
                        </p>

                        <div className="name-fields">
                            <div className="form-field half">
                                <label className="field-label">Prénom</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="Max"
                                    className="form-input"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-field half">
                                <label className="field-label">Nom</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Robinson"
                                    className="form-input"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

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
                            <label className="field-label">Je suis</label>
                            <div className="radio-group">
                                <label>
                                    <input type="radio" name="role" value="part" checked={!isPro} onChange={handleRoleChange} />
                                    Particulier
                                </label>
                                <label>
                                    <input type="radio" name="role" value="pro" checked={isPro} onChange={handleRoleChange} />
                                    Professionnel
                                </label>
                            </div>
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
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="create-account-btn">
                                Créer un compte
                            </button>
                        </div>

                        <div className="alternative-options">
                            <button type="button" className="google-btn">
                                S'inscrire avec Google
                            </button>
                            <p className="login-redirect">
                                Vous avez déjà un compte? <a href="/connexion" className="login-link">Se connecter</a>
                            </p>
                        </div>
                        {message && <p className={message.startsWith("Erreur") ? "error" : "success"}>{message}</p>}

                    </form>
                </div>
            </div>
        </section>
            <Footer />
        </>
    );
};

export default Inscription;