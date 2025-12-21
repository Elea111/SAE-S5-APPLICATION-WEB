import React from 'react';
import './App.css';
import Inscription from "./pages/inscription/Inscription";

import Header from './components/layout/header/Header';
import Accueil from './pages/accueil/Accueil';
import Footer from './components/layout/footer/Footer'
<<<<<<< HEAD
import ProfilPropietaire from './pages/profil-proprietaire/ProfilProprietaire';
=======
import Connexion from "./pages/connexion/Connexion";
>>>>>>> 5995d111370c15079aec9b6f53ee92eaff40b6fd

function App() {

    if (window.location.pathname === '/inscription') {
        return <Inscription />;
    }

    if (window.location.pathname === '/connexion') {
        return <Connexion />;
    }

    return (
        <div className="App">
            <Header />
            <Accueil />
            <Footer/>

            <ProfilPropietaire />

        </div>
    );

}

export default App;