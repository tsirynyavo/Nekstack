const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const jourFerieSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  description: { type: String }
}, { timestamps: true });

jourFerieSchema.plugin(AutoIncrement, { inc_field: 'jourId' });


module.exports = mongoose.model('JourFerie', jourFerieSchema);
