import React from 'react';
import Header from './components/layout/header/Header';
import Accueil from './pages/accueil/Accueil';
import './App.css';

function App() {
    return (
        <div className="App">
            <Header />
            <Accueil />
        </div>
    );
}

export default App;