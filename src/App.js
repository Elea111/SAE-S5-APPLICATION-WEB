import React from 'react';
import './App.css';
import Inscription from "./pages/inscription/Inscription";

import Header from './components/layout/header/Header';
import Accueil from './pages/accueil/Accueil';
import Footer from './components/layout/footer/Footer'
import Connexion from "./pages/connexion/Connexion";

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
        </div>
    );

}

export default App;