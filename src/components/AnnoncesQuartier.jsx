import React from 'react';
import { useAnnonces } from '../hooks/useAnnonces';

const AnnoncesQuartier = () => {
  const { quartier, setQuartier, annonces, quartiers, loading } = useAnnonces();

  const getTypeColor = (type) => {
    switch(type) {
      case 'electricite': return '#ff9800';
      case 'eau': return '#2196f3';
      case 'danger': return '#f44336';
      case 'travaux': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className="annonces-quartier">
      <div className="quartier-selector">
        <label>📍 Choisir votre quartier : </label>
        <select 
          value={quartier} 
          onChange={(e) => setQuartier(e.target.value)}
          className="quartier-select"
        >
          {quartiers.map(q => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>

      <div className="annonces-list">
        <h3>📢 Annonces pour {quartier}</h3>
        
        {loading && <p>Chargement...</p>}
        
        {!loading && annonces.length === 0 && (
          <p>Aucune annonce pour ce quartier</p>
        )}
        
        {annonces.map(annonce => (
          <div 
            key={annonce.id} 
            className="annonce-card"
            style={{ borderLeftColor: getTypeColor(annonce.type) }}
          >
            <div className="annonce-header">
              <span className="annonce-type">{annonce.type}</span>
              <span className="annonce-date">{annonce.date}</span>
            </div>
            <h4>{annonce.titre}</h4>
            <p>{annonce.message}</p>
          </div>
        ))}
      </div>

      <style >{`
        .annonces-quartier {
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .quartier-selector {
          margin-bottom: 20px;
        }
        .quartier-select {
          padding: 10px;
          font-size: 16px;
          border-radius: 8px;
          border: 1px solid #ddd;
          width: 100%;
          max-width: 300px;
        }
        .annonces-list h3 {
          margin-bottom: 15px;
          color: #333;
        }
        .annonce-card {
          background: #f9f9f9;
          padding: 15px;
          margin: 10px 0;
          border-radius: 8px;
          border-left: 4px solid;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .annonce-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
        }
        .annonce-type {
          text-transform: uppercase;
          font-weight: bold;
          color: #666;
        }
        .annonce-date {
          color: #999;
        }
        .annonce-card h4 {
          margin: 0 0 8px 0;
          color: #333;
        }
        .annonce-card p {
          margin: 0;
          color: #555;
        }
      `}</style>
    </div>
  );
};

export default AnnoncesQuartier;