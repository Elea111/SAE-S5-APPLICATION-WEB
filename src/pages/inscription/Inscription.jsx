import React from 'react';
import './Inscription.css';

const Inscription = () => {
    return (
        <section className="inscription-section">
            <div className="inscription-container">
                <div className="inscription-content">

                    <form className="inscription-form">
                        <h1 className="inscription-title">Inscription</h1>
                        <p className="form-description">
                            Créez votre compte pour commencer à louer ou proposer des outils.
                        </p>

                        <div className="name-fields">
                            <div className="form-field half">
                                <label className="field-label">Prénom</label>
                                <input
                                    type="text"
                                    placeholder="Max"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-field half">
                                <label className="field-label">Nom</label>
                                <input
                                    type="text"
                                    placeholder="Robinson"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="field-label">Email</label>
                            <input
                                type="email"
                                placeholder="m@example.com"
                                className="form-input"
                            />
                        </div>

                        <div className="form-field">
                            <label className="field-label">Mot de passe</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="form-input"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="create-account-btn">
                                Créer un compte
                            </button>
                        </div>

                        <div className="alternative-options">
                            <button className="google-btn">
                                S'inscrire avec Google
                            </button>
                            <p className="login-redirect">
                                Vous avez déjà un compte? <a href="#" className="login-link">Se connecter</a>
                            </p>
                        </div>

                    </form>

                </div>
            </div>
        </section>
    );
};

export default Inscription;