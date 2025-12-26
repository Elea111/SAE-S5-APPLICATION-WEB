import React, { useState, useEffect } from 'react';
import './Paiement.css';

const Paiement = () => {
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [amount, setAmount] = useState(0);
    const [reservationDetails, setReservationDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');

    useEffect(() => {
        const getReservationData = () => {
            try {
                const reservationData = localStorage.getItem('reservationData');
                if (reservationData) {
                    const data = JSON.parse(reservationData);
                    setReservationDetails(data);
                    setAmount(data.total || 0);
                }
            } catch (e) {
                console.error('Erreur lors de la lecture des données:', e);
            } finally {
                setIsLoading(false);
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

        // Simulation de traitement
        setIsLoading(true);
        setTimeout(() => {
            alert(`Paiement de ${amount}€ effectué avec succès !`);
            window.location.href = '/confirmation';
        }, 1000);
    };

    const submit = async () => {
        const booking = JSON.parse(localStorage.getItem('booking') || '{}');
        const token = 'votre_token_ici'; // Remplacez par votre méthode d'obtention de token

        try {
            const res = await fetch('http://localhost:4000/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking_id: booking.bookingId,
                    amount: booking.total,
                    currency: 'EUR'
                })
            });

            const responseData = await res.json();

            if (res.ok) {
                setMessage('Paiement effectué avec succès !');
                setPaymentStatus('paid');

                // Nettoyer le localStorage
                localStorage.removeItem('booking');

                // ✅ AFFICHER CONFIRMATION OU REDIRECT À /profil
                setTimeout(() => {
                    window.location.href = '/profil';
                }, 2000);
            } else {
                setMessage(`❌ Erreur : ${responseData.message}`);
            }
        } catch (err) {
            setMessage(`❌ Erreur : ${err.message}`);
        }
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
        }
        return value;
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
            amount > 0;
    };

    if (isLoading) {
        return (
            <div className="paiement-page">
                <div className="paiement-container">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    if (!reservationDetails || amount === 0) {
        return (
            <div className="paiement-page">
                <div className="paiement-container">
                    <h1 className="paiement-title">Paiement</h1>
                    <div className="error-message">
                        <p>❌ Aucune réservation trouvée ou montant invalide.</p>
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
                <h1 className="paiement-title">Paiement Sécurisé</h1>

                <div className="reservation-summary">
                    <p className="recap">Récapitulatif de votre commande</p>
                    <div className="summary-item">
                        <span>{reservationDetails.toolName || "Tondeuse à gazon"}</span>
                        <span>{reservationDetails.days || 0} jour(s)</span>
                    </div>
                    <div className="summary-item">
                        <span>Prix journalier</span>
                        <span>{reservationDetails.pricePerDay || 40}€</span>
                    </div>
                    <div className="summary-item">
                        <span>Sous-total</span>
                        <span>{reservationDetails.subtotal || 0}€</span>
                    </div>
                    <div className="summary-item">
                        <span>Frais de service</span>
                        <span>{reservationDetails.serviceFee || 0}€</span>
                    </div>
                    <div className="summary-item total">
                        <span>Total à payer</span>
                        <span>{amount}€</span>
                    </div>
                </div>

                <div className="card-type">
                    <span className="visa-badge">
                         VISA • MASTERCARD • CB • PAYPAL
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="paiement-form">
                    <div className="form-group">
                        <label htmlFor="cardName">Nom sur la carte</label>
                        <input
                            type="text"
                            id="cardName"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            placeholder="JEAN DUPONT"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cardNumber">Numéro de carte</label>
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
                            <label htmlFor="cvv">
                                Cryptogramme visuel
                            </label>
                            <input
                                type="password"
                                id="cvv"
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                placeholder="•••"
                                maxLength="3"
                                required
                            />
                        </div>
                    </div>

                    <div className="amount-section">
                        <div className="amount-line">
                            <span>Montant total</span>
                            <span className="amount">{amount}€</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="paiement-button"
                        disabled={!isFormValid() || isLoading}
                    >
                        {isLoading ? (
                            <span>Validation en cours...</span>
                        ) : (
                            <span>Payer {amount}€</span>
                        )}
                    </button>

                    <div style={{
                        textAlign: 'center',
                        fontSize: '12px',
                        color: '#718096',
                        marginTop: '16px'
                    }}>
                        🔒 Paiement 100% sécurisé • Vos données sont chiffrées
                    </div>
                </form>

                {message && (
                    <div className={`payment-message ${paymentStatus}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Paiement;