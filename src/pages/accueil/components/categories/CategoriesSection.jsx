import React from 'react';
import './CategoriesSection.css';

import iconElectroportatif from '../../../../assets/icons/icon-electroportatif.png';
import iconJardinage from '../../../../assets/icons/icon-jardinage.png';
import iconConstruction from '../../../../assets/icons/icon-construction.png';
import iconPeinture from '../../../../assets/icons/icon-peinture.png';

const CategoriesSection = () => {
    const categories = [
        { name: 'Électroportatif', icon: iconElectroportatif },
        { name: 'Jardinage', icon: iconJardinage },
        { name: 'Construction', icon: iconConstruction },
        { name: 'Peinture', icon: iconPeinture },
        { name: 'Nettoyage', icon: iconElectroportatif },
        { name: 'Soudure', icon: iconConstruction },
        { name: 'Mesure', icon: iconPeinture },
        { name: 'Autre', icon: iconJardinage }
    ];

    return (
        <section className="section">
            <div className="section-container">
                <h2 className="section-title">Parcourir par catégorie</h2>

                <div className="categories-grid">
                    {categories.map((category, index) => (
                        <div key={index} className="category-card">
                            <div className="category-icon">
                                <img
                                    src={category.icon}
                                    alt={category.name}
                                    className="category-img"
                                />
                            </div>
                            <span className="category-name">{category.name}</span>
                        </div>
                    ))}
                </div>

                <button className="see-more-btn">
                    Voir plus
                </button>
            </div>
        </section>
    );
};

export default CategoriesSection;