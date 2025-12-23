import React, { useState, useEffect } from 'react'; // Ajoutez useEffect
import './Paiement.css';

const Paiement = () => {
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [amount, setAmount] = useState(0); // État pour le montant
    const [reservationDetails, setReservationDetails] = useState(null);

    // Récupérer les données de réservation au chargement
    useEffect(() => {
        const getReservationData = () => {
            try {
                const reservationData = localStorage.getItem('reservationData');
                console.log("Données brutes depuis localStorage:", reservationData);

                if (reservationData) {
                    const data = JSON.parse(reservationData);
                    console.log("Données parsées:", data);
                    setReservationDetails(data);
                    setAmount(data.total || 0);
                } else {
                    console.log("Aucune donnée de réservation trouvée");
                }
            } catch (e) {
                console.error('Erreur lors de la lecture des données de réservation:', e);
            }
        };

        getReservationData();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (amount === 0) {
            alert('Montant invalide. Veuillez revenir à la page de réservation.');
            return;
        }

        // Ici, vous ajouterez la logique de traitement du paiement
        alert(`Paiement de ${amount}€ effectué avec succès !`);
        // Rediriger vers une page de confirmation
        window.location.href = '/confirmation';
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setCardNumber(formatted);
    };

    const handleExpiryDateChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        setExpiryDate(value);
    };

    const isFormValid = () => {
        return cardName.trim() !== '' &&
            cardNumber.replace(/\s/g, '').length === 16 &&
            expiryDate.length === 5 &&
            cvv.length === 3 &&
            amount > 0; // Vérifier que le montant est valide
    };

    // Si pas de données de réservation, afficher un message
    if (!reservationDetails || amount === 0) {
        return (
            <div className="paiement-page">
                <div className="paiement-container">
                    <h1 className="paiement-title">Paiement</h1>
                    <div className="error-message">
                        <p>Aucune réservation trouvée ou montant invalide.</p>
                        <p>Veuillez d'abord effectuer une réservation.</p>
                        <button
                            className="back-button"
                            onClick={() => window.location.href = '/reservation'}
                        >
                            ← Retour à la réservation
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="paiement-page">
            <div className="paiement-container">
                <h1 className="paiement-title">Paiement</h1>

                {/* Afficher un résumé de la réservation */}
                <div className="reservation-summary">
                    <p className="recap">Récapitulatif</p>
                    <div className="summary-item">
                        <span>{reservationDetails.toolName || "Tondeuse à gazon"}</span><br></br>
                        <span>{reservationDetails.days || 0} jour(s)</span>
                    </div>
                    <div className="summary-item">
                        <span>{reservationDetails.pricePerDay || 40}€ × {reservationDetails.days || 0} jours = </span>
                        <span>{reservationDetails.subtotal || 0}€</span>
                    </div>
                    <div className="summary-item">
                        <span>Frais de service = </span>
                        <span>{reservationDetails.serviceFee || 0}€</span>
                    </div>
                    <div className="summary-item total">
                        <span>Total = </span>
                        <span>{amount}€</span>
                    </div>
                </div><br></br>

                <div className="card-type">
                    <span className="visa-badge">VISA / MASTERCARD / CB / PAYPAL </span>
                </div><br></br>

                <form onSubmit={handleSubmit} className="paiement-form">
                    <div className="form-group">
                        <label htmlFor="cardName">Nom sur la carte</label>
                        <input
                            type="text"
                            id="cardName"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Nom"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cardNumber">N° de carte</label>
                        <input
                            type="text"
                            id="cardNumber"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="expiryDate">Date d'expiration</label>
                            <input
                                type="text"
                                id="expiryDate"
                                value={expiryDate}
                                onChange={handleExpiryDateChange}
                                placeholder="MM/AA"
                                maxLength="5"
                                required
                            />
                        </div>

                        <div className="form-group half">
                            <label htmlFor="cvv">Cryptogramme visuel</label>
                            <input
                                type="text"
                                id="cvv"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                placeholder="123"
                                maxLength="3"
                                required
                            />
                        </div>
                    </div>

                    <div className="amount-section">
                        <div className="amount-line">
                            <span>Montant à payer</span>
                            <span className="amount">{amount}€</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="paiement-button"
                        disabled={!isFormValid()}
                    >
                        Payer {amount}€
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Paiement;