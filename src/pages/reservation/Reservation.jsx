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
    const handleReservation = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    item_id: equipmentId,
                    start_date: startDate,
                    end_date: endDate
                })
            });

            const data = await res.json();

            if (res.ok && data.id) {
                // Sauvegarder les détails de la réservation
                localStorage.setItem('booking', JSON.stringify({
                    bookingId: data.id,
                    total: totalAmount
                }));

                // ✅ REDIRECT À /paiement
                window.location.href = '/paiement';
            }
        } catch (err) {
            console.error('Erreur réservation:', err);
        }
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