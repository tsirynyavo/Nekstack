const mongoose = require('mongoose');

const ressourceSchema = new mongoose.Schema({
  nomres: { type: String, required: true },
  typeres: {
    type: String,
    enum: ['eau', 'électricité', 'riz', 'alimentaire', 'kit scolaire', 'médicament', 'coupon', 'autre'],
    required: true
  },
  unite: { type: String, required: true },           // ex: "litres", "kWh", "sacs de 5kg"
  capacitemax: { type: Number, required: true },      // capacité maximale de stock
  quantiteactuelle: { type: Number, required: true }, // quantité disponible actuelle
  id_quartier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quartier',
    required: true
  },
  statut: {
    type: String,
    enum: ['active', 'desactive'],
    default: 'active'
  }
}, { timestamps: true });

// Middleware : empêcher la suppression si des demandes ou allocations existent (anticipation)
ressourceSchema.pre('findOneAndDelete', async function(next) {
  const ressourceId = this.getQuery()["_id"];
  // const Demande = require('./Demande');
  // const count = await Demande.countDocuments({ ressource: ressourceId });
  // if (count > 0) {
  //   return next(new Error("Impossible de supprimer cette ressource car elle est liée à des demandes."));
  // }
  next(); // pour l'instant rien, activer plus tard
});

module.exports = mongoose.model('Ressource', ressourceSchema);