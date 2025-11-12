import React from 'react';
import './Accueil.css';
import Header from '../../components/layout/header/Header';
import Banniere from "./components/banniere/Banniere";

function Accueil() {
  return (
      <div className="accueil-page">
          <Banniere />


      </div>
  );
}

export default Accueil;