const mongoose = require('mongoose');

const mvolaPaiementSchema = new mongoose.Schema({
  employe: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employe', 
    required: true 
  },
  reference: { type: String, required: true },
  montant: { type: Number, required: true },
  numeroTelephone: { type: String, required: true },
  statut: { 
    type: String, 
    enum: ['en_attente', 'payé', 'annulé'], 
    default: 'en_attente' 
  },
  transactionId: { type: String },
  codeUSSD: { type: String },
  qrCode: { type: String }, // Stocker le QR Code en base64
  datePaiement: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('MvolaPaiement', mvolaPaiementSchema);