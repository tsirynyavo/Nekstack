const express = require('express');
const app = express();
const mongoose = require('./db/config'); // ta connexion
const Citoyen = require('./db/Citoyen');

const Aide = require('./db/Aide');
require('dotenv').config();
const sendEmailConges = require('./db/sendEmail');
const Ressource = require('./db/Ressource');
const Tache = require('./db/Tache');
const cors = require("cors");
const Quartier = require('./db/Quartier'); // chemin vers ton modèle Departement
const Historique = require("./db/Historique"); // chemin vers ton fichier Historique.js
const Taux = require('./db/Taux'); // Ajout du modèle Taux

const bcrypt = require('bcrypt');
const cron = require('node-cron');
const Presence = require('./db/Presence');     
const Paiement = require('./db/Paiement');
// === ROUTES MVOLA === //
const NoteInterne = require('./db/NoteInterne');
const MvolaPaiement = require('./db/MvolaPaiement');
const mvolaService = require('./services/MvolaService');



const User = require('./db/User');         // modèle avec admin
const Utilisateur = require('./db/Utilisateur'); // modèle pour user normal
const multer = require('multer');
// ⭐⭐ AJOUT JWT ⭐⭐
const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin, requireCitoyen, JWT_SECRET } = require('./middleware/auth');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // dossier pour stocker les images
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Middleware pour parser le JSON

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use('/uploads', express.static('uploads'));


mongoose.connect("mongodb://127.0.0.1:27017/fianarantsoa", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB avec succès'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));



app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Ici tu peux valider que seul un super-admin peut créer des admins si besoin
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    
    res.send({ message: "Utilisateur créé avec succès", user: newUser });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// Connexion admin AVEC JWT
app.post("/admin-login", async (req, resp) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return resp.status(400).send({ error: "Email et mot de passe requis" });
        }

        // Vérifie uniquement admin
        const user = await User.findOne({ email, role: 'admin' }).select("+password");

        if (user && user.password === password) {
            // Générer JWT
            const token = jwt.sign(
                { 
                    userId: user._id, 
                    email: user.email, 
                    role: user.role,
                    name: user.name 
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            const userData = user.toJSON(); // password supprimé
            resp.send({ 
                message: "Connexion admin réussie",
                token,
                user: userData
            });
        } else {
            resp.status(403).send({ error: "Accès refusé. Identifiants incorrects." });
        }
    } catch (error) {
        console.error("Erreur admin login:", error);
        resp.status(500).send({ error: "Erreur serveur" });
    }
});

