import React from 'react';
import './OutilsPopulaires.css';
import toolsData from '../../../../data/outilsPopulaires.json';

import img1 from '../../../../assets/images/outilsPopulaires/img1.png';
import img2 from '../../../../assets/images/outilsPopulaires/img1.png';
import img3 from '../../../../assets/images/outilsPopulaires/img1.png';
import img4 from '../../../../assets/images/outilsPopulaires/img1.png';

const OutilsPopulaires = () => {
    const categoryImages  = [img1, img2, img3, img4, img1, img2, img3, img4];

    return (
        <section className="section">
            <div className="section-container">
                <div className="section-outils-populaires-header">
                    <h2 className=" section-title, outils-populaires-title" >Outils à la une</h2>
                    <a href="/tous-les-outils" className="voir-tout-link">
                        Voir tout →
                    </a>
                </div>
                <div className="tools-grid">
                    {toolsData.tools.map((tool) => (
                        <div key={tool.id} className="tool-card">
                            <div className="tool-image">
                                <img
                                    src={categoryImages[tool.category] || img1}
                                    alt={tool.name}
                                />
                            </div>
                            <div className="tool-content">
                                <div className="tool-category">{tool.category}</div>
                                <h3 className="tool-name">{tool.name}</h3>
                                <div className="tool-footer">
                                    <div className="price-container">
                                        <div className="tool-price">{tool.price}€</div>
                                        <span className="price-unit">/ jour</span>
                                    </div>
                                    <button className="reserve-btn">Réserver</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OutilsPopulaires;