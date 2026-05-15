const mongoose = require('mongoose');

const quartierSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true, 
    unique: true 
  }
}, { timestamps: true });

// Middleware : empêcher la suppression si des ressources sont liées
quartierSchema.pre('findOneAndDelete', async function(next) {
  const quartierId = this.getQuery()["_id"];
  const Ressource = require('./Ressource'); // À adapter quand tu créeras le modèle Ressource
  const count = await Ressource.countDocuments({ quartiers_desservis: quartierId });
  if (count > 0) {
    return next(new Error("Impossible de supprimer ce quartier car il est lié à des ressources."));
  }
  next();
});

// Si tu utilises findByIdAndDelete, le middleware ci-dessus s'applique.
// Pour une suppression directe avec deleteOne, il faudrait un autre middleware.

module.exports = mongoose.model('Quartier', quartierSchema);