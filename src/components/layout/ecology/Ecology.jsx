import React from 'react';
import './Ecology.css';

const Ecology = () => {
  return (
    <section className="ecology-section">
      <div className="ecology-container">
        <div className="ecology-content">
          <h2 className="ecology-title">🌱 Pour une économie circulaire</h2>
          
          <div className="ecology-benefits">
            <div className="benefit-card">
              <div className="benefit-icon">♻️</div>
              <h3>Réduction des déchets</h3>
              <p>En partageant les outils, nous réduisons la consommation inutile et prolongeons la durée de vie des équipements.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">🌍</div>
              <h3>Économies de ressources</h3>
              <p>Moins de production = moins d'extraction de matières premières et moins d'énergie consommée.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">💚</div>
              <h3>Empreinte carbone réduite</h3>
              <p>En partageant plutôt que d'acheter neuf, vous contribuez à réduire votre empreinte écologique.</p>
            </div>
            
            <div className="benefit-card">
              <div className="benefit-icon">👥</div>
              <h3>Communauté responsable</h3>
              <p>Rejoignez une communauté engagée dans le développement durable et l'économie collaborative.</p>
            </div>
          </div>
          
          <div className="ecology-message">
            <p>
              <strong>OutilPartage</strong> est une plateforme d'économie circulaire. 
              Ensemble, nous créons un monde plus durable en optimisant l'utilisation des ressources.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ecology;
