import React from 'react';
import './App.css';

import Header from './components/layout/header/Header';
import Accueil from './pages/accueil/Accueil';
import Footer from './components/layout/footer/Footer'

function App() {
    return (
        <div className="App">
            <Header />
            <Accueil />
            <Footer/>
        </div>
    );
}

export default App;