app.post("/citoyens/login", async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const motdepasse = req.body.motdepasse;

  if (!email || !motdepasse) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  try {
    const citoyen = await Citoyen.findOne({ email }).populate("id_quartier", "nom");
    console.log("🔍 [LOGIN] Citoyen trouvé :", citoyen ? citoyen.email : "AUCUN");
    console.log("🔍 [LOGIN] id_quartier après populate :", citoyen?.id_quartier);

    if (!citoyen) return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    if (citoyen.statut !== "actif") return res.status(401).json({ error: "Compte inactif" });

    // Comparaison mot de passe (inclure la migration si en clair)
    const motdepasseStocke = citoyen.motdepasse;
    let isMatch = false;
    if (motdepasseStocke.startsWith('$2a$') || motdepasseStocke.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(motdepasse, motdepasseStocke);
    } else {
      isMatch = (motdepasse === motdepasseStocke);
      if (isMatch) {
        citoyen.motdepasse = await bcrypt.hash(motdepasse, 10);
        await citoyen.save();
      }
    }
    if (!isMatch) return res.status(401).json({ error: "Email ou mot de passe incorrect" });

    // Token
    const token = jwt.sign(
      { userId: citoyen._id, email: citoyen.email, role: 'citoyen', nom: citoyen.nom, prenom: citoyen.prenom, matricule: citoyen.matricule, quartier: citoyen.id_quartier?._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const citoyenData = citoyen.toObject();
    delete citoyenData.motdepasse;

    console.log("✅ [LOGIN] Données renvoyées :", citoyenData);
    res.json({ message: "Connexion réussie", token, citoyen: citoyenData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// Route pour vérifier le token (utile côté frontend)
app.get("/verify-token", authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user,
    message: "Token valide" 
  });
});
// Route test protégée (admin seulement)
app.get("/admin/test", authenticateToken, requireAdmin, (req, res) => {
  res.json({ 
    message: "Accès admin autorisé!",
    user: req.user 
  });
});

app.get('/citoyen/test', authenticateToken, requireCitoyen, (req, res) => {
  res.json({ message: "Accès citoyen OK", user: req.user });
});

























































// ---------- QUARTIERS ----------

// Lire tous les quartiers
app.get("/quartiers", async (req, res) => {
  try {
    const quartiers = await Quartier.find();
    res.json(quartiers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un quartier
app.post("/quartiers", async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ error: "Nom du quartier requis" });

    const exist = await Quartier.findOne({ nom });
    if (exist) return res.status(400).json({ error: "Ce quartier existe déjà" });

    const newQuartier = new Quartier({ nom });
    const savedQuartier = await newQuartier.save();
    res.status(201).json(savedQuartier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lire un quartier par ID
app.get("/quartiers/:id", async (req, res) => {
  try {
    const quartier = await Quartier.findById(req.params.id);
    if (!quartier) return res.status(404).json({ error: "Quartier non trouvé" });
    res.json(quartier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modifier un quartier
app.put("/quartiers/:id", async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ error: "Nom du quartier requis" });

    const updatedQuartier = await Quartier.findByIdAndUpdate(
      req.params.id,
      { nom },
      { new: true, runValidators: true }
    );

    if (!updatedQuartier) return res.status(404).json({ error: "Quartier non trouvé" });

    res.json(updatedQuartier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un quartier
app.delete("/quartiers/:id", async (req, res) => {
  try {
    // findByIdAndDelete déclenche le middleware findOneAndDelete si défini
    const deletedQuartier = await Quartier.findByIdAndDelete(req.params.id);
    if (!deletedQuartier) return res.status(404).json({ error: "Quartier non trouvé" });
    res.json({ message: "Quartier supprimé", deletedQuartier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


























// ---------- RESSOURCES ----------

// GET : liste paginée, filtrable et triable
app.get("/ressources", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const type = req.query.type || "";           // filtre par typeres
    const quartier = req.query.quartier || "";   // filtre par id_quartier
    const statut = req.query.statut || "";       // filtre par statut
    const sortField = req.query.sortField || "nomres";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    let filter = {};

    // Recherche par nom de ressource
    if (search) {
      filter.nomres = { $regex: search, $options: "i" };
    }

    // Filtre par type
    if (type) {
      filter.typeres = type;
    }

    // Filtre par quartier
    if (quartier) {
      filter.id_quartier = quartier;
    }

    // Filtre par statut
    if (statut) {
      filter.statut = statut;
    }

    const total = await Ressource.countDocuments(filter);
    const ressources = await Ressource.find(filter)
      .populate("id_quartier", "nom")   // on ramène le nom du quartier
      .sort({ [sortField]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const pages = Math.ceil(total / limit);

    res.json({
      total,
      page,
      pages,
      ressources
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// GET : toutes les ressources d'un quartier spécifique (actives)
app.get("/ressources/by-quartier/:quartierId", async (req, res) => {
  try {
    const quartierId = req.params.quartierId;
    console.log("🔍 ID quartier reçu :", quartierId);
    // Chercher d'abord sans le filtre "active" pour voir
    const toutes = await Ressource.find({ id_quartier: quartierId }).lean();
    console.log("📦 Toutes les ressources (sans filtre active) :", toutes.length);
    // Maintenant avec le filtre
    const actives = await Ressource.find({ id_quartier: quartierId, statut: "active" }).populate("id_quartier", "nom");
    console.log("✅ Actives :", actives.length);
    res.json(actives);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.get("/ressources/export", async (req, res) => {
  try {
    const { type, quartier, statut } = req.query;
    let filter = {};
    if (type) filter.typeres = type;
    if (quartier) filter.id_quartier = quartier;
    if (statut) filter.statut = statut;

    const ressources = await Ressource.find(filter)
      .populate("id_quartier", "nom")
      .lean();

    const formatted = ressources.map(r => ({
      Nom: r.nomres,
      Type: r.typeres,
      Unité: r.unite,
      "Capacité max": r.capacitemax,
      "Quantité actuelle": r.quantiteactuelle,
      Quartier: r.id_quartier?.nom || "-",
      Statut: r.statut
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET : une ressource par ID
app.get("/ressources/:id", async (req, res) => {
  try {
    const ressource = await Ressource.findById(req.params.id).populate("id_quartier", "nom");
    if (!ressource) return res.status(404).json({ error: "Ressource non trouvée." });
    res.json(ressource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST : ajouter une ressource
app.post("/ressources", async (req, res) => {
  try {
    const { nomres, typeres, unite, capacitemax, quantiteactuelle, id_quartier, statut } = req.body;

    // Validation de base
    if (!nomres || !typeres || !unite || capacitemax == null || quantiteactuelle == null || !id_quartier) {
      return res.status(400).json({ error: "Tous les champs obligatoires sont requis." });
    }

    // Vérifier que le quartier existe
    const quartierExiste = await Quartier.findById(id_quartier);
    if (!quartierExiste) {
      return res.status(400).json({ error: "Le quartier spécifié n'existe pas." });
    }

    const nouvelleRessource = new Ressource({
      nomres,
      typeres,
      unite,
      capacitemax,
      quantiteactuelle,
      id_quartier,
      statut: statut || "active"
    });

    const saved = await nouvelleRessource.save();
    const populated = await Ressource.findById(saved._id).populate("id_quartier", "nom");

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT : modifier une ressource
app.put("/ressources/:id", async (req, res) => {
  try {
    const { nomres, typeres, unite, capacitemax, quantiteactuelle, id_quartier, statut } = req.body;

    // Vérifier l'existence de la ressource
    const ressource = await Ressource.findById(req.params.id);
    if (!ressource) return res.status(404).json({ error: "Ressource non trouvée." });

    // Si on change de quartier, vérifier que le nouveau existe
    if (id_quartier) {
      const quartierExiste = await Quartier.findById(id_quartier);
      if (!quartierExiste) {
        return res.status(400).json({ error: "Le quartier spécifié n'existe pas." });
      }
      ressource.id_quartier = id_quartier;
    }

    if (nomres) ressource.nomres = nomres;
    if (typeres) ressource.typeres = typeres;
    if (unite) ressource.unite = unite;
    if (capacitemax != null) ressource.capacitemax = capacitemax;
    if (quantiteactuelle != null) ressource.quantiteactuelle = quantiteactuelle;
    if (statut) ressource.statut = statut;

    const updated = await ressource.save();
    const populated = await Ressource.findById(updated._id).populate("id_quartier", "nom");

    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE : supprimer une ressource
app.delete("/ressources/:id", async (req, res) => {
  try {
    const deleted = await Ressource.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Ressource non trouvée." });
    res.json({ message: "Ressource supprimée avec succès.", deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});





















// ========== AIDES (version avec citoyen) ==========

// GET : liste paginée, filtrable, triable
app.get("/aides", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const quartier = req.query.quartier || "";
    const ressourceId = req.query.ressource || "";
    const statut = req.query.statut || "";
    const beneficiaireId = req.query.beneficiaire || "";
    const dateDebut = req.query.dateDebut ? new Date(req.query.dateDebut) : null;
    const dateFin = req.query.dateFin ? new Date(req.query.dateFin) : null;
    const sortField = req.query.sortField || "dateDistribution";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    let filter = {};

    // Recherche par nom/prénom du bénéficiaire (si renseigné)
    if (search) {
      // Cherche d'abord les citoyens correspondants
      const citoyens = await Citoyen.find({
        $or: [
          { prenom: { $regex: search, $options: "i" } },
          { nom: { $regex: search, $options: "i" } },
          { matricule: { $regex: search, $options: "i" } }
        ]
      }).select("_id");
      const citoyenIds = citoyens.map(c => c._id);
      // Filtre sur beneficiaire parmi ces IDs, ou description contenant le texte
      filter.$or = [
        { beneficiaire: { $in: citoyenIds } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (quartier) filter.quartier = quartier;
    if (ressourceId) filter.ressource = ressourceId;
    if (statut) filter.statut = statut;
    if (beneficiaireId) filter.beneficiaire = beneficiaireId;

    if (dateDebut || dateFin) {
      filter.dateDistribution = {};
      if (dateDebut) filter.dateDistribution.$gte = dateDebut;
      if (dateFin) filter.dateDistribution.$lte = dateFin;
    }

    const total = await Aide.countDocuments(filter);
    const aides = await Aide.find(filter)
      .populate("ressource", "nomres typeres unite")
      .populate("quartier", "nom")
      .populate("beneficiaire", "matricule prenom nom email")
      .sort({ [sortField]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const pages = Math.ceil(total / limit);

    res.json({
      total,
      page,
      pages,
      aides
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// GET : statistiques des aides (inchangé mais avec populate beneficiaire)
app.get("/aides/statistiques", async (req, res) => {
  try {
    const { quartier, ressource, dateDebut, dateFin } = req.query;
    let filter = {};
    if (quartier) filter.quartier = quartier;
    if (ressource) filter.ressource = ressource;
    if (dateDebut || dateFin) {
      filter.dateDistribution = {};
      if (dateDebut) filter.dateDistribution.$gte = new Date(dateDebut);
      if (dateFin) filter.dateDistribution.$lte = new Date(dateFin);
    }

    const aides = await Aide.find(filter)
      .populate("ressource", "nomres typeres unite")
      .populate("beneficiaire", "matricule prenom nom");

    let stats = {
      totalAides: aides.length,
      aidesPlanifiees: 0,
      aidesDistribuees: 0,
      aidesAnnulees: 0,
      quantiteTotaleDistribuee: 0,
      parTypeRessource: {}
    };

    aides.forEach(aide => {
      if (aide.statut === "planifiée") stats.aidesPlanifiees++;
      else if (aide.statut === "distribuée") {
        stats.aidesDistribuees++;
        stats.quantiteTotaleDistribuee += aide.quantite;
      } else if (aide.statut === "annulée") stats.aidesAnnulees++;

      const type = aide.ressource?.typeres || "inconnu";
      if (!stats.parTypeRessource[type]) {
        stats.parTypeRessource[type] = { count: 0, quantite: 0, unite: aide.ressource?.unite || "" };
      }
      stats.parTypeRessource[type].count++;
      if (aide.statut === "distribuée") {
        stats.parTypeRessource[type].quantite += aide.quantite;
      }
    });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET : rapport détaillé (inchangé)
app.get("/aides/rapport", async (req, res) => {
  try {
    const { dateDebut, dateFin, quartier, page = 1, limit = 10 } = req.query;
    const start = dateDebut ? new Date(dateDebut) : new Date(new Date().getFullYear(), 0, 1);
    const end = dateFin ? new Date(dateFin) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    let filter = { dateDistribution: { $gte: start, $lte: end } };
    if (quartier) filter.quartier = quartier;

    const total = await Aide.countDocuments(filter);
    const aides = await Aide.find(filter)
      .populate("ressource", "nomres typeres unite")
      .populate("quartier", "nom")
      .populate("beneficiaire", "matricule prenom nom")
      .sort({ dateDistribution: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      periode: `${start.toISOString().split('T')[0]} - ${end.toISOString().split('T')[0]}`,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      aides
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST - Demande d'aide par un citoyen connecté
app.post("/citoyens/demandes-aide", authenticateToken, requireCitoyen, async (req, res) => {
  try {
    const { ressource, quantite, dateDistribution, description } = req.body;
    const citoyenId = req.user._id;

    // Récupérer le citoyen et son quartier
    const citoyen = await Citoyen.findById(citoyenId);
    if (!citoyen) return res.status(404).json({ error: "Citoyen introuvable." });

    const quartierId = citoyen.id_quartier;
    if (!quartierId) return res.status(400).json({ error: "Vous n'êtes rattaché à aucun quartier." });

    // Vérifier que la ressource existe et appartient bien au même quartier
    const ressourceDoc = await Ressource.findOne({ _id: ressource, id_quartier: quartierId });
    if (!ressourceDoc) return res.status(400).json({ error: "Ressource invalide pour votre quartier." });

    if (!quantite || quantite < 1) return res.status(400).json({ error: "Quantité invalide." });
    if (!dateDistribution) return res.status(400).json({ error: "Date de distribution requise." });

    const nouvelleAide = new Aide({
      ressource,
      quantite,
      dateDistribution,
      beneficiaire: citoyenId,
      quartier: quartierId,
      statut: "en_attente",
      description: description || ""
    });

    const saved = await nouvelleAide.save();
    const populated = await Aide.findById(saved._id)
      .populate("ressource", "nomres typeres unite")
      .populate("quartier", "nom")
      .populate("beneficiaire", "matricule prenom nom");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Erreur demande aide:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});
// GET - Voir toutes les demandes du citoyen connecté
app.get("/citoyens/mes-demandes", authenticateToken, requireCitoyen, async (req, res) => {
  try {
    const citoyenId = req.user._id;
    const aides = await Aide.find({ beneficiaire: citoyenId })
      .populate("ressource", "nomres typeres unite")
      .populate("quartier", "nom")
      .sort({ createdAt: -1 })
      .lean();
    res.json(aides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});


// GET : une aide par ID
app.get("/aides/:id", async (req, res) => {
  try {
    const aide = await Aide.findById(req.params.id)
      .populate("ressource", "nomres typeres unite")
      .populate("quartier", "nom")
      .populate("beneficiaire", "matricule prenom nom email");
    if (!aide) return res.status(404).json({ error: "Aide non trouvée." });
    res.json(aide);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST : créer une attribution d'aide (par l'admin)
app.post("/aides", async (req, res) => {
  try {
    const { ressource, quantite, dateDistribution, beneficiaire, quartier, statut, description } = req.body;

    if (!ressource || !quantite || !dateDistribution || !quartier) {
      return res.status(400).json({ error: "ressource, quantite, dateDistribution et quartier sont requis." });
    }

    // Vérifier ressource
    const ressourceDoc = await Ressource.findById(ressource);
    if (!ressourceDoc) return res.status(404).json({ error: "Ressource introuvable." });

    // Vérifier quartier
    const quartierDoc = await Quartier.findById(quartier);
    if (!quartierDoc) return res.status(404).json({ error: "Quartier introuvable." });

    // Si beneficiaire est fourni, vérifier qu'il existe et qu'il appartient au quartier (contrôle optionnel)
    if (beneficiaire) {
      const citoyenDoc = await Citoyen.findById(beneficiaire);
      if (!citoyenDoc) return res.status(404).json({ error: "Citoyen introuvable." });
      // Optionnel : vérifier que le citoyen habite bien ce quartier
      if (citoyenDoc.id_quartier.toString() !== quartier) {
        return res.status(400).json({ error: "Le citoyen n'appartient pas à ce quartier." });
      }
    }

    const aideStatut = statut || "planifiée";

    // Si distribution immédiate, déduire du stock
    if (aideStatut === "distribuée") {
      if (ressourceDoc.quantiteactuelle < quantite) {
        return res.status(400).json({ error: `Stock insuffisant. Disponible : ${ressourceDoc.quantiteactuelle} ${ressourceDoc.unite}` });
      }
      ressourceDoc.quantiteactuelle -= quantite;
      await ressourceDoc.save();
    }

    const nouvelleAide = new Aide({
      ressource,
      quantite,
      dateDistribution,
      beneficiaire: beneficiaire || null,
      quartier,
      statut: aideStatut,
      description: description || ""
    });

    const saved = await nouvelleAide.save();
    const populated = await Aide.findById(saved._id)
      .populate("ressource", "nomres typeres unite")
      .populate("quartier", "nom")
      .populate("beneficiaire", "matricule prenom nom email");

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT : modifier une aide
app.put("/aides/:id", async (req, res) => {
  try {
    const aide = await Aide.findById(req.params.id);
    if (!aide) return res.status(404).json({ error: "Aide non trouvée." });

    const ancienStatut = aide.statut;
    const ancienQuantite = aide.quantite;
    const ancienRessourceId = aide.ressource.toString();

    // Mise à jour des champs
    if (req.body.ressource) aide.ressource = req.body.ressource;
    if (req.body.quantite !== undefined) aide.quantite = req.body.quantite;
    if (req.body.dateDistribution) aide.dateDistribution = req.body.dateDistribution;
    if (req.body.beneficiaire !== undefined) {
      // Si on fournit un beneficiaire, vérification
      if (req.body.beneficiaire) {
        const citoyen = await Citoyen.findById(req.body.beneficiaire);
        if (!citoyen) return res.status(404).json({ error: "Citoyen introuvable." });
        // Vérifier le quartier (si modifié aussi ou quartier actuel)
        const quartierCible = req.body.quartier || aide.quartier.toString();
        if (citoyen.id_quartier.toString() !== quartierCible) {
          return res.status(400).json({ error: "Le citoyen n'appartient pas au quartier sélectionné." });
        }
      }
      aide.beneficiaire = req.body.beneficiaire || null;
    }
    if (req.body.quartier) aide.quartier = req.body.quartier;
    if (req.body.statut) aide.statut = req.body.statut;
    if (req.body.description !== undefined) aide.description = req.body.description;

    // Gestion du stock
    const ressourceDoc = await Ressource.findById(aide.ressource);
    if (!ressourceDoc) return res.status(404).json({ error: "Ressource liée introuvable." });

    // Rollback si on change de ressource, il faut restaurer l'ancienne
    if (ancienRessourceId !== aide.ressource.toString()) {
      const ancienRessourceDoc = await Ressource.findById(ancienRessourceId);
      if (ancienRessourceDoc && ancienStatut === "distribuée") {
        ancienRessourceDoc.quantiteactuelle += ancienQuantite;
        await ancienRessourceDoc.save();
      }
      // Appliquer la nouvelle ressource (déduction plus bas)
    }

    // Restaurer l'ancien stock si on passe de distribué à autre chose
    if (ancienStatut === "distribuée" && aide.statut !== "distribuée") {
      ressourceDoc.quantiteactuelle += ancienQuantite;
      await ressourceDoc.save();
    }
    // Déduire le nouveau stock si on passe à distribué
    else if (aide.statut === "distribuée") {
      // Si déjà distribué avant, on a déjà restauré, il faut déduire la nouvelle quantité
      if (ressourceDoc.quantiteactuelle < aide.quantite) {
        // rollback de la restauration si elle vient d'être faite
        if (ancienStatut === "distribuée") ressourceDoc.quantiteactuelle -= ancienQuantite; // annule la restauration
        return res.status(400).json({ error: `Stock insuffisant. Disponible : ${ressourceDoc.quantiteactuelle} ${ressourceDoc.unite}` });
      }
      ressourceDoc.quantiteactuelle -= aide.quantite;
      await ressourceDoc.save();
    }

    const updatedAide = await aide.save();
    const populated = await Aide.findById(updatedAide._id)
      .populate("ressource", "nomres typeres unite")
      .populate("quartier", "nom")
      .populate("beneficiaire", "matricule prenom nom email");

    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE : supprimer une aide et restaurer le stock si distribuée
app.delete("/aides/:id", async (req, res) => {
  try {
    const aide = await Aide.findById(req.params.id);
    if (!aide) return res.status(404).json({ error: "Aide non trouvée." });

    if (aide.statut === "distribuée") {
      const ressourceDoc = await Ressource.findById(aide.ressource);
      if (ressourceDoc) {
        ressourceDoc.quantiteactuelle += aide.quantite;
        await ressourceDoc.save();
      }
    }

    await Aide.findByIdAndDelete(req.params.id);
    res.json({ message: "Aide supprimée avec succès." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});



































































// ========== CITOYENS ==========

// GET : liste paginée, filtrable et triable
app.get("/citoyens", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const quartier = req.query.quartier || "";
    const statut = req.query.statut || "";
    const etat = req.query.etat || "";
    const sortField = req.query.sortField || "nom";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    const filter = {};

    // Recherche multi-champs
    if (search) {
      filter.$or = [
        { matricule: { $regex: search, $options: "i" } },
        { nom: { $regex: search, $options: "i" } },
        { prenom: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (quartier) filter.id_quartier = quartier;
    if (statut) filter.statut = statut;
    if (etat) filter.etat = etat;

    const total = await Citoyen.countDocuments(filter);
    const citoyens = await Citoyen.find(filter)
      .populate("id_quartier", "nom")
      .sort({ [sortField]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      citoyens
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET : export (pour Excel par exemple)
app.get("/citoyens/export", async (req, res) => {
  try {
    const { quartier } = req.query;
    let filter = {};
    if (quartier) filter.id_quartier = quartier;

    const citoyens = await Citoyen.find(filter)
      .populate("id_quartier", "nom")
      .lean();

    const formatted = citoyens.map(c => ({
      ...c,
      quartier_nom: c.id_quartier?.nom || "-"
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// POST : créer un citoyen
app.post("/citoyens", async (req, res) => {
  try {
    const {
      matricule,
      prenom,
      nom,
      cin,
      email,
      etat,
      id_quartier,
      motdepasse,
      statut
    } = req.body;

    // Champs obligatoires (sans motdepasse)
    if (!matricule || !prenom || !nom || !cin || !email || !id_quartier) {
      return res.status(400).json({ error: "Tous les champs obligatoires (sauf mot de passe) sont requis." });
    }

    // Vérifier si le matricule, cin ou email existe déjà
    const existing = await Citoyen.findOne({
      $or: [{ matricule }, { cin }, { email }]
    });
    if (existing) {
      return res.status(400).json({ error: "Matricule, CIN ou email déjà utilisé." });
    }

    // Vérifier que le quartier existe
    const quartierDoc = await Quartier.findById(id_quartier);
    if (!quartierDoc) {
      return res.status(400).json({ error: "Quartier inexistant." });
    }

    // Définir le mot de passe par défaut
    const motdepasseFinal = motdepasse && motdepasse.trim() !== "" ? motdepasse : "0000";
    const hashedPassword = await bcrypt.hash(motdepasseFinal, 10);

    const newCitoyen = new Citoyen({
      matricule,
      prenom,
      nom,
      cin,
      email,
      etat: etat || 'Célibataire',
      id_quartier,
      motdepasse: hashedPassword,
      statut: statut || 'actif'
    });

    const saved = await newCitoyen.save();
    const populated = await Citoyen.findById(saved._id).populate("id_quartier", "nom");

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET : un citoyen par ID
app.get("/citoyens/:id", async (req, res) => {
  try {
    const citoyen = await Citoyen.findById(req.params.id).populate("id_quartier", "nom");
    if (!citoyen) return res.status(404).json({ error: "Citoyen non trouvé." });
    res.json(citoyen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT : modifier un citoyen
app.put("/citoyens/:id", async (req, res) => {
  try {
    const {
      matricule,
      prenom,
      nom,
      cin,
      email,
      etat,
      id_quartier,
      motdepasse,
      statut
    } = req.body;

    const citoyen = await Citoyen.findById(req.params.id);
    if (!citoyen) return res.status(404).json({ error: "Citoyen non trouvé." });

    // Vérifier les champs obligatoires modifiés
    if (matricule) citoyen.matricule = matricule;
    if (prenom) citoyen.prenom = prenom;
    if (nom) citoyen.nom = nom;
    if (cin) citoyen.cin = cin;
    if (email) citoyen.email = email;
    if (etat) citoyen.etat = etat;
    if (id_quartier) {
      const quartierDoc = await Quartier.findById(id_quartier);
      if (!quartierDoc) return res.status(400).json({ error: "Quartier inexistant." });
      citoyen.id_quartier = id_quartier;
    }
    if (motdepasse) {
      const hashed = await bcrypt.hash(motdepasse, 10);
      citoyen.motdepasse = hashed;
    }
    if (statut) citoyen.statut = statut;

    const saved = await citoyen.save();
    const populated = await Citoyen.findById(saved._id).populate("id_quartier", "nom");
    res.json(populated);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: "Matricule, CIN ou email déjà utilisé." });
    }
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE : supprimer un citoyen (avec cascade plus tard)
app.delete("/citoyens/:id", async (req, res) => {
  try {
    const deleted = await Citoyen.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Citoyen non trouvé." });
    res.json({ message: "Citoyen supprimé avec succès." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT : modifier le mot de passe (par le citoyen connecté)
app.put("/citoyens/:id/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const citoyen = await Citoyen.findById(req.params.id);
    if (!citoyen) return res.status(404).json({ error: "Citoyen non trouvé." });

    const isMatch = await bcrypt.compare(currentPassword, citoyen.motdepasse);
    if (!isMatch) return res.status(400).json({ error: "Mot de passe actuel incorrect." });

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 4 caractères." });
    }

    citoyen.motdepasse = await bcrypt.hash(newPassword, 10);
    await citoyen.save();
    res.json({ message: "Mot de passe modifié avec succès." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT : réinitialiser le mot de passe (par l'admin)
app.put("/citoyens/:id/reset-password", async (req, res) => {
  try {
    const citoyen = await Citoyen.findById(req.params.id);
    if (!citoyen) return res.status(404).json({ error: "Citoyen non trouvé." });

    // Mot de passe par défaut : année de la date d'enregistrement (ou 1234)
    const defaultPassword = citoyen.datedesauvergarde
      ? new Date(citoyen.datedesauvergarde).getFullYear().toString()
      : "1234";

    citoyen.motdepasse = await bcrypt.hash(defaultPassword, 10);
    await citoyen.save();
    res.json({ message: "Mot de passe réinitialisé.", password: defaultPassword });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});





















































/*


app.get("/employees", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const search = req.query.search || "";
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    
    // FILTRES EXISTANTS
    const statut = req.query.statut || "";
    const contrat = req.query.contrat || "";
    const sexe = req.query.sexe || "";

    // NOUVEAU FILTRE DÉPARTEMENT
    const departement = req.query.departement || "";

    const sortField = req.query.sortField || "nom";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    // --- Filtre ---
    const filter = {};
    if (search) {
      filter.$or = [
        { matricule: { $regex: search, $options: "i" } },
        { nom: { $regex: search, $options: "i" } },
        { prenom: { $regex: search, $options: "i" } }
      ];
    }

    if (startDate || endDate) {
      filter.dateembauche = {};
      if (startDate) filter.dateembauche.$gte = startDate;
      if (endDate) filter.dateembauche.$lte = endDate;
    }

    // FILTRES EXISTANTS
    if (statut) {
      filter.statut = statut;
    }
    
    if (contrat) {
      filter.contrat = contrat;
    }
    
    if (sexe) {
      filter.sexe = sexe;
    }

    // NOUVEAU FILTRE DÉPARTEMENT
    if (departement) {
      filter.departement_id = departement;
    }

    // --- Récupération de tous les employés filtrés ---
    let employes = await Employe.find(filter)
      .populate("departement_id", "nom")
      .lean();

    // --- Tri global côté Node.js ---
    employes.sort((a, b) => {
      if (sortField === "matricule") {
        // Tri alphanumérique naturel
        const regex = /^(\d+)(.*)$/;
        const aMatch = (a.matricule || "").match(regex) || [0, "0", ""];
        const bMatch = (b.matricule || "").match(regex) || [0, "0", ""];
        const aNum = parseInt(aMatch[1]);
        const bNum = parseInt(bMatch[1]);
        if (aNum !== bNum) return sortOrder * (aNum - bNum);
        return sortOrder * aMatch[2].localeCompare(bMatch[2]);
      } else if (sortField === "departement") {
        // Tri par nom de département
        const aDep = a.departement_id ? a.departement_id.nom : "";
        const bDep = b.departement_id ? b.departement_id.nom : "";
        return sortOrder * aDep.localeCompare(bDep);
      } else {
        const aVal = (a[sortField] || "").toString().toLowerCase();
        const bVal = (b[sortField] || "").toString().toLowerCase();
        return sortOrder * aVal.localeCompare(bVal);
      }
    });

    // --- Pagination après tri ---
    const total = employes.length;
    const pages = Math.ceil(total / limit);
    const paged = employes.slice((page - 1) * limit, page * limit);

    res.json({
      total,
      page,
      pages,
      employes: paged
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});app.get("/employees/export", async (req, res) => {
  try {
    // Récupérer le filtre département si fourni
    const { departement } = req.query;
    
    let filter = {};
    if (departement) {
      filter.departement_id = departement;
    }

    // Récupère les employés avec filtre
    const employes = await Employe.find(filter).populate("departement_id", "nom").lean();

    // Transforme Decimal128 en float et sécurise le populate
    const formatted = employes.map(e => ({
      ...e,
      salaire: e.salaire ? parseFloat(e.salaire.toString()) : 0,
      departement_nom: e.departement_id ? e.departement_id.nom : "-",
      // NOUVEAUX CHAMPS AJOUTÉS À L'EXPORT
      nombreEnfants: e.nombreEnfants || 0,
      dateFinContrat: e.dateFinContrat ? new Date(e.dateFinContrat).toLocaleDateString('fr-FR') : '',
      dateSortie: e.dateSortie ? new Date(e.dateSortie).toLocaleDateString('fr-FR') : ''
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Erreur export employes:", err);
    res.status(500).json({ error: "Erreur serveur lors de l'export" });
  }
});


app.post("/add-employee", upload.single("photo"), async (req, res) => {
  try {
    const {
      matricule,
      prenom,
      nom,
      cin,
      email,
      telephone,
      adresse,
      datenaissance,
      sexe,
      etat,
      poste,
      departement_id,
      dateembauche,
      contrat,
      salaire,
      congetotal,
      congerestant,
      motdepasse,
      role,
      statut,
      // NOUVEAUX CHAMPS
      nombreEnfants,
      dateFinContrat,
      dateSortie
    } = req.body;

    // Vérifier les champs requis (tous sauf photo)
    const requiredFields = {
      matricule,
      prenom,
      nom,
      cin,
      email,
      telephone,
      adresse,
      datenaissance,
      sexe,
      etat,
      poste,
      departement_id,
      dateembauche,
      contrat,
      salaire,
      motdepasse,
      role,
      statut
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || value.toString().trim() === "") {
        return res.status(400).json({ error: `Le champ "${key}" est requis.` });
      }
    }

    // Vérifier si salaire est un nombre valide
    if (isNaN(salaire)) {
      return res.status(400).json({ error: "Le salaire doit être un nombre valide." });
    }

    // Vérifier si salaire est positif
    if (Number(salaire) <= 0) {
      return res.status(400).json({ error: "Le salaire doit être un nombre strictement positif." });
    }

    // NOUVELLE VALIDATION : dateFinContrat requis pour CDD
    if (contrat === 'CDD' && !dateFinContrat) {
      return res.status(400).json({ error: "La date de fin de contrat est requise pour un CDD" });
    }

    // NOUVELLE VALIDATION : dateSortie cohérente avec statut
    const statutsAvecDateSortie = ['démission', 'licenciement', 'retraite'];
    if (dateSortie && !statutsAvecDateSortie.includes(statut)) {
      return res.status(400).json({ error: "La date de sortie ne peut être définie que pour les statuts: démission, licenciement, retraite" });
    }
    
    if (statutsAvecDateSortie.includes(statut) && !dateSortie) {
      return res.status(400).json({ error: "La date de sortie est requise pour ce statut" });
    }

    // Vérifier si le matricule, cin ou email existe déjà
    const existingEmploye = await Employe.findOne({
      $or: [{ matricule }, { cin }, { email }]
    });
    if (existingEmploye) {
      return res.status(400).json({ error: "Matricule, CIN ou email déjà utilisé." });
    }

    // Vérifier si le département existe
    const departementExists = await Departement.findById(departement_id);
    if (!departementExists) {
      return res.status(400).json({ error: "Département inexistant." });
    }

    // ⭐ AJOUT: Générer l'ID en utilisant directement la collection counters
    let nextId;
    
    try {
      // Utiliser la collection MongoDB native
      const db = mongoose.connection.db;
      const countersCollection = db.collection('counters');
      
      // Trouver et incrémenter le compteur pour "id"
      const counter = await countersCollection.findOneAndUpdate(
        { id: "id" },
        { $inc: { seq: 1 } },
        { 
          returnDocument: 'after',
          upsert: true 
        }
      );
      
      nextId = counter.seq;
      console.log(`🆔 ID généré via compteur: ${nextId}`);
      
    } catch (counterError) {
      console.error("Erreur avec le compteur:", counterError);
      // Fallback: trouver le max ID des employés existants
      const lastEmployee = await Employe.findOne().sort({ id: -1 }).select("id");
      nextId = lastEmployee ? lastEmployee.id + 1 : 1;
      console.log(`🆔 ID généré via fallback: ${nextId}`);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // Si un fichier a été uploadé, récupérer le chemin
    const photoPath = req.file ? req.file.path : null;

    const newEmploye = new Employe({
      id: nextId,
      matricule,
      prenom,
      nom,
      cin,
      email,
      telephone,
      adresse,
      datenaissance,
      sexe,
      etat,
      // NOUVEAUX CHAMPS
      nombreEnfants: nombreEnfants || 0,
      photo: photoPath,
      poste,
      departement_id,
      dateembauche,
      contrat,
      // NOUVEAUX CHAMPS
      dateFinContrat: dateFinContrat || null,
      salaire,
      congetotal: congetotal || 0,
      congerestant: congerestant || 0,
      motdepasse: hashedPassword,
      role,
      statut,
      // NOUVEAUX CHAMPS
      dateSortie: dateSortie || null
    });

    const savedEmploye = await newEmploye.save();
    
    console.log(`✅ Employé ajouté: ${prenom} ${nom} (ID: ${nextId})`);
    res.status(201).json(savedEmploye);

  } catch (error) {
    console.error("Erreur lors de l'ajout de l'employé:", error);

    // Gestion spécifique des erreurs de doublon d'ID
    if (error.code === 11000 && error.keyPattern && error.keyPattern.id) {
      console.log("⚠️ Erreur de doublon d'ID, tentative de régénération...");
      
      try {
        // Essayer avec un ID basé sur le timestamp
        const fallbackId = Math.floor(Date.now() / 1000);
        
        const retryEmploye = new Employe({
          id: fallbackId,
          matricule: req.body.matricule,
          prenom: req.body.prenom,
          nom: req.body.nom,
          cin: req.body.cin,
          email: req.body.email,
          telephone: req.body.telephone,
          adresse: req.body.adresse,
          datenaissance: req.body.datenaissance,
          sexe: req.body.sexe,
          etat: req.body.etat,
          nombreEnfants: req.body.nombreEnfants || 0,
          photo: req.file ? req.file.path : null,
          poste: req.body.poste,
          departement_id: req.body.departement_id,
          dateembauche: req.body.dateembauche,
          contrat: req.body.contrat,
          dateFinContrat: req.body.dateFinContrat || null,
          salaire: req.body.salaire,
          congetotal: req.body.congetotal || 0,
          congerestant: req.body.congerestant || 0,
          motdepasse: await bcrypt.hash(req.body.motdepasse, 10),
          role: req.body.role,
          statut: req.body.statut,
          dateSortie: req.body.dateSortie || null
        });
        
        const saved = await retryEmploye.save();
        return res.status(201).json(saved);
      } catch (retryError) {
        console.error("❌ Échec de la tentative:", retryError);
      }
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ error: `Format invalide pour le champ "${error.path}".` });
    }

    res.status(500).json({ error: "Erreur serveur, veuillez réessayer." });
  }
});
// 📁 ENDPOINT RAPPORT ANCIENS EMPLOYÉS
app.get("/employees/rapport-anciens", async (req, res) => {
  try {
    // D'abord, vérifions tous les statuts existants dans la base
    const tousStatuts = await Employe.distinct("statut");
    console.log("📊 Statuts existants dans la base:", tousStatuts);

    // Compter par statut avec les noms exacts
    const employesLicencies = await Employe.countDocuments({ 
      $or: [
        { statut: "licencie" },
        { statut: "licenciement" },
        { statut: "licencié" }
      ]
    });

    const employesDemission = await Employe.countDocuments({ 
      $or: [
        { statut: "demission" },
        { statut: "démission" }
      ]
    });

    const employesRetraite = await Employe.countDocuments({ 
      $or: [
        { statut: "retraite" },
        { statut: "retraité" }
      ]
    });

    // Total anciens employés
    const totalAnciensEmployes = employesLicencies + employesDemission + employesRetraite;

    res.json({
      totalAnciensEmployes,
      licencies: employesLicencies,
      demission: employesDemission,
      retraite: employesRetraite,
      detailsStatuts: tousStatuts // Pour debug
    });

  } catch (err) {
    console.error("Erreur rapport anciens employés:", err);
    res.status(500).json({ error: "Erreur serveur lors du calcul des anciens employés." });
  }
});
// Route pour modifier le mot de passe (par l'employé lui-même)
app.put("/employees/:id/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const employeId = req.params.id;

    // Vérifier si l'employé existe
    const employe = await Employe.findById(employeId);
    if (!employe) {
      return res.status(404).json({ error: "Employé non trouvé" });
    }

    // Vérifier l'ancien mot de passe
    const isPasswordValid = await bcrypt.compare(currentPassword, employe.motdepasse);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Mot de passe actuel incorrect" });
    }

    // Valider le nouveau mot de passe (minimum 4 caractères au lieu de 6)
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 4 caractères" });
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    employe.motdepasse = hashedNewPassword;
    await employe.save();

    res.json({ message: "Mot de passe modifié avec succès" });

  } catch (error) {
    console.error("Erreur modification mot de passe:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour réinitialiser le mot de passe (par l'admin)
app.put("/employees/:id/reset-password", async (req, res) => {
  try {
    const { newPassword } = req.body;
    const employeId = req.params.id;

    // Vérifier si l'employé existe
    const employe = await Employe.findById(employeId);
    if (!employe) {
      return res.status(404).json({ error: "Employé non trouvé" });
    }

    // Valider le nouveau mot de passe (minimum 4 caractères)
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 4 caractères" });
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    employe.motdepasse = hashedNewPassword;
    await employe.save();

    res.json({ 
      message: "Mot de passe réinitialisé avec succès",
      newPassword: newPassword // Optionnel : pour afficher à l'admin
    });

  } catch (error) {
    console.error("Erreur réinitialisation mot de passe:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
app.get("/employees/:id", async (req, res) => {
  try {
    const employe = await Employe.findById(req.params.id).populate('departement_id', 'nom');
    if (!employe) return res.status(404).json({ error: "Employé non trouvé" });
    res.json(employe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/employees/:id", upload.single("photo"), async (req, res) => {
  try {
    const {
      matricule,
      prenom,
      nom,
      cin,
      email,
      telephone,
      adresse,
      datenaissance,
      sexe,
      etat,
      poste,
      departement_id,
      dateembauche,
      contrat,
      salaire,
      congetotal,
      congerestant,
      motdepasse,
      role,
      statut,
      // NOUVEAUX CHAMPS
      nombreEnfants,
      dateFinContrat,
      dateSortie
    } = req.body;

    // Vérifier les champs requis (tous sauf photo et motdepasse)
    const requiredFields = {
      matricule,
      prenom,
      nom,
      cin,
      email,
      telephone,
      adresse,
      datenaissance,
      sexe,
      etat,
      poste,
      departement_id,
      dateembauche,
      contrat,
      salaire,
      role,
      statut
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || value.toString().trim() === "") {
        return res.status(400).json({ error: `Le champ "${key}" est requis.` });
      }
    }

    // Vérifier si salaire est un nombre valide
    if (isNaN(salaire)) {
      return res.status(400).json({ error: "Le salaire doit être un nombre valide." });
    }

    // Vérifier si salaire est positif
    if (Number(salaire) <= 0) {
      return res.status(400).json({ error: "Le salaire doit être un nombre strictement positif." });
    }

    // NOUVELLES VALIDATIONS
    if (contrat === 'CDD' && !dateFinContrat) {
      return res.status(400).json({ error: "La date de fin de contrat est requise pour un CDD" });
    }

    const statutsAvecDateSortie = ['démission', 'licenciement', 'retraite'];
    if (dateSortie && !statutsAvecDateSortie.includes(statut)) {
      return res.status(400).json({ error: "La date de sortie ne peut être définie que pour les statuts: démission, licenciement, retraite" });
    }
    
    if (statutsAvecDateSortie.includes(statut) && !dateSortie) {
      return res.status(400).json({ error: "La date de sortie est requise pour ce statut" });
    }

    // Vérifier si le matricule, cin ou email existe déjà pour un autre employé
    const existingEmploye = await Employe.findOne({
      $or: [{ matricule }, { cin }, { email }],
      _id: { $ne: req.params.id }
    });
    if (existingEmploye) {
      return res.status(400).json({ error: "Matricule, CIN ou email déjà utilisé." });
    }

    // Vérifier si le département existe
    const departementExists = await Departement.findById(departement_id);
    if (!departementExists) {
      return res.status(400).json({ error: "Département inexistant." });
    }

    // Préparer les données à mettre à jour
    const updateData = {
      matricule,
      prenom,
      nom,
      cin,
      email,
      telephone,
      adresse,
      datenaissance,
      sexe,
      etat,
      // NOUVEAUX CHAMPS
      nombreEnfants: nombreEnfants || 0,
      poste,
      departement_id,
      dateembauche,
      contrat,
      // NOUVEAUX CHAMPS
      dateFinContrat: dateFinContrat || null,
      salaire,
      congetotal: congetotal || 0,
      congerestant: congerestant || 0,
      role,
      statut,
      // NOUVEAUX CHAMPS
      dateSortie: dateSortie || null
    };

    // Hasher le mot de passe seulement s'il est fourni
    if (motdepasse) {
      updateData.motdepasse = await bcrypt.hash(motdepasse, 10);
    }

    // Si une nouvelle photo a été uploadée, mettre à jour le chemin
    if (req.file) {
      updateData.photo = req.file.path;
    }

    const updatedEmploye = await Employe.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('departement_id', 'nom');

    if (!updatedEmploye) {
      return res.status(404).json({ error: "Employé non trouvé." });
    }

    res.json(updatedEmploye);

  } catch (error) {
    console.error("Erreur lors de la modification de l'employé:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ error: `Format invalide pour le champ "${error.path}".` });
    }

    res.status(500).json({ error: "Erreur serveur, veuillez réessayer." });
  }
});
app.delete("/employees/:id", async (req, res) => {
  try {
    const deletedEmploye = await Employe.findByIdAndDelete(req.params.id);
    if (!deletedEmploye) return res.status(404).json({ error: "Employé non trouvé" });
    res.json({ message: "Employé supprimé", deletedEmploye });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Route pour réinitialiser au mot de passe par défaut (année de naissance)
app.put("/employees/:id/reset-default-password", async (req, res) => {
  try {
    const employeId = req.params.id;

    // Vérifier si l'employé existe
    const employe = await Employe.findById(employeId);
    if (!employe) {
      return res.status(404).json({ error: "Employé non trouvé" });
    }

    // Récupérer l'année de naissance
    if (!employe.datenaissance) {
      return res.status(400).json({ error: "Date de naissance non définie" });
    }

    const anneeNaissance = new Date(employe.datenaissance).getFullYear().toString();
    const defaultPassword = anneeNaissance;

    // Hasher et sauvegarder le mot de passe par défaut
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    employe.motdepasse = hashedPassword;
    await employe.save();

    res.json({ 
      message: "Mot de passe réinitialisé avec succès",
      newPassword: defaultPassword
    });

  } catch (error) {
    console.error("Erreur réinitialisation mot de passe:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// Récupérer l'historique d'un employé
app.get("/employees/history/:id", async (req, res) => {
  try {
    // Exemple : si tu as une collection "Historique" liée à l'employé
    const history = await Historique.find({ employe_id: req.params.id }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// Ajouter un historique pour un employé
app.post("/employees/history", async (req, res) => {
  try {
    const { employe_id, type, description, date } = req.body;

    // Vérification des champs requis
    if (!employe_id || !type) {
      return res.status(400).json({ error: "Champs requis manquants : employe_id, type" });
    }

    const newHistory = new Historique({
      employe_id,
      type,
      description: description || "",
      date: date || new Date()
    });

    const savedHistory = await newHistory.save();
    res.status(201).json(savedHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});












































app.get("/departements", async (req, res) => {
  try {
    const deps = await Departement.find();
    res.json(deps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/departements", async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ error: "Nom requis" });

    const exist = await Departement.findOne({ nom });
    if (exist) return res.status(400).json({ error: "Département déjà existant" });

    const newDep = new Departement({ nom });
    const savedDep = await newDep.save();
    res.status(201).json(savedDep);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/departements/:id", async (req, res) => {
  try {
    const dep = await Departement.findById(req.params.id);
    if (!dep) return res.status(404).json({ error: "Département non trouvé" });
    res.json(dep);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/departements/:id", async (req, res) => {
  try {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ error: "Nom requis" });

    const updatedDep = await Departement.findByIdAndUpdate(
      req.params.id,
      { nom },
      { new: true, runValidators: true }
    );

    if (!updatedDep) return res.status(404).json({ error: "Département non trouvé" });

    res.json(updatedDep);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});app.delete("/departements/:id", async (req, res) => {
  try {
    const deletedDep = await Departement.findByIdAndDelete(req.params.id);
    if (!deletedDep) return res.status(404).json({ error: "Département non trouvé" });
    res.json({ message: "Département supprimé", deletedDep });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





























// Lister tous les jours fériés - FORMAT UNIFIÉ
app.get('/jours-feries', async (req, res) => {
  try {
    const { page = 1, limit = 1000, search = '' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (search) {
      filter.nom = { $regex: search, $options: 'i' };
    }

    const totalJours = await JourFerie.countDocuments(filter);
    const jours = await JourFerie.find(filter)
      .sort({ dateDebut: 1 })
      .skip(skip)
      .limit(limitNum);

    // ⭐ TOUJOURS retourner le même format d'objet
    res.json({
      jours,           // Le tableau des jours fériés
      totalJours,      // Nombre total
      page: pageNum,   // Page actuelle
      pages: Math.ceil(totalJours / limitNum), // Nombre total de pages
      total: totalJours
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// Ajouter un jour férié
app.post('/jours-feries/add', async (req, res) => {
  try {
    const { nom, dateDebut, dateFin, description } = req.body;
    if (!nom || !dateDebut || !dateFin) {
      return res.status(400).json({ error: "Nom, dateDebut et dateFin sont requis." });
    }

    const newJour = new JourFerie({ nom, dateDebut, dateFin, description });
    const savedJour = await newJour.save();
    res.status(201).json(savedJour);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});



// Obtenir un jour férié par ID
app.get('/jours-feries/:id', async (req, res) => {
  try {
    const jour = await JourFerie.findById(req.params.id);
    if (!jour) return res.status(404).json({ error: "Jour férié non trouvé" });
    res.json(jour);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Modifier un jour férié
app.put('/jours-feries/edit/:id', async (req, res) => {
  try {
    const jour = await JourFerie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!jour) return res.status(404).json({ error: "Jour férié non trouvé" });
    res.json(jour);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Supprimer un jour férié
app.delete('/jours-feries/delete/:id', async (req, res) => {
  try {
    const jour = await JourFerie.findByIdAndDelete(req.params.id);
    if (!jour) return res.status(404).json({ error: "Jour férié non trouvé" });
    res.json({ message: "Jour férié supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});


















































































































/*




// Fonction pour calculer le retard pour une demi-journée (à ajouter)
function calculerRetardDemiJournee(heureEntreeReelle, heureTheorique) {
  if (!heureEntreeReelle) {
    return heureTheorique === "08:00" ? 4 * 60 : 3 * 60;
  }
  
  const entreeMinutes = convertirEnMinutes(heureEntreeReelle);
  const theoriqueMinutes = convertirEnMinutes(heureTheorique);
  
  return Math.max(0, entreeMinutes - theoriqueMinutes);
}

// Fonction pour convertir HH:MM en minutes (à ajouter)
function convertirEnMinutes(heure) {
  if (!heure) return null;
  const [heures, minutes] = heure.split(':').map(Number);
  return heures * 60 + minutes;
}

// POST : pointer une présence (matin ou soir)
app.post("/presences/add-presence", async (req, res) => {
  try {
    const { employeId, date, typePointage, heureEntree, notes } = req.body;

    console.log('Données reçues:', { employeId, date, typePointage, heureEntree });

    if (!employeId || !date || !typePointage) {
      return res.status(400).json({ 
        error: "employeId, date et typePointage sont requis." 
      });
    }

    if (typePointage !== 'matin' && typePointage !== 'soir' && typePointage !== 'absent') {
      return res.status(400).json({ 
         error: "typePointage doit être 'matin', 'soir' ou 'absent'."
      });
    }
    const employe = await Employe.findById(employeId);
    if (!employe) return res.status(404).json({ error: "Employé non trouvé." });

    // Normaliser la date
    const jour = new Date(date);
    const jourStart = new Date(jour);
    jourStart.setHours(0, 0, 0, 0);
    const jourEnd = new Date(jour);
    jourEnd.setHours(23, 59, 59, 999);

    // Vérifier si c'est un weekend
    const dayOfWeek = jour.getDay(); // 0 = dimanche, 6 = samedi
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.status(400).json({ error: "Impossible de pointer pendant le weekend." });
    }

    // Vérifier les jours fériés
    const joursFeries = await JourFerie.find({
      dateDebut: { $lte: jourEnd },
      dateFin: { $gte: jourStart }
    });
    if (joursFeries.length > 0) {
      return res.status(400).json({ error: "Impossible de pointer, jour férié." });
    }

    // Vérifier les congés
    const conges = await Conge.find({
      employe: employe._id,
      statut: { $in: ["accepté"] },
      dateDebut: { $lte: jourEnd },
      dateFin: { $gte: jourStart }
    });
    if (conges.length > 0) {
      return res.status(400).json({ error: "Impossible de pointer, l'employé est en congé." });
    }

    // Chercher si une présence existe déjà pour cette date
    let presence = await Presence.findOne({
      employe: employe._id,
      date: { $gte: jourStart, $lte: jourEnd }
    });

    if (presence) {
      // Mettre à jour la présence existante
      if (typePointage === 'matin') {
        presence.heureEntreeMatin = heureEntree;
        presence.presentMatin = true;
        presence.retardMatin = calculerRetardDemiJournee(heureEntree, "08:00");
      } else if (typePointage === 'soir') {
        presence.heureEntreeSoir = heureEntree;
        presence.presentSoir = true;
        presence.retardSoir = calculerRetardDemiJournee(heureEntree, "14:00");
      } else if (typePointage === 'absent') {
        // NOUVEAU : Marquer absent toute la journée
        presence.presentMatin = false;
        presence.presentSoir = false;
        presence.heureEntreeMatin = null;
        presence.heureEntreeSoir = null;
        presence.retardMatin = 4 * 60; // 4h de retard
        presence.retardSoir = 3 * 60; // 3h de retard
      }
    }else {
      // Créer une nouvelle présence
      const basePresence = {
        employe: employe._id,
        date: jour,
        notes: notes || null,
        joursFeries: joursFeries.map(jf => jf._id),
        presentMatin: typePointage === 'matin',
        presentSoir: typePointage === 'soir'
      };

      // AJOUTER le cas 'absent'
      if (typePointage === 'matin') {
        basePresence.heureEntreeMatin = heureEntree;
        basePresence.retardMatin = calculerRetardDemiJournee(heureEntree, "08:00");
        basePresence.retardSoir = 3 * 60;
      } else if (typePointage === 'soir') {
        basePresence.heureEntreeSoir = heureEntree;
        basePresence.retardSoir = calculerRetardDemiJournee(heureEntree, "14:00");
        basePresence.retardMatin = 4 * 60;
      } else if (typePointage === 'absent') {
        // NOUVEAU : Absent toute la journée
        basePresence.presentMatin = false;
        basePresence.presentSoir = false;
        basePresence.retardMatin = 4 * 60;
        basePresence.retardSoir = 3 * 60;
      }

      presence = new Presence(basePresence);
    }


    const savedPresence = await presence.save();

    const savedPresencePopulated = await Presence.findById(savedPresence._id)
      .populate('employe', 'matricule prenom nom poste departement_id');

    res.status(201).json(savedPresencePopulated);

  } catch (err) {
    console.error('Erreur détaillée:', err);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});// GET : récupérer les présences
app.get("/presences", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const departement = req.query.departement || ""; // ⭐ NOUVEAU: Filtre par département
    const sortField = req.query.sortField || "date";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    // Filtre pour recherche par employé
    let filter = {};

    if (search) {
      const employes = await Employe.find({
        $or: [
          { prenom: { $regex: search, $options: "i" } },
          { nom: { $regex: search, $options: "i" } },
          { matricule: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      const employeIds = employes.map(e => e._id);
      filter.employe = { $in: employeIds };
    }

    // ⭐ NOUVEAU: Filtre par département
    if (departement) {
      const employesDepartement = await Employe.find({
        departement_id: departement
      }).select("_id");

      const employeIds = employesDepartement.map(e => e._id);
      
      if (filter.employe) {
        // Combiner avec la recherche existante
        filter.employe.$in = filter.employe.$in.filter(id => 
          employeIds.includes(id.toString())
        );
      } else {
        filter.employe = { $in: employeIds };
      }
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    // Récupération des présences avec pagination MongoDB
    const total = await Presence.countDocuments(filter);
    
    let presences = await Presence.find(filter)
      .populate({
        path: "employe",
        select: "matricule prenom nom poste departement_id",
        populate: {
          path: "departement_id",
          select: "nom"
        }
      })
      .sort({ [sortField]: sortOrder })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Transformer les données pour le nouveau format
    presences = presences.map(presence => {
      // Calculer le statut basé sur presentMatin et presentSoir
      let statut = 'absent';
      if (presence.presentMatin && presence.presentSoir) {
        statut = 'present-journee';
      } else if (presence.presentMatin) {
        statut = 'present-matin';
      } else if (presence.presentSoir) {
        statut = 'present-soir';
      }

      // Calculer le retard total
      const retardTotal = (presence.retardMatin || 0) + (presence.retardSoir || 0);

      return {
        ...presence,
        statut,
        retardTotal,
        // Compatibilité avec l'ancien format (si nécessaire)
        heureEntree: presence.heureEntreeMatin || '',
        heureSortie: presence.heureEntreeSoir || ''
      };
    });

    // Tri côté Node.js (maintenant sur les données paginées)
    presences.sort((a, b) => {
      if (!a[sortField] || !b[sortField]) return 0;
      
      let valA = a[sortField];
      let valB = b[sortField];
      
      // Pour le tri par statut (ordre logique)
      if (sortField === 'statut') {
        const ordreStatut = { 'absent': 0, 'present-matin': 1, 'present-soir': 2, 'present-journee': 3 };
        valA = ordreStatut[valA] || 0;
        valB = ordreStatut[valB] || 0;
      }
      
      // Pour le tri par retardTotal
      if (sortField === 'retardTotal') {
        valA = valA || 0;
        valB = valB || 0;
      }
      
      // Pour le tri par département
      if (sortField === 'departement') {
        valA = a.employe?.departement_id?.nom || '';
        valB = b.employe?.departement_id?.nom || '';
      }
      
      if (valA < valB) return -1 * sortOrder;
      if (valA > valB) return 1 * sortOrder;
      return 0;
    });

    const pages = Math.ceil(total / limit);

    res.json({
      total,
      page,
      pages,
      presences
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// GET : toutes les présences d'un employé
app.get("/presences/all-by-employee/:employeId", async (req, res) => {
  try {
    const { employeId } = req.params;
    const { startDate, endDate } = req.query;

    let filter = { employe: employeId };

    // Filtrage par période si fourni
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const presences = await Presence.find(filter)
      .populate("employe", "matricule prenom nom poste departement_id")
      .sort({ date: -1 })
      .lean();

    // Transformer les données pour inclure le statut et retard total
    const presencesAvecStatut = presences.map(presence => {
      let statut = 'absent';
      if (presence.presentMatin && presence.presentSoir) {
        statut = 'present-journee';
      } else if (presence.presentMatin) {
        statut = 'present-matin';
      } else if (presence.presentSoir) {
        statut = 'present-soir';
      }

      const retardTotal = (presence.retardMatin || 0) + (presence.retardSoir || 0);

      return {
        ...presence,
        statut,
        retardTotal,
        // Pour compatibilité avec l'existant
        heureEntree: presence.heureEntreeMatin || '',
        heureSortie: presence.heureEntreeSoir || ''
      };
    });

    res.json(presencesAvecStatut);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});// GET : statistiques des présences (version corrigée avec joursAvecRetard)
app.get("/presences/statistiques/:employeId", async (req, res) => {
  try {
    const { employeId } = req.params;
    const { startDate, endDate } = req.query;

    // Validation de l'ID employé
    if (!mongoose.Types.ObjectId.isValid(employeId)) {
      return res.status(400).json({ error: "ID employé invalide" });
    }

    let filter = { employe: employeId };
    
    // Filtrage par date
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ error: "Date de début invalide" });
        }
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ error: "Date de fin invalide" });
        }
        filter.date.$lte = end;
      }
    }

    const presences = await Presence.find(filter).sort({ date: 1 });

    // Vérifier si l'employé existe
    const employe = await Employe.findById(employeId);
    if (!employe) {
      return res.status(404).json({ error: "Employé non trouvé" });
    }

    let stats = {
      totalJours: 0,
      presentsMatin: 0,
      presentsSoir: 0,
      presentsJournee: 0,
      absents: 0,
      totalRetardMinutes: 0,
      moyenneRetardParJour: 0,
      joursAvecRetard: 0,
      pourcentageJoursRetard: 0,
      parJour: []
    };

    // Grouper par jour pour éviter les doublons
    const joursUniques = new Set();
    const presencesParJour = {};
    
    presences.forEach(presence => {
      const dateStr = new Date(presence.date).toISOString().split('T')[0];
      
      // Compter chaque jour une seule fois
      if (!joursUniques.has(dateStr)) {
        joursUniques.add(dateStr);
        stats.totalJours++;
      }

      // Calcul des retards
      const retardJour = (presence.retardMatin || 0) + (presence.retardSoir || 0);
      stats.totalRetardMinutes += retardJour;

      // Jours avec retard
      if ((presence.retardMatin > 0) || (presence.retardSoir > 0)) {
        stats.joursAvecRetard++;
      }

      // Types de présence
      if (presence.presentMatin && presence.presentSoir) {
        stats.presentsJournee++;
      } else if (presence.presentMatin) {
        stats.presentsMatin++;
      } else if (presence.presentSoir) {
        stats.presentsSoir++;
      } else {
        stats.absents++;
      }

      // Données pour graphique par jour
      if (!presencesParJour[dateStr]) {
        presencesParJour[dateStr] = { 
          present: 0, 
          absent: 0,
          date: dateStr
        };
      }
      
      if (presence.presentMatin || presence.presentSoir) {
        presencesParJour[dateStr].present = 1; // Marquer comme présent ce jour
      } else {
        presencesParJour[dateStr].absent = 1; // Marquer comme absent ce jour
      }
    });

    // Convertir pour le graphique
    stats.parJour = Object.keys(presencesParJour)
      .sort()
      .slice(-30) // Limiter aux 30 derniers jours pour la lisibilité
      .map(date => ({
        date: new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        present: presencesParJour[date].present,
        absent: presencesParJour[date].absent
      }));

    // Calculs finaux
    if (stats.totalJours > 0) {
      stats.moyenneRetardParJour = stats.totalRetardMinutes / stats.totalJours;
      stats.pourcentageJoursRetard = (stats.joursAvecRetard / stats.totalJours) * 100;
    }

    res.json(stats);
  } catch (err) {
    console.error("Erreur statistiques présence:", err);
    res.status(500).json({ error: "Erreur serveur lors du calcul des statistiques" });
  }
});
app.get("/presences/rapport-heures", async (req, res) => {
  try {
    const { startDate, endDate, employeId, departement, page = 1, limit = 10 } = req.query;

    // Validation des dates
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Les dates de début et de fin sont requises." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Dates invalides." });
    }

    // 🟢 Filtre employés
    const employeFilter = {};
    if (departement) {
      employeFilter.departement_id = departement;
    }
    if (employeId && mongoose.Types.ObjectId.isValid(employeId)) {
      employeFilter._id = employeId;
    }

    // 🟢 Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Récupérer les employés avec FILTRE et PAGINATION
    const totalEmployes = await Employe.countDocuments(employeFilter);
    
    const employes = await Employe.find(employeFilter)
      .select("matricule prenom nom poste departement_id")
      .populate("departement_id", "nom") // 🟢 POPULATE ICI
      .skip(skip)
      .limit(limitNum);

    const employeIds = employes.map(e => e._id);

    // Filtre pour les présences
    let filter = {
      date: { $gte: start, $lte: end }
    };

    if (employeIds.length > 0) {
      filter.employe = { $in: employeIds };
    } else {
      return res.json({
        periode: `${startDate} - ${endDate}`,
        totalEmployes: 0,
        page: pageNum,
        pages: 0,
        rapport: []
      });
    }

    // 🟢 CORRECTION: Récupérer les présences SANS populate sur employe
    const presences = await Presence.find(filter)
      .populate("employe", "matricule prenom nom poste") // ⭐ RETIRER departement_id ICI
      .sort({ date: 1 })
      .lean();

    // Grouper par employé et calculer les heures travaillées
    const rapportParEmploye = {};

    // 🟢 CORRECTION: Utiliser les employes déjà peuplés au lieu de ceux des présences
    employes.forEach(employe => {
      rapportParEmploye[employe._id.toString()] = {
        employe: employe, // ⭐ ICI on utilise l'employé déjà peuplé
        totalHeures: 0,
        joursTravailles: 0,
        details: []
      };
    });

    presences.forEach(presence => {
      const employeId = presence.employe._id.toString();
      
      if (!rapportParEmploye[employeId]) {
        // Si l'employé n'est pas dans la liste paginée (cas rare), utiliser celui de la présence
        rapportParEmploye[employeId] = {
          employe: presence.employe,
          totalHeures: 0,
          joursTravailles: 0,
          details: []
        };
      }

      // Calculer les heures travaillées pour cette journée
      let heuresJour = 0;
      
      if (presence.presentMatin && presence.presentSoir) {
        heuresJour = 7; // Journée complète
      } else if (presence.presentMatin) {
        heuresJour = 3.5; // Demi-journée matin
      } else if (presence.presentSoir) {
        heuresJour = 3.5; // Demi-journée soir
      }

      rapportParEmploye[employeId].totalHeures += heuresJour;
      rapportParEmploye[employeId].joursTravailles++;
      
      // Ajouter le détail
      rapportParEmploye[employeId].details.push({
        date: presence.date,
        presentMatin: presence.presentMatin,
        presentSoir: presence.presentSoir,
        heureEntreeMatin: presence.heureEntreeMatin,
        heureEntreeSoir: presence.heureEntreeSoir,
        heuresJour: heuresJour
      });
    });

    // Convertir en tableau (maintenir l'ordre des employés paginés)
    const rapport = employes.map(employe => {
      const data = rapportParEmploye[employe._id.toString()] || {
        employe: employe,
        totalHeures: 0,
        joursTravailles: 0,
        details: []
      };
      
      return {
        ...data,
        totalHeures: parseFloat(data.totalHeures.toFixed(2))
      };
    });

    res.json({
      periode: `${startDate} - ${endDate}`,
      totalEmployes: totalEmployes,
      page: pageNum,
      pages: Math.ceil(totalEmployes / limitNum),
      rapport: rapport
    });

  } catch (err) {
    console.error("Erreur rapport heures:", err);
    res.status(500).json({ error: "Erreur serveur lors de la génération du rapport." });
  }
});
// 📁 NOUVEL ENDPOINT - Évolution des présences par jour (30 derniers jours)
app.get("/presences/evolution-quotidienne", async (req, res) => {
  try {
    // Calculer la date de début (30 jours avant aujourd'hui)
    const aujourdhui = new Date();
    const dateDebut = new Date(aujourdhui);
    dateDebut.setDate(aujourdhui.getDate() - 30);
    dateDebut.setHours(0, 0, 0, 0);

    // Récupérer toutes les présences des 30 derniers jours
    const presences = await Presence.find({
      date: { 
        $gte: dateDebut,
        $lte: aujourdhui
      }
    });

    // Grouper par date et compter les présences
    const presencesParDate = {};
    
    presences.forEach(presence => {
      const dateStr = presence.date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      if (!presencesParDate[dateStr]) {
        presencesParDate[dateStr] = {
          date: dateStr,
          présences: 0,
          absents: 0
        };
      }

      // Compter comme présent si au moins une demi-journée pointée
      if (presence.presentMatin || presence.presentSoir) {
        presencesParDate[dateStr].présences++;
      } else {
        presencesParDate[dateStr].absents++;
      }
    });

    // Convertir en tableau et formater pour le graphique
    const evolutionPresences = Object.values(presencesParDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date)) // Trier par date
      .map(item => ({
        date: new Date(item.date).toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'short' 
        }),
        présences: item.présences,
        absents: item.absents
      }));

    res.json({
      periode: "30 derniers jours",
      evolutionPresences
    });

  } catch (err) {
    console.error("Erreur évolution présences:", err);
    res.status(500).json({ error: "Erreur serveur lors du calcul de l'évolution des présences." });
  }
});
app.get("/presences/:id", async (req, res) => {
  try {
    const presence = await Presence.findById(req.params.id)
      .populate("employe", "matricule prenom nom poste departement_id");
    
    if (!presence) return res.status(404).json({ error: "Présence non trouvée." });

    // Ajouter le statut calculé et retard total
    const presenceAvecStatut = {
      ...presence._doc,
      statut: presence.statut, // Déjà calculé par le middleware
      retardTotal: (presence.retardMatin || 0) + (presence.retardSoir || 0)
    };

    res.status(200).json(presenceAvecStatut);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT : mettre à jour une présence (pour admin/modification manuelle)
app.put("/presences/:id", async (req, res) => {
  try {
    const { 
      date, 
      heureEntreeMatin, 
      heureEntreeSoir, 
      presentMatin, 
      presentSoir, 
      notes 
    } = req.body;

    const presence = await Presence.findById(req.params.id).populate('employe');
    if (!presence) return res.status(404).json({ error: "Présence non trouvée." });

    const employe = presence.employe;
    
    // Utiliser la date existante ou la nouvelle date
    const jour = date ? new Date(date) : presence.date;
    const jourStart = new Date(jour);
    jourStart.setHours(0, 0, 0, 0);
    const jourEnd = new Date(jour);
    jourEnd.setHours(23, 59, 59, 999);

    // Vérifier si c'est un weekend
    const dayOfWeek = jour.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.status(400).json({ error: "Impossible de mettre à jour une présence pendant le weekend." });
    }

    // Vérifier jours fériés
    const joursFeries = await JourFerie.find({
      dateDebut: { $lte: jourEnd },
      dateFin: { $gte: jourStart }
    });
    if (joursFeries.length > 0) {
      return res.status(400).json({ error: "Impossible de mettre à jour la présence, jour férié." });
    }

    // Vérifier congés (SEULEMENT acceptés)
    const conges = await Conge.find({
      employe: employe._id,
      statut: "accepté",
      dateDebut: { $lte: jourEnd },
      dateFin: { $gte: jourStart }
    });
    if (conges.length > 0) {
      return res.status(400).json({ error: "Impossible de mettre à jour la présence, l'employé est en congé." });
    }

    // Mettre à jour les champs de base
    if (date) presence.date = jour;
    if (notes !== undefined) presence.notes = notes;

    // Mettre à jour le pointage matin
    if (heureEntreeMatin !== undefined) {
      presence.heureEntreeMatin = heureEntreeMatin;
    }
    if (presentMatin !== undefined) {
      presence.presentMatin = presentMatin;
      // Si on désactive presentMatin, réinitialiser l'heure et le retard
      if (!presentMatin) {
        presence.heureEntreeMatin = null;
        presence.retardMatin = 4 * 60; // Retard max si absent
      } else if (heureEntreeMatin) {
        presence.retardMatin = calculerRetardDemiJournee(heureEntreeMatin, "08:00");
      }
    }

    // Mettre à jour le pointage soir
    if (heureEntreeSoir !== undefined) {
      presence.heureEntreeSoir = heureEntreeSoir;
    }
    if (presentSoir !== undefined) {
      presence.presentSoir = presentSoir;
      // Si on désactive presentSoir, réinitialiser l'heure et le retard
      if (!presentSoir) {
        presence.heureEntreeSoir = null;
        presence.retardSoir = 3 * 60; // Retard max si absent
      } else if (heureEntreeSoir) {
        presence.retardSoir = calculerRetardDemiJournee(heureEntreeSoir, "14:00");
      }
    }

    // Recalculer les retards si les heures ont changé
    if (heureEntreeMatin !== undefined && presence.presentMatin) {
      presence.retardMatin = calculerRetardDemiJournee(heureEntreeMatin, "08:00");
    }
    if (heureEntreeSoir !== undefined && presence.presentSoir) {
      presence.retardSoir = calculerRetardDemiJournee(heureEntreeSoir, "14:00");
    }

    presence.joursFeries = joursFeries.map(jf => jf._id);

    const updatedPresence = await presence.save();

    const updatedPresencePopulated = await Presence.findById(updatedPresence._id)
      .populate("employe", "matricule prenom nom poste departement_id");

    res.status(200).json(updatedPresencePopulated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});

// DELETE une présence
app.delete("/presences/:id", async (req, res) => {
  try {
    const presence = await Presence.findById(req.params.id);
    if (!presence) return res.status(404).json({ error: "Présence non trouvée." });

    // Vérifier si le jour est un jour férié
    const joursFeries = await JourFerie.find({
      dateDebut: { $lte: presence.date },
      dateFin: { $gte: presence.date }
    });
    if (joursFeries.length > 0) {
      return res.status(400).json({ error: "Impossible de supprimer la présence, jour férié." });
    }

    // Vérifier si l'employé était en congé
    const conges = await Conge.find({
      employe: presence.employe,
      statut: { $in: ["en_attente", "accepté"] },
      dateDebut: { $lte: presence.date },
      dateFin: { $gte: presence.date }
    });
    if (conges.length > 0) {
      return res.status(400).json({ error: "Impossible de supprimer la présence, l'employé est en congé." });
    }

    await Presence.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Présence supprimée avec succès." });

  } catch (err) {
    console.error('Erreur suppression présence:', err);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});































// GET - Liste tous les taux
app.get("/taux", async (req, res) => {
  try {
    const tousTaux = await Taux.find().sort({ nom: 1 });
    res.json(tousTaux);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Un taux par ID
app.get("/taux/:id", async (req, res) => {
  try {
    const taux = await Taux.findById(req.params.id);
    if (!taux) return res.status(404).json({ error: "Taux non trouvé" });
    res.json(taux);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer un nouveau taux
app.post("/taux", async (req, res) => {
  try {
    const { nom, tauxAR, tauxMaladie, retraiteComp } = req.body;
    
    if (!nom) return res.status(400).json({ error: "Nom requis" });

    // Vérifier si nom existe déjà
    const existe = await Taux.findOne({ nom });
    if (existe) return res.status(400).json({ error: "Ce nom existe déjà" });

    const nouveauTaux = new Taux({
      nom,
      tauxAR: tauxAR || 0,
      tauxMaladie: tauxMaladie || 0,
      retraiteComp: retraiteComp || 0
    });

    const tauxSauvegarde = await nouveauTaux.save();
    res.status(201).json(tauxSauvegarde);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Modifier un taux
app.put("/taux/:id", async (req, res) => {
  try {
    const { nom, tauxAR, tauxMaladie, retraiteComp } = req.body;
    
    if (!nom) return res.status(400).json({ error: "Nom requis" });

    // Vérifier si un autre taux a le même nom
    const existe = await Taux.findOne({ 
      nom, 
      _id: { $ne: req.params.id } 
    });
    if (existe) return res.status(400).json({ error: "Ce nom existe déjà" });

    const tauxModifie = await Taux.findByIdAndUpdate(
      req.params.id,
      {
        nom,
        tauxAR: tauxAR || 0,
        tauxMaladie: tauxMaladie || 0,
        retraiteComp: retraiteComp || 0
      },
      { new: true, runValidators: true }
    );

    if (!tauxModifie) return res.status(404).json({ error: "Taux non trouvé" });

    res.json(tauxModifie);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Supprimer un taux
app.delete("/taux/:id", async (req, res) => {
  try {
    const tauxSupprime = await Taux.findByIdAndDelete(req.params.id);
    
    if (!tauxSupprime) return res.status(404).json({ error: "Taux non trouvé" });
    
    res.json({ 
      message: "Taux supprimé", 
      tauxSupprime 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


































// --- Fonction de calcul IRSA ---
function calculerIRSA(revenuImposable, nombreEnfants) {
  const bareme = [
    { limite: 350000, taux: 0.00 },
    { limite: 400000, taux: 0.05 },
    { limite: 500000, taux: 0.10 },
    { limite: 600000, taux: 0.15 },
    { limite: Infinity, taux: 0.20 }
  ];

  const MINIMUM_PERCEPTION = 3000;
  const DEDUCTION_PAR_ENFANT = 2000;

  let irsa = 0;
  let revenuRestant = revenuImposable;
  let limitePrecedente = 0;

  for (const tranche of bareme) {
    if (revenuRestant <= 0) break;
    const montantTranche = Math.min(revenuRestant, tranche.limite - limitePrecedente);
    irsa += montantTranche * tranche.taux;
    limitePrecedente = tranche.limite;
    revenuRestant -= montantTranche;
  }

  const deductionTotale = nombreEnfants * DEDUCTION_PAR_ENFANT;
  let irsaApresDeduction = Math.max(0, irsa - deductionTotale);

  const irsaFinal = Math.max(irsaApresDeduction, MINIMUM_PERCEPTION);

  return irsaFinal;
}
// --- POST : Créer un paiement --- CORRIGÉ
app.post("/paiements", async (req, res) => {
  try {
    const { 
      employeId, 
      mois, 
      dateDu, 
      dateAu, 
      primesImposables, 
      primesNonImposables, 
      deductions,
      tauxId,           // ⬅️ AJOUT: Récupérer du body
      tauxCIMR,         // ⬅️ AJOUT: Récupérer du body
      tauxMaladie,      // ⬅️ AJOUT: Récupérer du body
      tauxRetraiteComp,
      datePaiement // ⬅️ AJOUT  // ⬅️ AJOUT: Récupérer du body
    } = req.body;

    console.log("🔍 BACKEND - Taux reçus:", { tauxId, tauxCIMR, tauxMaladie, tauxRetraiteComp });

    // Vérifier employé
    const employe = await Employe.findById(employeId);
    if (!employe) return res.status(404).json({ error: "Employé non trouvé" });

    // Vérifier taux - SI tauxId est fourni, utiliser ce taux, sinon premier taux
    let tauxUtilise;
    if (tauxId) {
      tauxUtilise = await Taux.findById(tauxId);
    }
    if (!tauxUtilise) {
      tauxUtilise = await Taux.findOne(); // Fallback
    }
    if (!tauxUtilise) return res.status(404).json({ error: "Taux non défini" });

    // Conversion des salaires en nombres
    const salaireBase = parseFloat(employe.salaire) || 0;

    // Calcul des totaux avec valeurs par défaut
    const totalPrimesImposables = Array.isArray(primesImposables) 
      ? primesImposables.reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0)
      : 0;

    const totalPrimesNonImposables = Array.isArray(primesNonImposables)
      ? primesNonImposables.reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0)
      : 0;

    const totalDeductions = Array.isArray(deductions)
      ? deductions.reduce((sum, d) => sum + (parseFloat(d.montant) || 0), 0)
      : 0;

    // ⚠️ CORRECTION: Utiliser les taux du body OU du taux trouvé
    const tauxCIMRFinal = parseFloat(tauxCIMR) || parseFloat(tauxUtilise.tauxAR) || 0;
    const tauxMaladieFinal = parseFloat(tauxMaladie) || parseFloat(tauxUtilise.tauxMaladie) || 0;
    const tauxRetraiteFinal = parseFloat(tauxRetraiteComp) || parseFloat(tauxUtilise.retraiteComp) || 0;

    console.log("🔍 BACKEND - Taux utilisés:", { 
      tauxCIMRFinal, 
      tauxMaladieFinal, 
      tauxRetraiteFinal 
    });

    const cotisationCIMR = salaireBase * (tauxCIMRFinal / 100);
    const cotisationMaladie = salaireBase * (tauxMaladieFinal / 100);
    const cotisationRetraite = salaireBase * (tauxRetraiteFinal / 100);

    // Revenu imposable
    const revenuImposable = salaireBase + totalPrimesImposables;

    // IRSA
    const irsa = calculerIRSA(revenuImposable, employe.nombreEnfants || 0);

    // Salaire net
    const salaireNet = revenuImposable
      - cotisationCIMR
      - cotisationMaladie
      - cotisationRetraite
      - irsa
      + totalPrimesNonImposables
      - totalDeductions;

    // Création du paiement
    const paiement = new Paiement({
      employe: employe._id,
      tauxId: tauxUtilise._id,        // ⬅️ SAUVEGARDER tauxId
      employeNom: employe.nom,
      employePrenom: employe.prenom,
      salaireBase,
      dateEmbauche: employe.dateembauche,
      nombreEnfants: employe.nombreEnfants || 0,
      contrat: employe.contrat,
      dateFinContrat: employe.dateFinContrat,
      dateSortie: employe.dateSortie,
      datePaiement,

      mois,
      dateDu,
      dateAu,

      // ⚠️ CORRECTION: Sauvegarder les taux utilisés
      tauxCIMR: tauxCIMRFinal,
      tauxMaladie: tauxMaladieFinal,
      tauxRetraiteComp: tauxRetraiteFinal,

      primesImposables: primesImposables || [],
      primesNonImposables: primesNonImposables || [],
      deductions: deductions || [],

      // TOTAUX POUR L'AFFICHAGE
      totalPrimesImposables,
      totalPrimesNonImposables,
      totalDeductions,

      irsa,
      salaireNet
    });

    const savedPaiement = await paiement.save();

    const paiementPopulated = await Paiement.findById(savedPaiement._id)
      .populate("employe", "matricule prenom nom poste departement_id")
      .populate("tauxId", "nom tauxAR tauxMaladie retraiteComp"); // ⬅️ POPULER taux

    res.status(201).json(paiementPopulated);

  } catch (err) {
    console.error("Erreur POST paiement:", err);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});
app.get("/paiements", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const mois = req.query.mois || "";
    const dateDebut = req.query.dateDebut ? new Date(req.query.dateDebut) : null;
    const dateFin = req.query.dateFin ? new Date(req.query.dateFin) : null;
    const departement = req.query.departement || "";

    let filter = {};

    // 🟢 Filtre par mois
    if (mois) filter.mois = mois;

    // 🟢 Filtre entre deux dates
    if (dateDebut || dateFin) {
      filter.datePaiement = {};
      if (dateDebut) filter.datePaiement.$gte = dateDebut;
      if (dateFin) filter.datePaiement.$lte = dateFin;
    }

    // 🟢 Filtre par recherche (nom, prénom, matricule)
    if (search) {
      const employes = await Employe.find({
        $or: [
          { prenom: { $regex: search, $options: "i" } },
          { nom: { $regex: search, $options: "i" } },
          { matricule: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      const employeIds = employes.map(e => e._id);
      filter.employe = { $in: employeIds };
    }

    // 🟢 Filtre par département
    if (departement) {
      const employesDepartement = await Employe.find({
        departement_id: departement
      }).select("_id");

      const employeIds = employesDepartement.map(e => e._id);
      
      if (filter.employe) {
        // Combiner avec la recherche existante
        filter.employe.$in = filter.employe.$in.filter(id => 
          employeIds.includes(id.toString())
        );
      } else {
        filter.employe = { $in: employeIds };
      }
    }

    // 🟢 Récupération des paiements avec PAGINATION
    const total = await Paiement.countDocuments(filter);
    
    const paiements = await Paiement.find(filter)
      .populate("employe", "matricule prenom nom poste departement_id salaire nombreEnfants")
      .populate("tauxId", "nom tauxAR tauxMaladie retraiteComp")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // 🟢 Conversion des montants
    const paiementsFormatted = paiements.map(p => {
      const pObj = p.toObject();

      if (pObj.employe && pObj.employe.salaire) {
        try {
          pObj.employe.salaireBase = parseFloat(pObj.employe.salaire.toString()) || 0;
          delete pObj.employe.salaire;
        } catch {
          pObj.employe.salaireBase = 0;
        }
      } else if (pObj.employe) {
        pObj.employe.salaireBase = 0;
      }

      return pObj;
    });

    const pages = Math.ceil(total / limit);

    // ⭐ RETOURNER AVEC PAGINATION COMME VOTRE RÉFÉRENCE
    res.json({
      total,
      page,
      pages,
      paiements: paiementsFormatted
    });

  } catch (err) {
    console.error("Erreur GET paiements:", err);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});// Backend - Route améliorée pour /paimenteemploye
app.get("/paimenteemploye", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const statut = req.query.statut || "actif";
    const dateDebut = req.query.dateDebut ? new Date(req.query.dateDebut) : null;
    const dateFin = req.query.dateFin ? new Date(req.query.dateFin) : null;
    const departement = req.query.departement || "";

    const employeFilter = {};

    // 🔍 Recherche par nom, prénom ou matricule
    if (search) {
      employeFilter.$or = [
        { matricule: { $regex: search, $options: "i" } },
        { nom: { $regex: search, $options: "i" } },
        { prenom: { $regex: search, $options: "i" } }
      ];
    }

    // 🧩 Filtre par statut
    if (statut && statut !== "tous") {
      employeFilter.statut = statut;
    }

    // 🟢 Filtre par département
    if (departement) {
      employeFilter.departement_id = departement;
    }

    // 🔹 Si on a des filtres de date, on filtre par paiements
    if (dateDebut || dateFin) {
      const paiementFilter = {};
      
      if (dateDebut || dateFin) {
        paiementFilter.datePaiement = {};
        if (dateDebut) paiementFilter.datePaiement.$gte = dateDebut;
        if (dateFin) paiementFilter.datePaiement.$lte = dateFin;
      }

      // 🧾 Trouver les paiements correspondant à la période
      const paiements = await Paiement.find(paiementFilter).select("employe");
      const employeIds = [...new Set(paiements.map(p => p.employe.toString()))];
      
      if (employeIds.length > 0) {
        employeFilter._id = { $in: employeIds };
      } else {
        // Aucun paiement dans la période, retourner vide
        return res.json({
          total: 0,
          page,
          pages: 0,
          employes: []
        });
      }
    }

    // 🔹 Compter le total AVEC les filtres appliqués
    const total = await Employe.countDocuments(employeFilter);
    
    // 🔹 Charger les employés avec PAGINATION
    const employes = await Employe.find(employeFilter)
      .select("matricule nom prenom salaire nombreEnfants statut contrat dateFinContrat departement_id")
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // 🔹 Formater les données
    const employesForPaiements = employes.map(e => ({
      _id: e._id,
      matricule: e.matricule,
      nom: e.nom,
      prenom: e.prenom,
      salaireBase: e.salaire ? parseFloat(e.salaire.toString()) || 0 : 0,
      nombreEnfants: e.nombreEnfants || 0,
      statut: e.statut,
      contrat: e.contrat,
      dateFinContrat: e.dateFinContrat,
      departement_id: e.departement_id // ⭐ IMPORTANT: Garder pour les filtres
    }));

    const pages = Math.ceil(total / limit);

    res.json({
      total,
      page,
      pages,
      employes: employesForPaiements
    });

  } catch (err) {
    console.error("Erreur paimenteemploye:", err);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});


app.get("/rapport-journal-paie", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const search = req.query.search || "";
    const dateDebut = req.query.dateDebut ? new Date(req.query.dateDebut) : null;
    const dateFin = req.query.dateFin ? new Date(req.query.dateFin) : null;
    const departement = req.query.departement || "";

    console.log("📊 Requête rapport journal paie:", {
      page, search, dateDebut, dateFin, departement
    });

    let filter = { statut: "payé" };

    // Filtre entre deux dates
    if (dateDebut || dateFin) {
      filter.datePaiement = {};
      if (dateDebut) filter.datePaiement.$gte = dateDebut;
      if (dateFin) filter.datePaiement.$lte = dateFin;
    }

    // Filtre par recherche
    if (search) {
      const employes = await Employe.find({
        $or: [
          { nom: { $regex: search, $options: "i" } },
          { matricule: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      const employeIds = employes.map(e => e._id);
      
      if (employeIds.length > 0) {
        filter.employe = { $in: employeIds };
      } else {
        return res.json({
          total: 0,
          page: 1,
          pages: 0,
          totalSalaireNet: 0,
          paiements: []
        });
      }
    }

    // Filtre par département
    if (departement) {
      const employesDepartement = await Employe.find({
        departement_id: departement
      }).select("_id");

      const employeIds = employesDepartement.map(e => e._id);
      
      if (employeIds.length === 0) {
        return res.json({
          total: 0,
          page: 1,
          pages: 0,
          totalSalaireNet: 0,
          paiements: []
        });
      }
      
      if (filter.employe) {
        filter.employe.$in = filter.employe.$in.filter(id => 
          employeIds.includes(id.toString())
        );
        if (filter.employe.$in.length === 0) {
          return res.json({
            total: 0,
            page: 1,
            pages: 0,
            totalSalaireNet: 0,
            paiements: []
          });
        }
      } else {
        filter.employe = { $in: employeIds };
      }
    }

    // Récupération avec pagination
    const total = await Paiement.countDocuments(filter);
    const pages = Math.ceil(total / limit);
    
    console.log("🔢 Pagination:", { total, page, pages, limit });

    const paiements = await Paiement.find(filter)
      .populate({
        path: "employe",
        select: "matricule nom departement_id",
        populate: {
          path: "departement_id",
          select: "nom"
        }
      })
      .populate("tauxId", "nom tauxAR tauxMaladie retraiteComp")
      .sort({ datePaiement: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const totalSalaireNet = paiements.reduce((sum, p) => sum + (p.salaireNet || 0), 0);

    console.log("✅ Résultats:", { 
      nbPaiements: paiements.length,
      pageActuelle: page,
      totalPages: pages
    });

    res.json({
      total,
      page,
      pages,
      totalSalaireNet,
      paiements: paiements.map(p => p.toObject())
    });

  } catch (err) {
    console.error("❌ Erreur GET rapport journal paie:", err);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});
// Route pour l'export complet
app.get("/rapport-journal-paie/export-complet", async (req, res) => {
  try {
    const { dateDebut, dateFin, departement, search } = req.query;

    let filter = { statut: "payé" };

    if (dateDebut || dateFin) {
      filter.datePaiement = {};
      if (dateDebut) filter.datePaiement.$gte = new Date(dateDebut);
      if (dateFin) filter.datePaiement.$lte = new Date(dateFin);
    }

    // 🟢 CORRECTION: Recherche pour l'export
    if (search) {
      const employes = await Employe.find({
        $or: [
          { nom: { $regex: search, $options: "i" } },
          { matricule: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      const employeIds = employes.map(e => e._id);
      if (employeIds.length > 0) {
        filter.employe = { $in: employeIds };
      } else {
        return res.json({ total: 0, paiements: [] });
      }
    }

    if (departement) {
      const employesDepartement = await Employe.find({ departement_id: departement }).select("_id");
      const employeIds = employesDepartement.map(e => e._id);
      
      if (employeIds.length === 0) {
        return res.json({ total: 0, paiements: [] });
      }
      
      if (filter.employe) {
        filter.employe.$in = filter.employe.$in.filter(id => 
          employeIds.includes(id.toString())
        );
        if (filter.employe.$in.length === 0) {
          return res.json({ total: 0, paiements: [] });
        }
      } else {
        filter.employe = { $in: employeIds };
      }
    }

    const paiements = await Paiement.find(filter)
      .populate({
        path: "employe",
        select: "matricule nom departement_id",
        populate: {
          path: "departement_id",
          select: "nom"
        }
      })
      .sort({ datePaiement: -1 });

    res.json({
      total: paiements.length,
      paiements: paiements.map(p => p.toObject())
    });

  } catch (err) {
    console.error("Erreur export complet:", err);
    res.status(500).json({ error: "Erreur lors de l'export" });
  }
});
app.get("/paiements/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifie si l'ID est valide
    if (!id || id.length !== 24) {
      return res.status(400).json({ error: "ID invalide" });
    }

    // ⭐⭐ CORRECTION: Inclure contrat et dateFinContrat dans le populate
    const paiement = await Paiement.findById(id)
      .populate("employe", "matricule prenom nom poste departement_id salaire nombreEnfants contrat dateFinContrat"); // ← AJOUT

    if (!paiement) {
      return res.status(404).json({ error: "Paiement non trouvé" });
    }

    // Conversion sécurisée de Decimal128 (comme dans ton GET global)
    const pObj = paiement.toObject();
    if (pObj.employe && pObj.employe.salaire) {
      try {
        pObj.employe.salaireBase = parseFloat(pObj.employe.salaire.toString()) || 0;
        delete pObj.employe.salaire;
      } catch {
        pObj.employe.salaireBase = 0;
      }
    }

    // ⭐⭐ AJOUT: Log pour vérifier les données
    console.log("🔍 Données employé récupérées:", {
      nom: pObj.employe?.nom,
      prenom: pObj.employe?.prenom,
      contrat: pObj.employe?.contrat,
      dateFinContrat: pObj.employe?.dateFinContrat
    });

    res.json(pObj);

  } catch (err) {
    console.error("Erreur GET paiement par ID:", err);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});
app.get("/paiements/statistiques/:employeId", async (req, res) => {
  try {
    const { employeId } = req.params;
    const { startDate, endDate } = req.query;

    // 🔍 Validation ID employé
    if (!mongoose.Types.ObjectId.isValid(employeId)) {
      return res.status(400).json({ error: "ID employé invalide" });
    }

    // 🎯 Filtrage par période ET statut "payé"
    const filter = { 
      employe: employeId,
      statut: 'payé' // ⭐⭐ CORRECTION : seulement les paiements payés
    };
    
    if (startDate || endDate) {
      filter.datePaiement = {};
      if (startDate) filter.datePaiement.$gte = new Date(startDate);
      if (endDate) filter.datePaiement.$lte = new Date(endDate);
    }

    // 📦 Charger les paiements PAYÉS uniquement
    const paiements = await Paiement.find(filter).sort({ datePaiement: 1 });

    // 🧾 Charger l'employé
    const employe = await Employe.findById(employeId).select("nom prenom matricule salaire");
    if (!employe) {
      return res.status(404).json({ error: "Employé non trouvé" });
    }

    // ⚙️ Initialisation des stats
    const stats = {
      employe: {
        nom: employe.nom,
        prenom: employe.prenom,
        matricule: employe.matricule,
      },
      totalPaiements: paiements.length,
      montantTotal: 0,
      dernierPaiement: null,
      moyenneMensuelle: 0,
      paiements6Mois: [] // Pour graphique
    };

    if (paiements.length === 0) {
      return res.json(stats); // Aucun paiement payé → renvoyer stats vides
    }

    // 🔢 Calculs globaux (seulement sur les payés)
    paiements.forEach(p => {
      stats.montantTotal += p.montantTotal || 0;
    });

    // 🕓 Dernier paiement PAYÉ
    const dernier = paiements[paiements.length - 1];
    stats.dernierPaiement = {
      date: dernier.datePaiement,
      montant: dernier.montantTotal || 0
    };

    // 📆 Regrouper par mois (pour graphique) - seulement payés
    const paiementsParMois = {};
    paiements.forEach(p => {
      const moisCle = new Date(p.datePaiement).toISOString().slice(0, 7);
      if (!paiementsParMois[moisCle]) paiementsParMois[moisCle] = 0;
      paiementsParMois[moisCle] += p.montantTotal || 0;
    });

    // 📈 Derniers 6 mois - seulement payés
    const moisActuel = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(moisActuel.getFullYear(), moisActuel.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      stats.paiements6Mois.push({
        mois: d.toLocaleString('fr-FR', { month: 'short', year: 'numeric' }),
        montant: paiementsParMois[key] || 0
      });
    }

    // 💰 Moyenne mensuelle - seulement payés
    const nbMois = Object.keys(paiementsParMois).length || 1;
    stats.moyenneMensuelle = stats.montantTotal / nbMois;

    res.json(stats);

  } catch (err) {
    console.error("Erreur statistiques paiements:", err);
    res.status(500).json({ error: "Erreur serveur lors du calcul des statistiques" });
  }
});

app.put("/paiements/:id", async (req, res) => {
  try {
    const { 
      employeId, 
      mois, 
      dateDu, 
      dateAu, 
      primesImposables, 
      primesNonImposables, 
      deductions,
      tauxId,
      tauxCIMR,
      tauxMaladie,
      tauxRetraiteComp,
      datePaiement,
      statut // ⬅️ Récupérer le statut du body
    } = req.body;

    console.log("🔍 BACKEND PUT - Taux reçus:", { tauxId, tauxCIMR, tauxMaladie, tauxRetraiteComp });
    console.log("🔍 BACKEND PUT - Statut reçu:", statut);

    // Vérifier si le paiement existe
    const existingPaiement = await Paiement.findById(req.params.id);
    if (!existingPaiement) {
      return res.status(404).json({ error: "Paiement non trouvé" });
    }

    // ⭐⭐ PROTECTION : EMPÊCHER TOUTE MODIFICATION SI DÉJÀ PAYÉ
    if (existingPaiement.statut === 'payé') {
      return res.status(400).json({ 
        error: "Impossible de modifier un paiement déjà payé",
        details: "Le paiement a déjà été versé à l'employé. Créez un nouveau paiement pour les corrections."
      });
    }

    // ⚠️ CORRECTION CRITIQUE : Vérifier et récupérer l'employé
    const employe = await Employe.findById(employeId);
    if (!employe) return res.status(404).json({ error: "Employé non trouvé" });

    // Vérifier taux
    let tauxUtilise;
    if (tauxId) {
      tauxUtilise = await Taux.findById(tauxId);
    }
    if (!tauxUtilise) {
      tauxUtilise = await Taux.findOne();
    }
    if (!tauxUtilise) return res.status(404).json({ error: "Taux non défini" });

    // Utiliser les taux du body OU du taux trouvé
    const tauxCIMRFinal = parseFloat(tauxCIMR) || parseFloat(tauxUtilise.tauxAR) || 0;
    const tauxMaladieFinal = parseFloat(tauxMaladie) || parseFloat(tauxUtilise.tauxMaladie) || 0;
    const tauxRetraiteFinal = parseFloat(tauxRetraiteComp) || parseFloat(tauxUtilise.retraiteComp) || 0;

    console.log("🔍 BACKEND PUT - Taux utilisés:", { 
      tauxCIMRFinal, 
      tauxMaladieFinal, 
      tauxRetraiteFinal 
    });

    // Conversion des salaires en nombres
    const salaireBase = parseFloat(employe.salaire) || 0;

    // Calcul des totaux
    const totalPrimesImposables = Array.isArray(primesImposables) 
      ? primesImposables.reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0)
      : 0;

    const totalPrimesNonImposables = Array.isArray(primesNonImposables)
      ? primesNonImposables.reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0)
      : 0;

    const totalDeductions = Array.isArray(deductions)
      ? deductions.reduce((sum, d) => sum + (parseFloat(d.montant) || 0), 0)
      : 0;

    // Cotisations
    const cotisationCIMR = salaireBase * (tauxCIMRFinal / 100);
    const cotisationMaladie = salaireBase * (tauxMaladieFinal / 100);
    const cotisationRetraite = salaireBase * (tauxRetraiteFinal / 100);

    // Revenu imposable
    const revenuImposable = salaireBase + totalPrimesImposables;

    // IRSA
    const irsa = calculerIRSA(revenuImposable, employe.nombreEnfants || 0);

    // Salaire net
    const salaireNet = revenuImposable
      - cotisationCIMR
      - cotisationMaladie
      - cotisationRetraite
      - irsa
      + totalPrimesNonImposables
      - totalDeductions;

    // Mise à jour du paiement - PERMET LE CHANGEMENT DE STATUT de "validé" à "payé"
    const paiementUpdate = {
      employe: employe._id,
      tauxId: tauxUtilise._id,
      employeNom: employe.nom,
      employePrenom: employe.prenom,
      salaireBase,
      dateEmbauche: employe.dateembauche,
      nombreEnfants: employe.nombreEnfants || 0,
      contrat: employe.contrat,
      dateFinContrat: employe.dateFinContrat,
      dateSortie: employe.dateSortie,
      datePaiement: datePaiement || existingPaiement.datePaiement,

      mois,
      dateDu,
      dateAu,

      tauxCIMR: tauxCIMRFinal,
      tauxMaladie: tauxMaladieFinal,
      tauxRetraiteComp: tauxRetraiteFinal,

      primesImposables: primesImposables || [],
      primesNonImposables: primesNonImposables || [],
      deductions: deductions || [],

      totalPrimesImposables,
      totalPrimesNonImposables,
      totalDeductions,

      irsa,
      salaireNet,
      statut: statut || existingPaiement.statut // ⬅️ PERMET LE CHANGEMENT DE STATUT
    };

    const updatedPaiement = await Paiement.findByIdAndUpdate(
      req.params.id,
      paiementUpdate,
      { new: true, runValidators: true }
    )
    .populate("employe", "matricule prenom nom poste departement_id")
    .populate("tauxId", "nom tauxAR tauxMaladie retraiteComp");

    res.json(updatedPaiement);
  } catch (err) {
    console.error("Erreur PUT paiement:", err);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});
// --- DELETE : Supprimer plusieurs paiements ---
app.delete("/paiements", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Liste des IDs des paiements à supprimer requise" });
    }

    const result = await Paiement.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Aucun paiement trouvé pour suppression" });
    }

    res.json({ 
      message: `${result.deletedCount} paiement(s) supprimé(s) avec succès` 
    });

  } catch (err) {
    console.error("Erreur DELETE multiple paiements:", err);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});
// --- DELETE : Supprimer un paiement par ID ---
app.delete("/paiements/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID du paiement requis" });
    }

    const result = await Paiement.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ error: "Paiement non trouvé" });
    }

    res.json({ 
      message: "Paiement supprimé avec succès",
      deletedPaiement: result 
    });

  } catch (err) {
    console.error("Erreur DELETE paiement:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "ID de paiement invalide" });
    }
    
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});































// POST - Générer paiement manuel avec QR Code
app.post("/api/mvola/paiement-manuel", async (req, res) => {
  try {
    console.log('📱 MVola Manuel: Génération paiement...');
    
    const { employeId, montant } = req.body;

    // Vérifier l'employé
    const employe = await Employe.findById(employeId);
    if (!employe) {
      return res.status(404).json({ error: "Employé non trouvé" });
    }

    // Vérifier le dernier paiement validé
    const dernierPaiement = await Paiement.findOne({ employe: employeId }).sort({ createdAt: -1 });
    if (!dernierPaiement || dernierPaiement.statut !== 'validé') {
      return res.status(400).json({ error: "Aucun paiement validé trouvé" });
    }

    // Valider le numéro
    if (!mvolaService.validerNumeroMVola(employe.telephone)) {
      return res.status(400).json({ 
        error: "Numéro MVola invalide",
        numero: employe.telephone
      });
    }

    // Générer code USSD et QR Code
    const codeUSSD = mvolaService.genererCodeUSSD(employe.telephone, montant);
    const qrCodeImage = await mvolaService.genererQRCode(codeUSSD);

    // Référence unique
    const reference = `SALAIRE_${employe.matricule}_${Date.now()}`;

    // Vérifier s'il existe déjà une transaction en attente
    let transactionExistante = await MvolaPaiement.findOne({
      employe: employeId,
      statut: 'en_attente'
    });

    if (transactionExistante) {
      // Mettre à jour la transaction existante
      transactionExistante.reference = reference;
      transactionExistante.montant = montant;
      transactionExistante.codeUSSD = codeUSSD;
      transactionExistante.qrCode = qrCodeImage;
      await transactionExistante.save();

      return res.json({
        success: true,
        message: "QR Code régénéré",
        transactionId: transactionExistante._id,
        reference: reference,
        employe: `${employe.prenom} ${employe.nom}`,
        telephone: employe.telephone,
        montant: `${montant} AR`,
        codeUSSD: codeUSSD,
        qrCode: qrCodeImage,
        existingTransaction: true
      });
    }

    // Créer nouvelle transaction
    const nouvelleTransaction = new MvolaPaiement({
      employe: employeId,
      reference: reference,
      montant: montant,
      numeroTelephone: employe.telephone,
      transactionId: `mv_${Date.now()}`,
      codeUSSD: codeUSSD,
      qrCode: qrCodeImage,
      statut: 'en_attente'
    });

    await nouvelleTransaction.save();

    res.json({
      success: true,
      message: "QR Code généré",
      transactionId: nouvelleTransaction._id,
      reference: reference,
      employe: `${employe.prenom} ${employe.nom}`,
      telephone: employe.telephone,
      montant: `${montant} AR`,
      codeUSSD: codeUSSD,
      qrCode: qrCodeImage,
      existingTransaction: false
    });

  } catch (error) {
    console.error('❌ Erreur génération paiement:', error);
    res.status(500).json({ 
      error: "Erreur lors de la génération du QR Code",
      details: error.message 
    });
  }
});// PUT - Marquer comme payé// PUT - Marquer comme payé// PUT - Marquer comme payé - VERSION CORRIGÉE
app.put("/api/mvola/payer/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;

    console.log('✅ Marquer comme payé:', transactionId);

    // 1. Trouver la transaction MVola
    const transactionMvola = await MvolaPaiement.findById(transactionId);
    if (!transactionMvola) {
      return res.status(404).json({ error: "Transaction MVola non trouvée" });
    }

    // 2. Trouver le DERNIER paiement validé pour cet employé
    const dernierPaiementValide = await Paiement.findOne({
      employe: transactionMvola.employe,
      statut: 'validé'  // ⬅️ IMPORTANT: seulement les paiements validés
    }).sort({ createdAt: -1 }); // Le plus récent

    if (!dernierPaiementValide) {
      return res.status(404).json({ 
        error: "Aucun paiement validé trouvé pour cet employé" 
      });
    }

    console.log('📋 Paiement à mettre à jour:', {
      paiementId: dernierPaiementValide._id,
      employe: dernierPaiementValide.employe,
      mois: dernierPaiementValide.mois,
      statutActuel: dernierPaiementValide.statut
    });

    // 3. Mettre à jour le statut du paiement principal
    const paiementMisAJour = await Paiement.findByIdAndUpdate(
      dernierPaiementValide._id, // ⬅️ ID spécifique, pas juste le critère employe
      { 
        statut: 'payé',
        datePaiement: new Date(),
        modePaiement: 'mvola_manuel'
      },
      { new: true } // Retourne le document mis à jour
    );

    // 4. Mettre à jour aussi la transaction MVola
    transactionMvola.statut = 'payé';
    transactionMvola.datePaiement = new Date();
    transactionMvola.paiementLie = dernierPaiementValide._id; // ⬅️ Lien explicite
    await transactionMvola.save();

    console.log('✅ Statut mis à jour avec succès:', {
      paiementId: paiementMisAJour._id,
      ancienStatut: 'validé',
      nouveauStatut: paiementMisAJour.statut,
      datePaiement: paiementMisAJour.datePaiement
    });

    res.json({
      success: true,
      message: "Paiement confirmé - Statut changé à 'payé'",
      transactionId: transactionMvola._id,
      paiementId: paiementMisAJour._id,
      statut: paiementMisAJour.statut,
      datePaiement: paiementMisAJour.datePaiement,
      mois: paiementMisAJour.mois
    });

  } catch (error) {
    console.error('❌ Erreur confirmation paiement:', error);
    res.status(500).json({ 
      error: "Erreur lors de la confirmation",
      details: error.message 
    });
  }
});
// GET - Vérifier statut paiement
app.get("/api/paiements/statut/:employeId", async (req, res) => {
  try {
    const { employeId } = req.params;

    const paiements = await Paiement.find({ employe: employeId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      employeId,
      paiements: paiements.map(p => ({
        _id: p._id,
        mois: p.mois,
        statut: p.statut,
        datePaiement: p.datePaiement,
        salaireNet: p.salaireNet,
        createdAt: p.createdAt
      }))
    });

  } catch (error) {
    console.error('❌ Erreur vérification statut:', error);
    res.status(500).json({ error: "Erreur vérification statut" });
  }
});
// PUT - Annuler paiement
app.put("/api/mvola/annuler/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;

    console.log('❌ Annulation paiement:', transactionId);

    const transaction = await MvolaPaiement.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction non trouvée" });
    }

    // Marquer comme annulé
    transaction.statut = 'annulé';
    await transaction.save();

    res.json({
      success: true,
      message: "Paiement annulé",
      transactionId: transaction._id,
      statut: 'annulé'
    });

  } catch (error) {
    console.error('❌ Erreur annulation:', error);
    res.status(500).json({ error: "Erreur lors de l'annulation" });
  }
});// GET - Infos employé
app.get("/api/mvola/infos-employe/:employeId", async (req, res) => {
  try {
    const { employeId } = req.params;

    const employe = await Employe.findById(employeId)
      .select('matricule prenom nom telephone');
    
    if (!employe) {
      return res.status(404).json({ error: "Employé non trouvé" });
    }

    const dernierPaiement = await Paiement.findOne({ employe: employeId })
      .sort({ createdAt: -1 });

    res.json({
      employe: {
        _id: employe._id,
        matricule: employe.matricule,
        prenom: employe.prenom,
        nom: employe.nom,
        telephone: employe.telephone
      },
      dernierPaiement: dernierPaiement ? {
        mois: dernierPaiement.mois,
        salaireNet: dernierPaiement.salaireNet,
        statut: dernierPaiement.statut
      } : null,
      peutPayer: dernierPaiement && dernierPaiement.statut === 'validé'
    });

  } catch (error) {
    console.error('❌ Erreur infos employé:', error);
    res.status(500).json({ error: "Erreur récupération infos" });
  }
});

// GET - Historique des paiements MVola par employé
app.get("/api/mvola/historique/:employeId", async (req, res) => {
  try {
    const { employeId } = req.params;

    const paiements = await MvolaPaiement.find({ employe: employeId })
      .sort({ createdAt: -1 })
      .populate('employe', 'matricule prenom nom poste')
      .lean();

    // Formater la réponse
    const historique = paiements.map(p => ({
      _id: p._id,
      reference: p.reference,
      montant: p.montant,
      numeroTelephone: p.numeroTelephone,
      statut: p.statut,
      transactionId: p.transactionId,
      datePaiement: p.datePaiement,
      createdAt: p.createdAt,
      employe: p.employe
    }));

    res.json(historique);

  } catch (error) {
    console.error('❌ Erreur historique MVola:', error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération de l'historique MVola" 
    });
  }
});
















































// Créer une nouvelle note interne (SANS AUTEUR)
app.post("/notes-internes", async (req, res) => {
  try {
    const { titre, contenu, departements, datePublication } = req.body;
    
    // Validation des champs requis
    if (!titre || !contenu) {
      return res.status(400).json({ error: "Le titre et le contenu sont requis." });
    }

    // Vérifier que les départements existent si spécifiés
    if (departements && departements.length > 0) {
      const departementsExistants = await Departement.find({ 
        _id: { $in: departements } 
      });
      
      if (departementsExistants.length !== departements.length) {
        return res.status(400).json({ error: "Un ou plusieurs départements sont invalides." });
      }
    }

    // Créer la note interne (SANS AUTEUR)
    const nouvelleNote = new NoteInterne({
      titre,
      contenu,
      departements: departements || [],
      datePublication: datePublication || new Date()
    });

    const noteSauvegardee = await nouvelleNote.save();
    
    // Populer les informations pour la réponse
    const noteAvecDetails = await NoteInterne.findById(noteSauvegardee._id)
      .populate('departements', 'nom');

    res.status(201).json(noteAvecDetails);

  } catch (error) {
    console.error("Erreur lors de la création de la note interne:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: "Erreur serveur lors de la création de la note." });
  }
});

// Récupérer toutes les notes internes
app.get("/notes-internes", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const filter = {};
    if (search) {
      filter.$or = [
        { titre: { $regex: search, $options: "i" } },
        { contenu: { $regex: search, $options: "i" } }
      ];
    }

    const notes = await NoteInterne.find(filter)
      .populate('departements', 'nom')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await NoteInterne.countDocuments(filter);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      notes
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des notes:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des notes." });
  }
});
// Rapport des notes internes
app.get("/notes-internes/rapport", async (req, res) => {
  try {
    const { startDate, endDate, departement } = req.query;

    // Validation des dates
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Filtre de base par période
    const filter = {
      datePublication: { 
        $gte: start, 
        $lte: end 
      }
    };

    // Filtrer par département si spécifié
    if (departement && departement !== "tous") {
      filter.departements = departement;
    }

    // Récupérer les notes avec pagination étendue
    const notes = await NoteInterne.find(filter)
      .populate('departements', 'nom')
      .sort({ datePublication: -1 });

    // Statistiques globales
    const totalNotes = notes.length;
    const notesPourTous = notes.filter(note => note.estVisiblePourTous).length;
    const notesCiblees = totalNotes - notesPourTous;

    // Statistiques par département
    const statsParDepartement = {};
    notes.forEach(note => {
      if (note.estVisiblePourTous) {
        // Note pour tous - compter pour tous les départements
        if (!statsParDepartement["tous"]) {
          statsParDepartement["tous"] = { nom: "Tous les départements", count: 0 };
        }
        statsParDepartement["tous"].count += 1;
      } else {
        // Notes ciblées - compter par département
        note.departements.forEach(dep => {
          if (!statsParDepartement[dep._id]) {
            statsParDepartement[dep._id] = { nom: dep.nom, count: 0 };
          }
          statsParDepartement[dep._id].count += 1;
        });
      }
    });

    res.json({
      periode: `${start.toISOString().split('T')[0]} - ${end.toISOString().split('T')[0]}`,
      totalNotes,
      notesPourTous,
      notesCiblees,
      statsParDepartement: Object.values(statsParDepartement),
      notes: notes.map(note => ({
        ...note.toObject(),
        nombreDepartements: note.estVisiblePourTous ? "Tous" : note.departements.length
      }))
    });

  } catch (error) {
    console.error("Erreur rapport notes internes:", error);
    res.status(500).json({ error: "Erreur serveur lors de la génération du rapport." });
  }
});
// Récupérer les notes visibles pour un employé
app.get("/notes-internes/employe/:employeId", async (req, res) => {
  try {
    const { employeId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const employe = await Employe.findById(employeId).populate('departement_id');
    
    if (!employe) {
      return res.status(404).json({ error: "Employé non trouvé." });
    }

    const filter = {
      $and: [
        {
          $or: [
            { estVisiblePourTous: true },
            { departements: employe.departement_id ? employe.departement_id._id : null }
          ]
        },
        { datePublication: { $lte: new Date() } }
      ]
    };

    const notes = await NoteInterne.find(filter)
      .populate('departements', 'nom')
      .sort({ datePublication: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await NoteInterne.countDocuments(filter);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      notes
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des notes employé:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Récupérer une note spécifique
app.get("/notes-internes/:id", async (req, res) => {
  try {
    const note = await NoteInterne.findById(req.params.id)
      .populate('departements', 'nom');

    if (!note) {
      return res.status(404).json({ error: "Note interne non trouvée." });
    }

    res.json(note);
  } catch (error) {
    console.error("Erreur lors de la récupération de la note:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Modifier une note interne
app.put("/notes-internes/:id", async (req, res) => {
  try {
    const { titre, contenu, departements, datePublication } = req.body;

    if (!titre || !contenu) {
      return res.status(400).json({ error: "Le titre et le contenu sont requis." });
    }

    const noteExistante = await NoteInterne.findById(req.params.id);
    if (!noteExistante) {
      return res.status(404).json({ error: "Note interne non trouvée." });
    }

    if (departements && departements.length > 0) {
      const departementsExistants = await Departement.find({ 
        _id: { $in: departements } 
      });
      
      if (departementsExistants.length !== departements.length) {
        return res.status(400).json({ error: "Un ou plusieurs départements sont invalides." });
      }
    }

    const noteModifiee = await NoteInterne.findByIdAndUpdate(
      req.params.id,
      {
        titre,
        contenu,
        departements: departements || [],
        datePublication: datePublication || noteExistante.datePublication
      },
      { new: true, runValidators: true }
    ).populate('departements', 'nom');

    res.json(noteModifiee);

  } catch (error) {
    console.error("Erreur lors de la modification de la note:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: "Erreur serveur lors de la modification." });
  }
});

// Supprimer une note interne
app.delete("/notes-internes/:id", async (req, res) => {
  try {
    const noteSupprimee = await NoteInterne.findByIdAndDelete(req.params.id);
    
    if (!noteSupprimee) {
      return res.status(404).json({ error: "Note interne non trouvée." });
    }

    res.json({ message: "Note interne supprimée avec succès.", noteSupprimee });
  } catch (error) {
    console.error("Erreur lors de la suppression de la note:", error);
    res.status(500).json({ error: "Erreur serveur lors de la suppression." });
  }
});


















































// POST - Créer une nouvelle tâche (SANS POSTE)
app.post("/taches", async (req, res) => {
  try {
    const { titre, description, assignationType, employe_id, departement_id, priorite, dateLimite } = req.body;
    
    // Validation des champs requis
    if (!titre || !description || !assignationType || !dateLimite) {
      return res.status(400).json({ error: "Titre, description, type d'assignation et date limite sont requis." });
    }

    // Validation selon le type d'assignation
    if (assignationType === 'personne' && !employe_id) {
      return res.status(400).json({ error: "ID employé requis pour assignation personne." });
    }
    
    if (assignationType === 'departement' && !departement_id) {
      return res.status(400).json({ error: "ID département requis pour assignation département." });
    }

    // Vérifier que les références existent
    if (employe_id) {
      const employe = await Employe.findById(employe_id);
      if (!employe) return res.status(404).json({ error: "Employé non trouvé." });
    }
    
    if (departement_id) {
      const departement = await Departement.findById(departement_id);
      if (!departement) return res.status(404).json({ error: "Département non trouvé." });
    }

    // Créer la tâche - statut "en_cours" par défaut
    const nouvelleTache = new Tache({
      titre,
      description,
      assignationType,
      employe_id: assignationType === 'personne' ? employe_id : null,
      departement_id: assignationType === 'departement' ? departement_id : null,
      priorite: priorite || 'normale',
      dateLimite,
    });

    const tacheSauvegardee = await nouvelleTache.save();
    
    // Populer les informations pour la réponse
    const tacheAvecDetails = await Tache.findById(tacheSauvegardee._id)
      .populate('employe_id', 'matricule prenom nom poste')
      .populate('departement_id', 'nom');

    res.status(201).json(tacheAvecDetails);

  } catch (error) {
    console.error("Erreur lors de la création de la tâche:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: "Erreur serveur lors de la création de la tâche." });
  }
});

// GET - Récupérer toutes les tâches (SANS RECHERCHE PAR POSTE)
app.get("/taches", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const statut = req.query.statut || "";

    const filter = {};
    if (search) {
      filter.$or = [
        { titre: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
        // SUPPRIMÉ la recherche par poste
      ];
    }

    if (statut) {
      filter.statut = statut;
    }

    const taches = await Tache.find(filter)
      .populate('employe_id', 'matricule prenom nom poste')
      .populate('departement_id', 'nom')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Tache.countDocuments(filter);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      taches
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des tâches:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des tâches." });
  }
});
// 📁 ENDPOINT RAPPORT TÂCHES POUR DASHBOARD
app.get("/taches/rapport-dashboard", async (req, res) => {
  try {
    // Compter les tâches par statut
    const tachesEnCours = await Tache.countDocuments({ statut: "en_cours" });
    const tachesTerminees = await Tache.countDocuments({ statut: "terminé" });
    const tachesAnnulees = await Tache.countDocuments({ statut: "annulé" });
    
    // Tâches en retard (date limite dépassée et toujours en cours)
    const aujourdHui = new Date();
    const tachesEnRetard = await Tache.countDocuments({
      statut: "en_cours",
      dateLimite: { $lt: aujourdHui }
    });

    res.json({
      tachesEnCours,
      tachesTerminees,
      tachesAnnulees,
      tachesEnRetard,
      totalTaches: tachesEnCours + tachesTerminees + tachesAnnulees
    });

  } catch (error) {
    console.error("Erreur rapport tâches dashboard:", error);
    res.status(500).json({ error: "Erreur serveur lors du calcul des statistiques tâches." });
  }
});

// GET - Récupérer les tâches d'un employé (SANS POSTE)
app.get("/taches/employe/:employeId", async (req, res) => {
  try {
    const { employeId } = req.params;
    const { statut } = req.query;

    const employe = await Employe.findById(employeId).populate('departement_id');
    
    if (!employe) {
      return res.status(404).json({ error: "Employé non trouvé." });
    }

    // Filtre pour trouver les tâches de l'employé (SANS POSTE)
    const filter = {
      $or: [
        // Tâches assignées directement à l'employé
        { employe_id: employeId },
        // Tâches assignées à son département
        { departement_id: employe.departement_id?._id }
        // SUPPRIMÉ l'assignation par poste
      ]
    };

    if (statut) {
      filter.statut = statut;
    }

    const taches = await Tache.find(filter)
      .populate('employe_id', 'matricule prenom nom poste')
      .populate('departement_id', 'nom')
      .sort({ dateLimite: 1 });

    res.json(taches);

  } catch (error) {
    console.error("Erreur lors de la récupération des tâches employé:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// PUT - Modifier le statut d'une tâche AVEC DATE DE FIN
app.put("/taches/:id/statut", async (req, res) => {
  try {
    const { statut } = req.body;

    if (!statut || !['en_cours', 'terminé', 'annulé'].includes(statut)) {
      return res.status(400).json({ error: "Statut invalide." });
    }

    // Préparer les données de mise à jour
    const updateData = { statut };
    
    // Si la tâche est marquée comme terminée, ajouter la date de fin
    if (statut === 'terminé') {
      updateData.dateFin = new Date();
    }
    
    // Si la tâche est reprise (passée de terminé à en_cours), supprimer la date de fin
    if (statut === 'en_cours') {
      updateData.dateFin = null;
    }

    const tacheModifiee = await Tache.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('employe_id', 'matricule prenom nom poste')
    .populate('departement_id', 'nom');

    if (!tacheModifiee) {
      return res.status(404).json({ error: "Tâche non trouvée." });
    }

    res.json(tacheModifiee);

  } catch (error) {
    console.error("Erreur lors de la modification du statut:", error);
    res.status(500).json({ error: "Erreur serveur lors de la modification." });
  }
});

// GET - Tâche par ID
app.get("/taches/:id", async (req, res) => {
  try {
    const tache = await Tache.findById(req.params.id)
      .populate('employe_id', 'matricule prenom nom poste')
      .populate('departement_id', 'nom');

    if (!tache) {
      return res.status(404).json({ error: "Tâche non trouvée." });
    }

    res.json(tache);
  } catch (error) {
    console.error("Erreur lors de la récupération de la tâche:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// PUT - Modifier une tâche
app.put("/taches/:id", async (req, res) => {
  try {
    const { titre, description, priorite, dateLimite } = req.body;

    const tacheExistante = await Tache.findById(req.params.id);
    if (!tacheExistante) {
      return res.status(404).json({ error: "Tâche non trouvée." });
    }

    const tacheModifiee = await Tache.findByIdAndUpdate(
      req.params.id,
      {
        titre: titre || tacheExistante.titre,
        description: description || tacheExistante.description,
        priorite: priorite || tacheExistante.priorite,
        dateLimite: dateLimite || tacheExistante.dateLimite
      },
      { new: true, runValidators: true }
    )
    .populate('employe_id', 'matricule prenom nom poste')
    .populate('departement_id', 'nom');

    res.json(tacheModifiee);

  } catch (error) {
    console.error("Erreur lors de la modification de la tâche:", error);
    res.status(500).json({ error: "Erreur serveur lors de la modification." });
  }
});

// DELETE - Supprimer une tâche
app.delete("/taches/:id", async (req, res) => {
  try {
    const tacheSupprimee = await Tache.findByIdAndDelete(req.params.id);
    
    if (!tacheSupprimee) {
      return res.status(404).json({ error: "Tâche non trouvée." });
    }

    res.json({ message: "Tâche supprimée avec succès.", tacheSupprimee });
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche:", error);
    res.status(500).json({ error: "Erreur serveur lors de la suppression." });
  }
});













// Route principale du tableau de bord - AVEC GRAPHIQUE PRÉSENCES
app.get("/dashboard/stats", async (req, res) => {
  try {
    const aujourdhui = new Date();
    const debutMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1);

    // 1. NOMBRE D'EMPLOYÉS
    const totalEmployes = await Employe.countDocuments();
    const employesActifs = await Employe.countDocuments({ statut: "actif" });

    // 2. ANCIENS EMPLOYÉS
    const employesLicencies = await Employe.countDocuments({ 
      $or: [
        { statut: "licencie" },
        { statut: "licenciement" },
        { statut: "licencié" }
      ]
    });

    const employesDemission = await Employe.countDocuments({ 
      $or: [
        { statut: "demission" },
        { statut: "démission" }
      ]
    });

    const employesRetraite = await Employe.countDocuments({ 
      $or: [
        { statut: "retraite" },
        { statut: "retraité" }
      ]
    });

    const anciensEmployes = employesLicencies + employesDemission + employesRetraite;

    // 3. TÂCHES EN COURS
    const tachesEnCours = await Tache.countDocuments({ statut: "en_cours" });

    // 4. ÉVOLUTION DES PRÉSENCES PAR JOUR
    const dateDebut = new Date(aujourdhui);
    dateDebut.setDate(aujourdhui.getDate() - 30);
    dateDebut.setHours(0, 0, 0, 0);

    const presencesEvolution = await Presence.find({
      date: { 
        $gte: dateDebut,
        $lte: aujourdhui
      }
    });

    // Grouper par date
    const presencesParDate = {};
    presencesEvolution.forEach(presence => {
      const dateStr = presence.date.toISOString().split('T')[0];
      
      if (!presencesParDate[dateStr]) {
        presencesParDate[dateStr] = 0;
      }

      // Compter comme présent si au moins une demi-journée pointée
      if (presence.presentMatin || presence.presentSoir) {
        presencesParDate[dateStr]++;
      }
    });

    // Convertir en tableau pour le graphique
    const evolutionPresences = Object.keys(presencesParDate)
      .sort()
      .map(dateStr => ({
        date: new Date(dateStr).toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'short' 
        }),
        présences: presencesParDate[dateStr]
      }));

    // 5. CAMEMBERT PAR DÉPARTEMENT
    const repartitionDepartements = await Employe.aggregate([
      { $match: { statut: "actif" } },
      {
        $lookup: {
          from: "departements",
          localField: "departement_id",
          foreignField: "_id",
          as: "departement"
        }
      },
      { $unwind: "$departement" },
      {
        $group: {
          _id: "$departement.nom",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 6. PRÉSENCES AUJOURD'HUI
    const aujourdhuiStart = new Date(aujourdhui);
    aujourdhuiStart.setHours(0, 0, 0, 0);
    const aujourdhuiEnd = new Date(aujourdhui);
    aujourdhuiEnd.setHours(23, 59, 59, 999);

    const presencesAujourdhui = await Presence.countDocuments({
      date: { 
        $gte: aujourdhuiStart, 
        $lte: aujourdhuiEnd 
      },
      $or: [{ presentMatin: true }, { presentSoir: true }]
    });

    // 7. CONGÉS EN ATTENTE
    const congesEnAttente = await Conge.countDocuments({ statut: "en_attente" });

    res.json({
      kpis: {
        totalEmployes,
        employesActifs,
        anciensEmployes,
        presencesAujourdhui,
        absentsAujourdhui: employesActifs - presencesAujourdhui,
        congesEnAttente,
        tachesEnCours
      },

      graphiques: {
        evolutionPresences, // ⬅️ NOUVEAU : données pour graphique linéaire
        repartitionDepartements: repartitionDepartements.map(dept => ({
          name: dept._id,
          value: dept.count,
          color: getRandomColor()
        }))
      },

      statsDetails: {
        licencies: employesLicencies,
        demission: employesDemission,
        retraite: employesRetraite
      }
    });

  } catch (err) {
    console.error("Erreur dashboard:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// Fonction pour générer des couleurs aléatoires
function getRandomColor() {
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];
  return colors[Math.floor(Math.random() * colors.length)];
}


*/
const PORT = 5050;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});

