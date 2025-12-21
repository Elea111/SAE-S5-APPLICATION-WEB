// ProfilProprietaire.jsx
import React from 'react';
import './ProfilProprietaire.css';

// Import des images
import imageProfil from './imageProfil.png';
import perceuseVisseuseSansFil from './perceuseVisseuseSansFil.jpeg';


const ProfilProprietaire = () => {
    // Données statiques pour l'exemple
    const userData = {
        id: 1,
        name: "Jean Dupont",
        memberSince: 2023,
        rating: 4.8,
        totalReviews: 23,
        profileImage: imageProfil,
        tools: [
            {
                id: 1,
                name: "Perceuse-visseuse sans fil",
                price: 25,
                period: "jour",
                description: "Perceuse-visseuse sans fil de marque professionnelle, parfait état, batterie lithium 18V, livrée avec chargeur rapide et coffret de transport",
                image: perceuseVisseuseSansFil
            },
            {
                id: 2,
                name: "Scie circulaire plongeante",
                price: 35,
                period: "jour",
                description: "Scie circulaire plongeante 1600W, guidage laser, avec rail de guidage 140cm, parfaite pour les coupes droites",
                image: perceuseVisseuseSansFil
            },
            {
                id: 3,
                name: "Ponceuse à bande",
                price: 20,
                period: "jour",
                description: "Ponceuse à bande 720W, largeur de bande 75mm, système d'aspiration intégré, idéale pour les travaux de menuiserie",
                image: perceuseVisseuseSansFil
            }
        ],
        verification: {
            identity: true,
            email: true,
            phone: false // Exemple : téléphone non vérifié
        }
    };

    // Fonction pour générer les étoiles
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<span key={i} className="star full">★</span>);
            } else {
                stars.push(<span key={i} className="star empty">★</span>);
            }
        }
        
        return stars;
    };

    return (
        <div className="profil-proprietaire-page">
            {/* Header du profil */}
            <div className="profile-header-section">
                <div className="profile-left">
                    <div className="profile-image-container">
                        <img 
                            src={userData.profileImage} 
                            alt={userData.name}
                            className="profile-image"
                        />
                    </div>
                </div>

                <div className="profile-right">
                    <div className="profile-main-info">
                        <h1 className="profile-name">{userData.name}</h1>
                        <p className="member-since">Membre depuis {userData.memberSince}</p>
                        
                        <div className="rating-section">
                            <div className="stars">
                                {renderStars(userData.rating)}
                            </div>
                            <span className="rating-text">
                                {userData.rating.toFixed(1)} / 5 sur {userData.totalReviews} avis
                            </span>
                        </div>
                    </div>
                </div>

                {/* Badges de vérification à droite */}
                <div className="verification-section">
                    <div className="verification-badges">
                        <div className={`verification-badge ${userData.verification.identity ? 'verified' : 'not-verified'}`}>
                            <span className="verification-icon">
                                {userData.verification.identity ? '☑' : '☒'}
                            </span>
                            <span className="verification-text">
                                {userData.verification.identity ? 'Identité vérifiée' : 'Identité non vérifiée'}
                            </span>
                        </div>
                        <div className={`verification-badge ${userData.verification.email ? 'verified' : 'not-verified'}`}>
                            <span className="verification-icon">
                                {userData.verification.email ? '☑' : '☒'}
                            </span>
                            <span className="verification-text">
                                {userData.verification.email ? 'Email vérifié' : 'Email non vérifié'}
                            </span>
                        </div>
                        <div className={`verification-badge ${userData.verification.phone ? 'verified' : 'not-verified'}`}>
                            <span className="verification-icon">
                                {userData.verification.phone ? '☑' : '☒'}
                            </span>
                            <span className="verification-text">
                                {userData.verification.phone ? 'Téléphone vérifié' : 'Téléphone non vérifié'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ligne de séparation */}
            <hr className="section-divider" />

            {/* Section outils proposés */}
            <div className="tools-section">
                <div className="section-header">
                    <h2 className="section-title">
                        Outils proposés par {userData.name.split(' ')[0]} ({userData.tools.length})
                    </h2>
                </div>

                {/* Ligne de séparation */}
                <hr className="section-divider light" />

                {userData.tools.length > 0 ? (
                    <div className="tools-grid">
                        {userData.tools.map((tool) => (
                            <div key={tool.id} className="tool-card">
                                <h3 className="tool-name">{tool.name}</h3>
                                <div className="tool-image-container">
                                    <img 
                                        src={tool.image} 
                                        alt={tool.name}
                                        className="tool-image"
                                    />
                                </div>
                                <p className="tool-description">{tool.description}</p>
                                <div className="tool-price-info">
                                    <div className="tool-price">{tool.price}€ / {tool.period}</div>
                                    <div className="tool-availability">Disponible dès demain</div>
                                </div>
                                <button className="reserve-button">
                                    Réserver
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-tools-message">
                        <p>Aucun outil proposé pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilProprietaire;