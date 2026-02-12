import React from 'react';
import './Accueil.css';
import Banniere from "./components/banniere/Banniere.jsx";
import CategoriesSection from "./components/categories/CategoriesSection.jsx";
import OutilsPopulaires from './components/outils-populaires/OutilsPopulaires.jsx';
import CommentCaMarche from "./components/comment-ca-marche/CommentCaMarche.jsx";
import Ecology from '../../components/layout/ecology/Ecology.jsx';
import ChatBot from '../../components/ChatBot/ChatBot.jsx';

function Accueil() {
      return (
          <div className="accueil-page">
              <Banniere />
              <CategoriesSection />
              <OutilsPopulaires />
              <CommentCaMarche />
              <Ecology />
              <ChatBot />
          </div>
      );
}

export default Accueil;