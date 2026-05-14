const mongoose = require('mongoose'); // ← il manquait ça

const HistoriqueSchema = new mongoose.Schema({
  employe_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employe', required: true },
  type: { type: String, enum: ['Promotion', 'Changement de poste', 'Congé', 'Avertissement'], required: true },
  description: { type: String },          // détails de l'événement
  date: { type: Date, default: Date.now } // date de l'événement
}, { timestamps: true }); // optionnel mais pratique

module.exports = mongoose.model('Historique', HistoriqueSchema);
