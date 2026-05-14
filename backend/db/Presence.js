const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const presenceSchema = new mongoose.Schema({
  employe: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employe', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  
  // MATIN (8h-12h = 4h théoriques)
  heureEntreeMatin: { 
    type: String, // ex: "08:30"
    required: false 
  },
  presentMatin: { 
    type: Boolean, 
    default: false 
  },
  retardMatin: { 
    type: Number, 
    default: 4 * 60 // 4h en minutes (240min) par défaut si absent
  }, // en minutes
  
  // APRÈS-MIDI (14h-17h = 3h théoriques)
  heureEntreeSoir: { 
    type: String, // ex: "14:15" 
    required: false 
  },
  presentSoir: { 
    type: Boolean, 
    default: false 
  },
  retardSoir: { 
    type: Number, 
    default: 3 * 60 // 3h en minutes (180min) par défaut si absent
  }, // en minutes
  
  // RETARD TOTAL (calculé automatiquement)
  retardTotal: {
    type: Number,
    default: 7 * 60 // 7h en minutes (420min) par défaut si absent toute la journée
  },
  
  // STATUT GLOBAL (calculé automatiquement)
  statut: {
    type: String,
    enum: ['absent', 'present-matin', 'present-soir', 'present-journee'],
    default: 'absent'
  },
  
  // INFOS COMPLÉMENTAIRES
  notes: { 
    type: String 
  },
  joursFeries: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'JourFerie' 
  }],
  conge: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Conge' 
  }
}, { timestamps: true });

// Middleware pour calculer automatiquement le retard total avant sauvegarde
presenceSchema.pre('save', function(next) {
  // Calcul du retard total
  this.retardTotal = this.retardMatin + this.retardSoir;
  
  // Détermination automatique du statut
  if (this.presentMatin && this.presentSoir) {
    this.statut = 'present-journee';
  } else if (this.presentMatin) {
    this.statut = 'present-matin';
  } else if (this.presentSoir) {
    this.statut = 'present-soir';
  } else {
    this.statut = 'absent';
  }
  
  next();
});

// Méthode pour calculer le retard matin
presenceSchema.methods.calculerRetardMatin = function(heureReelle) {
  const heureTheorique = "08:00"; // Heure de début matin
  return this.calculerRetard(heureTheorique, heureReelle);
};

// Méthode pour calculer le retard après-midi  
presenceSchema.methods.calculerRetardSoir = function(heureReelle) {
  const heureTheorique = "14:00"; // Heure de début après-midi
  return this.calculerRetard(heureTheorique, heureReelle);
};

// Méthode utilitaire pour calculer le retard en minutes
presenceSchema.methods.calculerRetard = function(heureTheorique, heureReelle) {
  if (!heureReelle) return 4 * 60; // Absent = retard max (4h matin, 3h soir)
  
  const [thH, thM] = heureTheorique.split(':').map(Number);
  const [reH, reM] = heureReelle.split(':').map(Number);
  
  const minutesTheoriques = thH * 60 + thM;
  const minutesReelles = reH * 60 + reM;
  
  return Math.max(0, minutesReelles - minutesTheoriques);
};

// Méthode pour pointer le matin
presenceSchema.methods.pointerMatin = function(heureEntree) {
  this.heureEntreeMatin = heureEntree;
  this.presentMatin = true;
  
  if (heureEntree) {
    this.retardMatin = this.calculerRetardMatin(heureEntree);
  } else {
    this.retardMatin = 0; // Présent mais heure non spécifiée
  }
};

// Méthode pour pointer l'après-midi
presenceSchema.methods.pointerSoir = function(heureEntree) {
  this.heureEntreeSoir = heureEntree;
  this.presentSoir = true;
  
  if (heureEntree) {
    this.retardSoir = this.calculerRetardSoir(heureEntree);
  } else {
    this.retardSoir = 0; // Présent mais heure non spécifiée
  }
};

// Auto-increment pour ID de présence
presenceSchema.plugin(AutoIncrement, { inc_field: 'presenceId' });

module.exports = mongoose.model('Presence', presenceSchema);