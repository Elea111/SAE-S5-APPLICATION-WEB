import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            {/* Section Newsletter avec le logo en superposition */}
            <div className="newsletter-section">
                {/* Logo en haut à gauche */}
                <div className="brand-section">
                    <h1 className="brand-logo">Outillio®</h1>
                    <p className="brand-tagline">
                        La plateforme de location d'outils <br/>entre professionnels.
                    </p>
                </div>

                <div className="newsletter-container">
                    <h2 className="newsletter-title">NEWSLETTER</h2>
                    <p className="newsletter-subtitle">
                        <strong>La plateforme de location d'outils entre professionnels.</strong>
                    </p>
                    <p className="newsletter-description">
                        Abonnez-vous à notre newsletter pour des mises à jour et des offres spéciales !
                    </p>

                    <div className="subscribe-section">
                        <input
                            type="email"
                            placeholder="Votre adresse email"
                            className="email-input"
                        />
                        <button className="subscribe-btn">
                            SUBSCRIBE
                        </button>
                    </div>
                </div>
            </div>

            {/* Le reste du footer reste inchangé */}
            <div className="footer-links-section">
                <div className="footer-container">
                    <div className="footer-grid">
                        {/* Colonne INFORMATIONS */}
                        <div className="footer-column">
                            <h3 className="column-title">INFORMATIONS</h3>
                            <ul className="footer-links">
                                <li><a href="/a-propos">A propos de nous</a></li>
                                <li><a href="/livraison">Information de livraison</a></li>
                                <li><a href="/conditions">Conditions d'utilisation</a></li>
                            </ul>
                        </div>

                        {/* Colonne AIDE */}
                        <div className="footer-column">
                            <h3 className="column-title">AIDE</h3>
                            <ul className="footer-links">
                                <li><a href="/faq">FAQ</a></li>
                                <li><a href="/contact">Contact</a></li>
                            </ul>
                        </div>

                        {/* Colonne MON COMPTE */}
                        <div className="footer-column">
                            <h3 className="column-title">MON COMPTE</h3>
                            <ul className="footer-links">
                                <li><a href="/mon-compte">Mon compte</a></li>
                                <li><a href="/favoris">Favoris</a></li>
                            </ul>
                        </div>

                        {/* Colonne NAVIGATION */}
                        <div className="footer-column">
                            <h3 className="column-title">NAVIGATION</h3>
                            <ul className="footer-links">
                                <li><a href="/decouvrir">Découvrir</a></li>
                                <li><a href="/proposer-outil">Proposer un outil</a></li>
                            </ul>
                        </div>

                        {/* Colonne RÉSEAUX SOCIAUX */}
                        <div className="footer-column">
                            <h3 className="column-title">SUIVEZ NOS RÉSEAUX SOCIAUX</h3>
                            <div className="social-links">
                                <a href="#" className="social-link">Instagram</a>
                                <a href="#" className="social-link">Twitter</a>
                                <a href="#" className="social-link">Facebook</a>
                                <a href="#" className="social-link">LinkedIn</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Copyright */}
            <div className="copyright-section">
                <div className="copyright-container">
                    <p className="copyright-text">
                        © 2025 Outillio. Tous droits réservés.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;