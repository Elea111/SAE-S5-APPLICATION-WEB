import React, { useState } from 'react';
import './Inscription.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { RegisterUser } from "../../domain/usecases/RegisterUser";

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
        setMessage(''); // reset à chaque submission

        try {
            const created = await RegisterUser(
                formData.firstName,
                formData.lastName,
                formData.email,
                formData.password
            );
            // Call backend to ensure isPro flag saved (fallback handled server-side)
            await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    isPro
                })
            });
            // store simple auth info for mock flows
            localStorage.setItem('auth', JSON.stringify({ userId: created.id, isPro }));
            setMessage("Inscription réussie !");
            // redirect to profile page
            window.location.href = '/profil';
        } catch (error) {
            console.error(error.message);
            setMessage(`Erreur : ${error.message}`);
        }
    };

    return (
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
    );
};

export default Inscription;