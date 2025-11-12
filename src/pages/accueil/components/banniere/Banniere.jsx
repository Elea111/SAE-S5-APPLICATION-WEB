import React from 'react';
import './Banniere.css';
import banniereImage from '../../../../assets/images/banniere-accueil-img.png';

const Banniere = () => {
    return (
        <section className="banniere-section">
            <div className="banniere-container">
                <div className="banniere-content">
                    <div className="top-section">
                        <div className="text-section">
                            <h1 className="banniere-title"><strong>Louez les outils dont vous avez besoin.</strong></h1>
                            <p className="banniere-subtitle">
                                La plateforme idéale pour la location de matériel professionnel entre pairs.
                            </p>
                            <p className="banniere-description">
                                Economisez, gagnez de l'argent et construisez mieux.
                            </p>
                            <button className="find-tool-btn">
                                Touver un outil
                            </button>
                        </div>

                        <div className="image-section">
                            <img src={banniereImage} alt="Outils professionnels" className="banniere-tools-image" />
                        </div>
                    </div>

                    <div className="search-section">
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

                            <button type="submit" className="search-button">
                                Rechercher
                            </button>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Banniere;