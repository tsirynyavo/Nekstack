const mongoose = require('mongoose');

const aideSchema = new mongoose.Schema({
  ressource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ressource',
    required: true
  },
  quantite: {
    type: Number,
    required: true,
    min: 1
  },
  dateDistribution: {
    type: Date,
    required: true
  },
  // Bénéficiaire : référence au citoyen (null si distribution collective au quartier)
  beneficiaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citoyen',
    default: null
  },
  quartier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quartier',
    required: true
  },
  statut: {
    type: String,
    enum: ['planifiée', 'distribuée', 'annulée'],
    default: 'planifiée'
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Aide', aideSchema);