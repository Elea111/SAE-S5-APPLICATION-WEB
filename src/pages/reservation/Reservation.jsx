import React, { useState } from "react";
import "./Reservation.css";
import img1 from "../../assets/images/outilsPopulaires/img1.png";

export default function ReservationPage() {
    const pricePerDay = 40;
    const serviceFee = 5;

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const daysCount =
        startDate && endDate
            ? Math.max(
                1,
                (new Date(endDate) - new Date(startDate)) /
                (1000 * 60 * 60 * 24) +
                1
            )
            : 0;

    const total =
        daysCount > 0 ? daysCount * pricePerDay + serviceFee : 0;

    // Fonction pour gérer la réservation
    const handleReservation = () => {
        if (daysCount === 0) return;

        // Créer l'objet avec les données de réservation
        const reservationData = {
            total: total, // Total final
            subtotal: pricePerDay * daysCount, // Prix sans les frais
            toolName: "Tondeuse à gazon",
            days: daysCount,
            pricePerDay: pricePerDay,
            serviceFee: serviceFee,
            startDate: startDate,
            endDate: endDate,
            // Ajouter le calcul détaillé pour affichage
            calculation: {
                dailyPrice: pricePerDay,
                days: daysCount,
                dailyTotal: pricePerDay * daysCount,
                fee: serviceFee
            }
        };

        // Sauvegarder dans localStorage
        console.log("Sauvegarde des données:", reservationData);
        localStorage.setItem('reservationData', JSON.stringify(reservationData));

        // Rediriger vers la page de paiement
        window.location.href = '/paiement';
    };

    return (
        <div className="reservation-page">
            {/* LEFT */}
            <div className="reservation-left">
                <img
                    src={img1}
                    className="reservation-image"
                    alt="Tondeuse à gazon"
                />
                <div className="title-container">
                    <h1>Tondeuse à gazon</h1>
                    <span className="badge">Jardinage</span>
                </div>
                <div className="provider-info">
                    <span>Proposé par Pierre Martin</span>
                    <span className="rating">★ 4.8 (2 avis)</span>
                </div>
                <div className="description-section">
                    <h3>Description</h3>
                    <p>
                        Tondeuse électrique performante pour jardins de taille
                        moyenne. Largeur de coupe 42cm, bac de ramassage 50L.
                    </p>
                </div>
            </div>

            {/* RIGHT */}
            <div className="reservation-card">
                <h2>{pricePerDay}€ / jour</h2>

                <div className="dates">
                    <label>Début</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <label>Fin</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <div className="price-line">
                    <span>
                        {pricePerDay}€ × {daysCount} jours
                    </span>
                    <span>{pricePerDay * daysCount}€</span>
                </div>

                <div className="price-line">
                    <span>Frais de service</span>
                    <span>{daysCount > 0 ? serviceFee : 0}€</span>
                </div>

                <div className="price-line total">
                    <strong>Total</strong>
                    <strong>{total}€</strong>
                </div>

                <button
                    className="reserve-btn"
                    onClick={handleReservation} // Utiliser la fonction handleReservation
                    disabled={daysCount === 0}
                >
                    Réserver
                </button>

                <div className="options">
                    <div className="option-item">
                        <span className="option-icon">✓</span>
                        <span>Annulation gratuite</span>
                    </div>
                    <div className="option-item">
                        <span className="option-icon">✓</span>
                        <span>Assurance incluse</span>
                    </div>
                </div>
            </div>
        </div>
    );
}