import React, { useState } from 'react';
import './Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleInscription = () => { window.location.href = '/inscription'; };
    const handleConnexion = () => { window.location.href = '/connexion'; };

    // read auth to determine logged state
    const authRaw = typeof window !== 'undefined' ? localStorage.getItem('auth') : null;
    const auth = authRaw ? JSON.parse(authRaw) : {};
    // ✅ ACCEPTER TANT userId QUE id
    const isLogged = !!(auth && (auth.userId || auth.id) && auth.token);
    const userDisplayName = auth?.first_name && auth?.last_name 
      ? `${auth.first_name} ${auth.last_name}` 
      : auth?.email || null;
    const userAvatar = auth?.avatarUrl || auth?.user?.avatar_url || null;

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo"><h1>Outillio</h1></div>

                <div
                    className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                >
                    <div className="hamburger-line"></div>
                    <div className="hamburger-line"></div>
                    <div className="hamburger-line"></div>
                </div>

                <div className={`nav-section ${isMenuOpen ? 'active' : ''}`}>
                    <nav className="navigation">
                        <a href="/" className="nav-link">Découvrir</a>
                        <a
                            href="/search"
                            className="nav-link"
                            onClick={(e) => { e.preventDefault(); window.location.href = '/search'; }}
                        >
                            Chercher
                        </a>
                        <a
                            href="/publish"
                            className="nav-link"
                            onClick={(e) => { e.preventDefault(); window.location.href = '/publish'; }}
                        >
                            Proposer
                        </a>
                    </nav>

                    <div className="auth-buttons">
                        {isLogged ? (
                            <>
                                <button className="icon-btn" title="Messages" onClick={() => window.location.href = '/messages'}>💬</button>
                                <button className="icon-btn" title="Paramètres" onClick={() => window.location.href = '/settings'}>⚙️</button>
                                <button className="profile-btn" onClick={() => window.location.href = '/profil'}>
                                    {userAvatar ? <img src={userAvatar} alt="avatar" className="header-avatar" /> : <span className="header-initial">{(userDisplayName || 'U').charAt(0)}</span>}
                                    <span className="profile-label">{userDisplayName || 'Mon compte'}</span>
                                </button>
                                <button className="logout-btn" onClick={() => { localStorage.removeItem('auth'); window.location.reload(); }}>Déconnexion</button>
                            </>
                        ) : (
                            <>
                                <button className="connexion-btn" onClick={handleConnexion}>Connexion</button>
                                <button className="inscription-btn" onClick={handleInscription}>Inscription</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;