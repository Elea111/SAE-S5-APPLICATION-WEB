import React from 'react';
import './App.css';
import Inscription from "./pages/inscription/Inscription";

import Header from './components/layout/header/Header';
import Accueil from './pages/accueil/Accueil';
import Footer from './components/layout/footer/Footer'
import ProfilPropietaire from './pages/profil-proprietaire/ProfilProprietaire';

function App() {

    if (window.location.pathname === '/inscription') {
        return <Inscription />;
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