import React, { useState } from 'react';
import './Connexion.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Connexion = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            if (!response.ok) {
                throw new Error('Email ou mot de passe incorrect');
            }

            const result = await response.json();
            // Store auth in localStorage for mock flows
            localStorage.setItem('auth', JSON.stringify({ token: result.token, userId: result.user?.id || null }));
            setMessage("Connexion réussie");
            // redirect to profile
            window.location.href = '/profil';
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <section className="connexion-section">
            <div className="connexion-container">
                <div className="connexion-content">
                    <form className="connexion-form" onSubmit={handleSubmit}>
                        <h1 className="connexion-title">Connexion</h1>
                        <p className="form-description">
                            Entrez votre email ci-dessous pour vous connecter à votre compte.
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
                            <div className="password-header">
                                <label className="field-label">Mot de passe</label>
                                <a href="#" className="forgot-password-link">
                                    Mot de passe oublié?
                                </a>
                            </div>
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
                            <button type="submit" className="login-btn">
                                Se connecter
                            </button>
                        </div>

                        {message && <p className="success">{message}</p>}
                        {error && <p className="error">{error}</p>}

                        <div className="alternative-options">
                            <button type="button" className="google-btn">
                                Se connecter avec Google
                            </button>
                            <p className="signup-redirect">
                                Vous n'avez pas de compte? <a href="/inscription" className="signup-link">S'inscrire</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Connexion;
