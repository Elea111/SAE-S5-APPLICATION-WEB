import React from 'react';
import './Accueil.css';
import Banniere from "./components/banniere/Banniere";
import CategoriesSection from "./components/categories/CategoriesSection";
import OutilsPopulaires from './components/outils-populaires/OutilsPopulaires';
import CommentCaMarche from "./components/comment-ca-marche/CommentCaMarche";

function Accueil() {
      return (
          <div className="accueil-page">
              <Banniere />
              <CategoriesSection />
              <OutilsPopulaires />
              <CommentCaMarche />
          </div>
      );
}

export default Accueil;