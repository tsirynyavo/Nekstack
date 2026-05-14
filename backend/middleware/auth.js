// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../db/User');
const Citoyen = require('../db/Citoyen');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_super_securise_rh_system';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Token requis" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role === 'admin' || decoded.role === 'user') {
      const user = await User.findById(decoded.userId);
      if (!user) return res.status(401).json({ error: "Admin non trouvé" });
      req.user = user;
    } else if (decoded.role === 'citoyen') {
      const citoyen = await Citoyen.findById(decoded.userId).populate('id_quartier');
      if (!citoyen) return res.status(401).json({ error: "Citoyen non trouvé" });
      req.user = citoyen;
    } else {
      return res.status(401).json({ error: "Rôle invalide" });
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: "Token invalide ou expiré" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Réservé admin" });
  next();
};

const requireCitoyen = (req, res, next) => {
  if (req.user.role !== 'citoyen') return res.status(403).json({ error: "Réservé citoyen" });
  next();
};

module.exports = { authenticateToken, requireAdmin, requireCitoyen, JWT_SECRET };