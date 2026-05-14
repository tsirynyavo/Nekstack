import React from 'react';

const Reservation = () => {
    return (
        <div>
            <h1>Réserver une chambre</h1>
            <form>
                <div>
                    <label>Date d'arrivée:</label>
                    <input type="date" />
                </div>
                <div>
                    <label>Date de départ:</label>
                    <input type="date" />
                </div>
                <button type="submit">Confirmer la réservation</button>
            </form>
        </div>
    );
};

export default Reservation;