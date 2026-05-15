const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  marche: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Marche',
    required: true
  },
  lieu: {           // numéro du lieu (1 à 5)
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  date: {
    type: Date,
    required: true
  },
  quantite: {       // nombre de places réservées (défaut 1)
    type: Number,
    default: 1,
    min: 1
  },
  beneficiaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citoyen',
    default: null
  },
  statut: {
    type: String,
    enum: ['en_attente', 'confirmée', 'annulée'],
    default: 'en_attente'
  },
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);