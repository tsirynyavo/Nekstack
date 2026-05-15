const mongoose = require('mongoose');

const lieuSchema = new mongoose.Schema({
  numero: { type: Number, required: true, min: 1, max: 5 },
  placesDispo: { type: Number, required: true, min: 0 }
});

const marcheSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  photo: { type: String },                     // ← nouveau champ pour la photo
  lieux: {
    type: [lieuSchema],
    validate: {
      validator: function(arr) {
        return arr.length === 5 && arr.every((l, i) => l.numero === i + 1);
      },
      message: 'Il doit y avoir exactement 5 lieux numérotés de 1 à 5.'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Marche', marcheSchema);