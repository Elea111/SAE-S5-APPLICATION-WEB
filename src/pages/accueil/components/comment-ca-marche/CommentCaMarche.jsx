import React from 'react';
import './CommentCaMarche.css';

// Import des icônes pour les locataires
import iconRecherche from '../../../../assets/icons/icon-recherche.png';
import iconCalendier from '../../../../assets/icons/icon-calendrier.png';
import iconMains from '../../../../assets/icons/icon-mains.png';

// Import des icônes pour les propriétaires
import iconAdd from '../../../../assets/icons/icon-add.png';
import iconLocation from '../../../../assets/icons/icon-location.png';
import iconDollar from '../../../../assets/icons/icon-dollar.png';

const CommentCaMarche = () => {
    const stepsLocataire = [
        {
            number: 1,
            title: "Trouvez votre outil",
            description: "Recherchez parmi des milliers d'outils disponibles près de chez vous.",
            icon: iconRecherche
        },
        {
            number: 2,
            title: "Réservez en ligne",
            description: "Choisissez vos dates et réservez l'outil en quelques clics de manière sécurisée.",
            icon: iconCalendier
        },
        {
            number: 3,
            title: "Récupérez et travaillez",
            description: "Convenez d'un rendez-vous avec le propriétaire et commencez votre projet.",
            icon: iconMains
        }
    ];

    const stepsProprietaire = [
        {
            number: 1,
            title: "Proposez votre outil",
            description: "Créez une annonce en quelques minutes. C'est simple et gratuit.",
            icon: iconAdd
        },
        {
            number: 2,
            title: "Gérez vos locations",
            description: "Acceptez les demandes de location et organisez la remise de l'outil.",
            icon: iconLocation
        },
        {
            number: 3,
            title: "Gagnez de l'argent",
            description: "Recevez vos paiements en toute sécurité après chaque location terminée.",
            icon: iconDollar
        }
    ];

    return (
        <section className="section">
            <div className="section-container">
                <div className="section-header">
                    <h2 className="section-title">Comment ça marche ?</h2>
                    <p className="section-subtitle">
                        Louer ou proposer un outil sur Outilio est simple, rapide et sécurisé.
                    </p>
                </div>

                {/* Ligne pour les locataires */}
                <div className="steps-row">
                    <h3 className="row-title">Pour les locataires</h3>
                    <div className="steps-grid">
                        {stepsLocataire.map((step, index) => (
                            <div key={index} className="step-item">
                                <div className="step-icon">
                                    <img src={step.icon} alt={step.title} />
                                </div>
                                <div className="step-content">
                                    <h4 className="step-title">
                                        <span className="step-title-number">{step.number}.</span>
                                        {step.title}
                                    </h4>
                                    <p className="step-description">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ligne pour les propriétaires */}
                <div className="steps-row">
                    <h3 className="row-title">Pour les propriétaires</h3>
                    <div className="steps-grid">
                        {stepsProprietaire.map((step, index) => (
                            <div key={index} className="step-item">
                                <div className="step-icon">
                                    <img src={step.icon} alt={step.title} />
                                </div>
                                <div className="step-content">
                                    <h4 className="step-title">
                                        <span className="step-title-number">{step.number}.</span>
                                        {step.title}
                                    </h4>
                                    <p className="step-description">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CommentCaMarche;