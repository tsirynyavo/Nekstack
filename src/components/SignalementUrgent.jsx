import React, { useState } from 'react';
import { signalementService } from '../services/signalementService';

const SignalementUrgent = () => {
  const [formData, setFormData] = useState({
    quartier: '',
    typeProbleme: '',
    description: '',
    lieuPrecis: '',
    nom: '',
    email: '',
    telephone: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const problemTypes = [
    { value: 'poteau_casse', label: '⚡ Poteau électrique cassé / tombé' },
    { value: 'cable_dangereux', label: '⚠️ Câble dangereux (tombé / exposé)' },
    { value: 'transformateur', label: '🔥 Transformateur explosion/fumée' },
    { value: 'cyclone_degats', label: '🌪️ Dégâts après cyclone (urgent)' },
    { value: 'poteau_penche', label: '📐 Poteau penché risque chute' },
    { value: 'autre', label: '📞 Autre danger urgent' }
  ];

  const quartiers = [
    'Andrainjato Sud',
    'Tanambao',
    'Manodidona',
    'Ambatovolo',
    'Tsaramandroso',
    'Ambalakely',
    'Antanimena'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.quartier || !formData.typeProbleme || !formData.description) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setSuccess(null);
    setError(null);

    const result = await signalementService.sendUrgentReport(formData);
    
    if (result.success) {
      setSuccess('✅ Signalement envoyé ! Le responsable Jirama sera alerté immédiatement.');
      setFormData({
        quartier: '',
        typeProbleme: '',
        description: '',
        lieuPrecis: '',
        nom: '',
        email: '',
        telephone: ''
      });
    } else {
      setError(`❌ Erreur : ${result.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="signalement-urgent">
      <div className="urgent-header">
        <span className="urgent-icon">⚠️</span>
        <h2>SIGNALEMENT URGENT - JIRAMA</h2>
        <p>Poteau cassé, câble dangereux, dégâts cyclone → Alertes immédiates</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Quartier *</label>
          <select name="quartier" value={formData.quartier} onChange={handleChange} required>
            <option value="">Sélectionnez votre quartier</option>
            {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Type de problème *</label>
          <select name="typeProbleme" value={formData.typeProbleme} onChange={handleChange} required>
            <option value="">-- Choisissez --</option>
            {problemTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Lieu précis (intersection, numéro, repère) *</label>
          <input
            type="text"
            name="lieuPrecis"
            value={formData.lieuPrecis}
            onChange={handleChange}
            placeholder="Ex: Près de l'école primaire, croisement rue X et Y"
            required
          />
        </div>

        <div className="form-group">
          <label>Description détaillée *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Décrivez le danger : poteau cassé, câble au sol, risque d'accident..."
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Votre nom (optionnel)</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Pour vous recontacter"
            />
          </div>
          <div className="form-group">
            <label>Téléphone (optionnel)</label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="Pour urgence"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email (optionnel)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Pour confirmation"
          />
        </div>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? '📧 Envoi en cours...' : '🚨 ENVOYER SIGNALEMENT URGENT'}
        </button>
      </form>

      <style>{`
        .signalement-urgent {
          background: linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%);
          border-radius: 16px;
          padding: 25px;
          margin: 20px 0;
          border: 2px solid #ff4444;
        }
        .urgent-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .urgent-icon {
          font-size: 48px;
        }
        .urgent-header h2 {
          color: #d32f2f;
          margin: 10px 0;
        }
        .urgent-header p {
          color: #666;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }
        input, select, textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #ff4444;
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #d32f2f;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }
        .submit-btn:hover:not(:disabled) {
          background: #b71c1c;
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .success-message {
          background: #4caf50;
          color: white;
          padding: 12px;
          border-radius: 8px;
          margin: 15px 0;
        }
        .error-message {
          background: #f44336;
          color: white;
          padding: 12px;
          border-radius: 8px;
          margin: 15px 0;
        }
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SignalementUrgent;