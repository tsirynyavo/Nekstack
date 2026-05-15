// Service qui lit les annonces de coupure depuis le backend
const API_BASE = 'http://localhost:5000/api'; // À adapter si ton backend tourne ailleurs

export const annonceService = {
  // Récupérer toutes les annonces (coupures) – éventuellement filtrées par quartier
  getAllAnnonces: async () => {
    const response = await fetch(`${API_BASE}/coupures`);
    if (!response.ok) throw new Error('Erreur chargement annonces');
    return response.json();
  },

  // Récupérer les annonces pour un quartier spécifique
  getAnnoncesByQuartier: async (quartier) => {
    const response = await fetch(`${API_BASE}/coupures?quartier=${encodeURIComponent(quartier)}`);
    if (!response.ok) throw new Error('Erreur chargement annonces par quartier');
    return response.json();
  },

  // Récupérer la liste des quartiers qui ont au moins une annonce
  getQuartiers: async () => {
    const all = await annonceService.getAllAnnonces();
    const quartiers = [...new Set(all.map(a => a.quartier))];
    return quartiers;
  }
};