import React, { useState } from 'react';
import './Header.css';

const Header = () => {

    const handleInscription = () => {
        window.location.href = '/inscription';
};
    const handleConnexion = () => {
        alert('Redirection vers la page de connexion');
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <h1>Outillio</h1>
                </div>

                <div className="nav-section">
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