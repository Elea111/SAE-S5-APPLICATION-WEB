import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Inscription from "./pages/inscription/Inscription";
import Header from './components/layout/header/Header';
import Accueil from './pages/accueil/Accueil';
import Footer from './components/layout/footer/Footer';
import ProfilProprietaire from './pages/profil-proprietaire/ProfilProprietaire';
import Connexion from "./pages/connexion/Connexion";
import Reservation from "./pages/reservation/Reservation";
import Paiement from "./pages/paiement/Paiement"
function App() {
    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/" element={<Accueil />} />
                    <Route path="/inscription" element={<Inscription />} />
                    <Route path="/connexion" element={<Connexion />} />
                    <Route path="/reservation" element={<Reservation />} />
                    <Route path="/profil-proprietaire" element={<ProfilProprietaire />} />
                    <Route path="/paiement" element={<Paiement />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;