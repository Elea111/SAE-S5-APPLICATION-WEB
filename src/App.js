import React from 'react';
import './App.css';
import Inscription from "./pages/inscription/Inscription.jsx";
import Header from './components/layout/header/Header.jsx';
import Accueil from './pages/accueil/Accueil.js';
import Footer from './components/layout/footer/Footer.jsx';
import ProfilPropietaire from './pages/profil-proprietaire/ProfilProprietaire.jsx';
import Connexion from "./pages/connexion/Connexion.jsx";
import EquipmentDetails from './pages/equipment/EquipmentDetails.jsx';
import Schedule from './pages/schedule/Schedule.jsx';
import Messages from './pages/messages/Messages.jsx';
import Publish from './pages/publish/Publish.jsx';
import SearchResults from './pages/search/SearchResults.jsx';
import Settings from './pages/settings/Settings.jsx';
import Payments from './pages/payments/Payments.jsx';

function App() {
    const path = window.location.pathname;

    if (path.startsWith('/inscription')) return <Inscription />;
    if (path.startsWith('/connexion')) return <Connexion />;
    if (path.startsWith('/profil')) return <ProfilPropietaire />;
    if (path.startsWith('/equipments/') || path.startsWith('/equipment/')) return <EquipmentDetails />;
    if (path.startsWith('/schedule')) return <Schedule />;
    if (path.startsWith('/messages')) return <Messages />;
    if (path.startsWith('/publish')) return <Publish />;
    if (path.startsWith('/search')) return <SearchResults />;
    if (path.startsWith('/settings')) return <Settings />;
    if (path.startsWith('/payments')) return <Payments />;

    return (
        <div className="App">
            <Header />
            <Accueil />
            <Footer />
        </div>
    );
}

export default App;