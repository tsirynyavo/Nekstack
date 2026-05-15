const mongoose = require('mongoose');

const tacheSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  
  // 🎯 ASSIGNATION FLEXIBLE (SANS POSTE)
  assignationType: {
    type: String,
    enum: ['personne', 'departement'], // ← SUPPRIMÉ 'poste'
    required: true
  },
  
  // SI assignationType = "personne"
  employe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employe'
  }, 
  
  // SI assignationType = "departement"  
  departement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Departement'
  },
  
  // SUPPRIMÉ LE CHAMP 'poste'
  
  // POUR TOUS
  priorite: {
    type: String,
    enum: ['haute', 'normale', 'basse', 'urgente'],
    default: 'normale'
  },
  
  dateLimite: {
    type: Date,
    required: true
  },
  
  // 🚦 STATUT - DIRECTEMENT "en_cours" APRÈS CRÉATION
  statut: {
    type: String,
    enum: ['en_cours', 'terminé', 'annulé'],
    default: 'en_cours'
  },
  
  // 📅 DATE DE DÉBUT AUTOMATIQUE
  dateDebut: {
    type: Date,
    default: Date.now
  } ,
   dateFin: {
    type: Date
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Tache', tacheSchema);