const mongoose = require('mongoose');

const tauxSchema = new mongoose.Schema({
  nom: { 
    type: String, 
    required: true, 
    unique: true 
  },
  tauxAR: {
    type: Number,
    default: 0
  },
  tauxMaladie: {
    type: Number,
    default: 0
  },
  retraiteComp: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Taux', tauxSchema);