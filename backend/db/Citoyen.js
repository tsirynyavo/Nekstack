const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcrypt');

const citoyenSchema = new mongoose.Schema({
  id: { type: Number, unique: true }, // PK auto-incrémenté
  matricule: { type: String, required: true, unique: true },
  prenom: { type: String, required: true },
  nom: { type: String, required: true },
  cin: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String, default: "" },   // ← nouveau champ
  etat: {
    type: String,
    enum: ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve'],
    default: 'Célibataire'
  },
  id_quartier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quartier',
    required: true
  },
  datedesauvergarde: { type: Date, default: Date.now }, // date d’enregistrement
  motdepasse: { type: String, required: true },
  statut: {
    type: String,
    enum: ['actif', 'inactif', 'décédé'],
    default: 'actif'
  }
}, { timestamps: true });

// Plugin auto-incrément sur le champ `id`
citoyenSchema.plugin(AutoIncrement, { inc_field: 'id' });

// Middleware pour supprimer en cascade les demandes/aides liées (plus tard)
citoyenSchema.pre('findOneAndDelete', async function(next) {
  try {
    const citoyenId = this.getQuery()._id;
    // Plus tard : await DemandeAide.deleteMany({ citoyen: citoyenId });
    //            await Aide.deleteMany({ beneficiaire: citoyenId });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Citoyen', citoyenSchema);