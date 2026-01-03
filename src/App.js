import React, { useState, useEffect } from 'react';
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
import EditEquipment from './pages/edit-equipment/EditEquipment.jsx';
import SearchResults from './pages/search/SearchResults.jsx';
import Settings from './pages/settings/Settings.jsx';
import Payments from './pages/paiement/Paiement.jsx';
import PaymentSuccess from './pages/paiement/PaymentSuccess.jsx';
import Reservation from './pages/reservation/Reservation.jsx';
import Bookings from './pages/bookings/Bookings.jsx';
import RateBooking from './pages/rate-booking/RateBooking.jsx';
import Terms from './pages/legal/Terms.jsx';
import Privacy from './pages/legal/Privacy.jsx';
import RGPD from './pages/legal/RGPD.jsx';
import { Elements } from '@stripe/react-stripe-js';
//import { loadStripe } from '@stripe/js';
import { loadStripe } from '@stripe/stripe-js'; // ✅ Bon nom

// ✅ Charger Stripe AVEC la bonne clé
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
    const [path, setPath] = useState('/');

    useEffect(() => {
        // Only run on client side
        setPath(window.location.pathname);
    }, []);

    // ✅ TOUS LES COMPOSANTS DOIVENT ETRE DANS <Elements>
    // Cela inclut Payments qui utilise useStripe()
    return (
        <Elements stripe={stripePromise}>
            <>
                {path.startsWith('/inscription') && <Inscription />}
                {path.startsWith('/connexion') && <Connexion />}
                {path.startsWith('/profil') && <ProfilPropietaire />}
                {(path.startsWith('/equipments/') || path.startsWith('/equipment/')) && <EquipmentDetails />}
                {path.startsWith('/schedule') && <Schedule />}
                {path.startsWith('/messages') && <Messages />}
                {path.startsWith('/publish') && <Publish />}
                {path.startsWith('/search') && <SearchResults />}
                {path.startsWith('/settings') && <Settings />}
                {path.startsWith('/paiement') && <Payments />}  {/* ✅ DANS <Elements> */}
                {path.startsWith('/payment-success') && <PaymentSuccess />}
                {path.startsWith('/bookings') && <Bookings />}
                {path.startsWith('/rate-booking') && <RateBooking />}
                {path.startsWith('/reservation') && <Reservation />}
                {path.startsWith('/edit-listing') && <EditEquipment />}
                
                {/* ✅ PAGES LÉGALES */}
                {path.startsWith('/legal/terms') && <Terms />}
                {path.startsWith('/legal/privacy') && <Privacy />}
                {path.startsWith('/legal/rgpd') && <RGPD />}

                {/* Page d'accueil par défaut */}
                {!path.startsWith('/') || path === '/' && (
                    <div className="App">
                        <Header />
                        <Accueil />
                        <Footer />
                    </div>
                )}
            </>
        </Elements>
    );
}

export default App;