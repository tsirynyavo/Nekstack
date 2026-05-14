const mongoose = require('mongoose');

const noteInterneSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true
  },
  contenu: {
    type: String,
    required: true
  },
  departements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Departement'
  }],
  estVisiblePourTous: {
    type: Boolean,
    default: false
  },
  datePublication: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Middleware pour gérer la visibilité
noteInterneSchema.pre('save', function(next) {
  if (!this.departements || this.departements.length === 0) {
    this.estVisiblePourTous = true;
  } else {
    this.estVisiblePourTous = false;
  }
  next();
});

module.exports = mongoose.model('NoteInterne', noteInterneSchema);