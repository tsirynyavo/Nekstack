// Dans db/Paiement.js - CORRIGÉ
const mongoose = require('mongoose'); // ⬅️ AJOUT CRITIQUE
const AutoIncrement = require('mongoose-sequence')(mongoose);

const paiementSchema = new mongoose.Schema({
  employe: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employe', 
    required: true 
  },

  // NOUVEAU : Référence au taux utilisé
  tauxId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Taux', 
    required: true 
  },

  // Infos figées de l'employé (snapshot au moment du paiement)
  employeNom: { type: String, required: true },
  employePrenom: { type: String, required: true },
  salaireBase: { type: Number, required: true },
  dateEmbauche: { type: Date, required: true },
  nombreEnfants: { type: Number, default: 0 },
  contrat: { type: String, enum: ['CDI', 'CDD'], required: true },
  dateFinContrat: { type: Date },
  dateSortie: { type: Date },

  // Période de paie
  mois: { type: String, required: true, match: /^\d{4}-\d{2}$/ }, // ex: 2025-01
  dateDu: { type: Date, required: true },
  dateAu: { type: Date, required: true },
datePaiement: { type: Date, default: Date.now }, // ⬅️ AJOUT ICI

  // Cotisations (figées à la génération du paiement)
  tauxCIMR: { type: Number, default: 0 },
  tauxMaladie: { type: Number, default: 0 },
  tauxRetraiteComp: { type: Number, default: 0 },

  // Détails financiers
  primesImposables: [{
    designation: String,
    montant: { type: Number, default: 0 }
  }],
  primesNonImposables: [{
    designation: String,
    montant: { type: Number, default: 0 }
  }],
  deductions: [{
    designation: String,
    montant: { type: Number, default: 0 }
  }],

  // SEULEMENT LES TOTAUX NÉCESSAIRES POUR L'AFFICHAGE
  totalPrimesImposables: { type: Number, default: 0 },
  totalPrimesNonImposables: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },

  irsa: { type: Number, default: 0 },
  salaireNet: { type: Number, required: true },
  
  // Statut simplifié
  statut: { 
    type: String, 
    enum: ['validé', 'payé'], 
    default: 'validé'
  }

}, { timestamps: true });

paiementSchema.plugin(AutoIncrement, { inc_field: 'paiementId' });

// Empêche doublon même employé + mois
paiementSchema.index({ employe: 1, mois: 1 }, { unique: true });

module.exports = mongoose.model('Paiement', paiementSchema);