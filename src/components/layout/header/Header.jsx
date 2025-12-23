import React, { useState } from 'react';
import './Header.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    const handleHome = () => {
        window.location.href = '/';
    };

    const handleInscription = () => {
        window.location.href = '/inscription';
    };
    const handleConnexion = () => {
        window.location.href = '/connexion';
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo" onClick={handleHome} style={{cursor: 'pointer'}}>
                    <h1>Outillio</h1>
                </div>
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
                        <a href="#" className="nav-link">Découvrir</a>
                        <a href="#" className="nav-link">Proposer un outil</a>
                    </nav>

                    <div className="auth-buttons">
                        <button className="connexion-btn" onClick={handleConnexion}>Connexion</button>
                        <button className="inscription-btn" onClick={handleInscription}>Inscription</button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;