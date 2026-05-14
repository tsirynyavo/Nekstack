const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/fianarantsoa") // port par défaut
  .then(() => console.log("✅ Connexion à MongoDB réussie sur la base eleve"))
  .catch(err => console.error("❌ Erreur de connexion à MongoDB:", err));

module.exports = mongoose;
