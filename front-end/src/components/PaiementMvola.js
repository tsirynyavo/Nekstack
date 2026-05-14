import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../components/PaiementMvola.css";

const PaiementMvola = ({ employe, salaireNet, onSuccess }) => {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5); // ⭐ AJOUT: Déclaration de countdown

  const API_BASE_URL = 'http://localhost:5050';

  // Countdown pour fermeture automatique
  useEffect(() => {
    let timer;
    if (step === 'success' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (step === 'success' && countdown === 0) {
      resetForm();
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Générer QR Code
  const genererQRCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/mvola/paiement-manuel`, {
        employeId: employe._id,
        montant: salaireNet
      });

      setTransaction(response.data);
      setStep('paiement');
      
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur génération QR Code');
    } finally {
      setLoading(false);
    }
  };

  // ⭐⭐ FONCTION : Marquer comme PAYÉ - VERSION CORRIGÉE
  const marquerCommePaye = async () => {
    try {
      setLoading(true);
      
      // Vérifier que nous avons toutes les données nécessaires
      if (!transaction || !transaction.transactionId) {
        setError('Données de transaction manquantes');
        return;
      }

      console.log('🔄 Confirmation du paiement...', {
        transactionId: transaction.transactionId,
        employeId: employe._id,
        employeNom: `${employe.prenom} ${employe.nom}`,
        montant: salaireNet
      });

      const response = await axios.put(
        `${API_BASE_URL}/api/mvola/payer/${transaction.transactionId}`,
        {
          // Envoyer les données supplémentaires pour le debug
          employeId: employe._id,
          montant: salaireNet,
          reference: transaction.reference
        }
      );

      console.log('✅ Réponse confirmation:', response.data);

      if (response.data.success) {
        setStep('success');
        setCountdown(5);
        
        // Recharger les données parentes si nécessaire
        if (onSuccess) {
          setTimeout(() => onSuccess(), 3000);
        }
      } else {
        setError('Erreur lors de la confirmation: ' + (response.data.error || 'Unknown error'));
      }
        
    } catch (error) {
      console.error('❌ Erreur confirmation paiement:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          'Erreur lors de la confirmation du paiement';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Annuler
  const annulerPaiement = async () => {
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/api/mvola/annuler/${transaction.transactionId}`);
      setStep('form');
      setTransaction(null);
    } catch (error) {
      setError('Erreur annulation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setTransaction(null);
    setError('');
    setCountdown(5);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="paiement-mvola-contacciner">
      <div className="mvola-hecader">
        <div className="mvola-loago">
          <div className="logo-caircle">M</div>
          <span className="logo-tcext">MVola</span>
        </div>
      </div>

      {error && (
        <div className="error-mecssage">
          <div className="error-cicon">⚠️</div>
          <div className="error-tccext">{error}</div>
        </div>
      )}

      {step === 'form' && (
        <div className="form-step">
          <h2>Paiement MVola</h2>
          
          <div className="employe-info">
            <p><strong>{employe.prenom} {employe.nom}</strong></p>
            <p>Matricule: {employe.matricule}</p>
            <p>Téléphone: {employe.telephone}</p>
            <p>Montant: {salaireNet.toLocaleString()} Ar</p>
          </div>

          <button 
            onClick={genererQRCode} 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Génération...' : 'Générer QR Code'}
          </button>
        </div>
      )}

      {step === 'paiement' && transaction && (
        <div className="paiement-stdsep">
          <h2>Scanner et Payer</h2>

          <div className="qr-secstion">
            <img src={transaction.qrCode} alt="QR Code MVola" className="qr-codse" />
            <p className="qr-hsint">Scannez avec votre appareil photo</p>
          </div>

          <div className="ussd-sesction">
            <p><strong>Code manuel:</strong></p>
            <code className="usssd-code">{transaction.codeUSSD}</code>
            <button 
              onClick={() => navigator.clipboard.writeText(transaction.codeUSSD)}
              className="btns-copy"
            >
              📋 Copier
            </button>
          </div>

          <div className="action-x">
            {/* ⭐ CORRECTION : Utiliser marquerCommePaye au lieu de marquerPaye */}
            <button onClick={marquerCommePaye} disabled={loading} className="btn-pxaye">
              {loading ? '...' : '✅ J\'ai payé'}
            </button>
            <button onClick={annulerPaiement} disabled={loading} className="btn-axnnuler">
              ❌ Annuler
            </button>
          </div>
        </div>
      )}

      {step === 'success' && (
        <div className="succxess-step">
          <div className="suxccess-icon">✅</div>
          <h2>Paiement Confirmé !</h2>
          <p>✅ Le statut a été changé de <strong>"validé"</strong> à <strong>"payé"</strong></p>
          
          <div className="succexss-details">
            <div className="detaxxil-card">
              <div className="detxail-header">
                <div className="dextail-icon">👤</div>
                <span>Employé</span>
              </div>
              <div className="detail-xvalue">{employe.prenom} {employe.nom}</div>
            </div>
            
            <div className="detaixl-card">
              <div className="detaxil-header">
                <div className="detxail-icon">💰</div>
                <span>Montant</span>
              </div>
              <div className="detaixl-value amount">{salaireNet.toLocaleString()} Ar</div>
            </div>
            
            <div className="detail-cxard">
              <div className="detail-xheader">
                <div className="detailx-icon">✅</div>
                <span>Nouveau Statut</span>
              </div>
              <div className="detail-vaxlue status-paye">Payé</div>
            </div>
          </div>

          <div className="auto-closxe">
            <div className="countdowxn">
              <div className="countdoxwn-circle">
                <span>{countdown}</span>
              </div>
            </div>
            <p>Fermeture automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}</p>
          </div>

          <button onClick={resetForm} className="btn-primxary">
            Fermer maintenant
          </button>
        </div>
      )}
    </div>
  );
};

export default PaiementMvola;