import React from 'react';
import './Hero.css';
import heroImage from '../../../../assets/images/hero-img.png';

const Hero = () => {
    return (
        <section className="hero-section">
            <div className="hero-container">
                <div className="hero-content">
                    {/* Première div : Texte principal */}
                    <div className="top-section">
                        <div className="text-section">
                            <h1 className="hero-title">Louez les outils dont vous avez besoin.</h1>
                            <p className="hero-subtitle">
                                La plateforme idéale pour la location de matériel professionnel entre pairs.
                            </p>
                            <p className="hero-description">
                                Economisez, gagnez de l'argent et construisez mieux.
                            </p>
                        </div>

                        <div className="image-section">
                            <img src={heroImage} alt="Outils professionnels" className="hero-tools-image" />
                        </div>
                    </div>

                    <div className="search-section">
                        <h2 className="search-title">Touver un outil</h2>

                        <form className="search-form">
                            <div className="input-group">
                                <div className="form-field">
                                    <label className="field-label">Quel outil cherchez-vous ?</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: perceuse, ponceuse..."
                                        className="search-input"
                                    />
                                </div>

                                <div className="form-field">
                                    <label className="field-label">Lieu</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Paris, Lyon..."
                                        className="search-input"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="search-button">
                                Rechercher
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;