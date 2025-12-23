// ProfilProprietaire.jsx
import React, { useEffect, useState } from 'react';
import './ProfilProprietaire.css';

const ProfilProprietaire = () => {
    const [userData, setUserData] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const authRaw = localStorage.getItem('auth');
        if (!authRaw) {
            // nothing to load — keep static demo or null
            return;
        }
        try {
            const auth = JSON.parse(authRaw);
            const userId = auth.userId;
            if (!userId) return;
            // fetch user
            fetch(`/api/users/${userId}`)
                .then(r => r.json())
                .then(u => setUserData(u))
                .catch(() => {});
            // fetch reviews
            fetch(`/api/users/${userId}/reviews`)
                .then(r => r.json())
                .then(rs => setReviews(rs || []))
                .catch(() => {});
        } catch (e) { /* ignore */ }
    }, []);

    const sendMessage = async () => {
        if (!userData || !messageText) return;
        const authRaw = localStorage.getItem('auth');
        const auth = authRaw ? JSON.parse(authRaw) : {};
        const senderId = auth.userId || null;
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId,
                    receiverId: userData.id,
                    content: messageText
                })
            });
            if (res.ok) {
                setMessageText('');
                alert('Message envoyé (mock)');
            } else {
                const err = await res.json();
                alert(`Erreur: ${err.message || 'unk'}`);
            }
        } catch (e) {
            alert('Erreur d\'envoi');
        }
    };

    // If no dynamic user loaded, render demo static (existing UI)
    if (!userData) {
        // ...existing demo code...
        return (
            <div className="profil-proprietaire-page">
                <p>Profil démo — connectez-vous pour voir votre profil.</p>
            </div>
        );
    }

    return (
        <div className="profil-proprietaire-page">
            {/* Header du profil */}
            <div className="profile-header-section">
                <div className="profile-left">
                    <div className="profile-image-container">
                        <img
                            src={userData.avatar_url || '/favicon.ico'}
                            alt={userData.firstName || userData.email}
                            className="profile-image"
                        />
                    </div>
                </div>

                <div className="profile-right">
                    <div className="profile-main-info">
                        <h1 className="profile-name">{userData.first_name} {userData.last_name}</h1>
                        <p className="member-since">Membre depuis {new Date(userData.created_at).getFullYear()}</p>

                        <div className="rating-section">
                            <div className="stars"> {/* simple visual */}
                                {'★'.repeat(Math.round(userData.rating || 0))}{'☆'.repeat(5 - Math.round(userData.rating || 0))}
                            </div>
                            <span className="rating-text">
                                {(userData.rating || 0).toFixed(1)} / 5 sur {userData.review_count || 0} avis
                            </span>
                        </div>
                    </div>
                </div>

                {/* Badges de vérification à droite */}
                <div className="verification-section">
                    <div className="verification-badges">
                        <div className={`verification-badge ${userData.email_verified ? 'verified' : 'not-verified'}`}>
                            <span className="verification-icon">
                                {userData.email_verified ? '☑' : '☒'}
                            </span>
                            <span className="verification-text">
                                {userData.email_verified ? 'Email vérifié' : 'Email non vérifié'}
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
                        Outils proposés ({/* static count or fetch later */}0)
                    </h2>
                </div>

                {/* Ligne de séparation */}
                <hr className="section-divider light" />

                <div className="reviews-section">
                    <h3>Avis</h3>
                    {reviews.length === 0 ? <p>Aucun avis pour le moment.</p> : (
                        <ul>
                            {reviews.map(r => (
                                <li key={r.id}>{r.rating} — {r.title || r.content}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="contact-section">
                    <h3>Envoyer un message</h3>
                    <textarea value={messageText} onChange={e => setMessageText(e.target.value)} placeholder="Message..." />
                    <button onClick={sendMessage}>Envoyer</button>
                </div>
            </div>
        </div>
    );
};

export default ProfilProprietaire;