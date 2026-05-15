import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuthStore } from '../store';
import { Zap, Plus, Trash2, Calendar, MapPin, AlertTriangle, Clock } from 'lucide-react';

const ElectriciteCitoyen = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  const [coupures, setCoupures] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [selectedQuartier, setSelectedQuartier] = useState('tous');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Formulaire nouvelle coupure (admin)
  const [form, setForm] = useState({
    quartier: '',
    titre: '',
    message: '',
    dateDebut: '',
    dateFin: ''
  });
  
  // Signalement urgent (citoyen)
  const [signalement, setSignalement] = useState({
    quartier: '',
    typeProbleme: '',
    lieuPrecis: '',
    description: '',
    nom: '',
    telephone: ''
  });
  const [signalementLoading, setSignalementLoading] = useState(false);
  const [signalementMessage, setSignalementMessage] = useState(null);

  const problemTypes = [
    { value: 'poteau_casse', label: '⚡ Poteau électrique cassé / tombé' },
    { value: 'cable_dangereux', label: '⚠️ Câble dangereux (tombé / exposé)' },
    { value: 'transformateur', label: '🔥 Transformateur explosion/fumée' },
    { value: 'cyclone_degats', label: '🌪️ Dégâts après cyclone' },
    { value: 'poteau_penche', label: '📐 Poteau penché risque chute' },
    { value: 'autre', label: '📞 Autre danger urgent' }
  ];

  const quartierList = [
    'Andrainjato Sud', 'Tanambao', 'Manodidona', 'Ambatovolo',
    'Tsaramandroso', 'Ambalakely', 'Antanimena', 'Mahamasina', 'Anjoma'
  ];

  // Charger les coupures
  useEffect(() => {
    const fetchCoupures = async () => {
      try {
        const params = selectedQuartier !== 'tous' ? { quartier: selectedQuartier } : {};
        const res = await API.get('/api/coupures', { params });
        setCoupures(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupures();
  }, [selectedQuartier]);

  // Admin : créer une coupure
  const handleCreateCoupure = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/coupures', form);
      setShowForm(false);
      setForm({ quartier: '', titre: '', message: '', dateDebut: '', dateFin: '' });
      // Recharger les coupures
      const res = await API.get('/api/coupures');
      setCoupures(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Admin : supprimer une coupure
  const handleDeleteCoupure = async (id) => {
    if (confirm('Supprimer cette coupure ?')) {
      await API.delete(`/api/coupures/${id}`);
      const res = await API.get('/api/coupures');
      setCoupures(res.data);
    }
  };

  // Citoyen : envoyer signalement urgent
  const handleSignalement = async (e) => {
    e.preventDefault();
    setSignalementLoading(true);
    setSignalementMessage(null);
    
    try {
      await API.post('/api/signalements', signalement);
      setSignalementMessage({ type: 'success', text: '✅ Signalement envoyé ! Les équipes sont alertées.' });
      setSignalement({
        quartier: '', typeProbleme: '', lieuPrecis: '', description: '', nom: '', telephone: ''
      });
    } catch (err) {
      setSignalementMessage({ type: 'error', text: '❌ Erreur lors de l\'envoi' });
    } finally {
      setSignalementLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Gestion de l'électricité
          </h1>
          <p className="text-gray-400 mt-2">
            {isAdmin ? 'Administration des coupures' : 'Consultez les coupures et signalez les incidents'}
          </p>
        </div>

        {/* ==================== SECTION COUPURES ==================== */}
        <div className="bg-gray-900/40 rounded-xl border border-cyan-500/30 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="text-cyan-400" size={20} />
              Coupures de courant prévues
            </h2>
            {isAdmin && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm"
              >
                <Plus size={16} />
                Annoncer une coupure
              </button>
            )}
          </div>

          {/* Filtre par quartier */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Filtrer par quartier</label>
            <select
              value={selectedQuartier}
              onChange={(e) => setSelectedQuartier(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="tous">Tous les quartiers</option>
              {quartierList.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          {/* Formulaire admin pour créer une coupure */}
          {isAdmin && showForm && (
            <form onSubmit={handleCreateCoupure} className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-white font-semibold mb-3">📢 Nouvelle coupure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400">Quartier *</label>
                  <select
                    value={form.quartier}
                    onChange={(e) => setForm({...form, quartier: e.target.value})}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    required
                  >
                    <option value="">Sélectionner</option>
                    {quartierList.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400">Titre *</label>
                  <input
                    type="text"
                    value={form.titre}
                    onChange={(e) => setForm({...form, titre: e.target.value})}
                    placeholder="Ex: Coupure programmée"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400">Date début *</label>
                  <input
                    type="datetime-local"
                    value={form.dateDebut}
                    onChange={(e) => setForm({...form, dateDebut: e.target.value})}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400">Date fin *</label>
                  <input
                    type="datetime-local"
                    value={form.dateFin}
                    onChange={(e) => setForm({...form, dateFin: e.target.value})}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                    placeholder="Détails de la coupure..."
                    rows="2"
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white">Publier</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">Annuler</button>
              </div>
            </form>
          )}

          {/* Liste des coupures */}
          {loading ? (
            <div className="text-center py-8 text-gray-400">Chargement...</div>
          ) : coupures.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Zap size={40} className="mx-auto mb-2 opacity-30" />
              Aucune coupure prévue pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {coupures.map((c) => (
                <div key={c._id} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 hover:border-cyan-500/30 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={16} className="text-yellow-400" />
                        <h3 className="text-white font-semibold">{c.titre}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{c.message}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {c.quartier}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(c.dateDebut).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> → {new Date(c.dateFin).toLocaleString()}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDeleteCoupure(c._id)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ==================== SECTION SIGNALEMENT URGENT ==================== */}
        <div className="bg-red-950/30 rounded-xl border border-red-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Signalement urgent – Jirama</h2>
              <p className="text-gray-400 text-sm">Danger immédiat (poteau cassé, câble au sol, transformateur qui fume) ? Prévenez les équipes techniques dès maintenant.</p>
            </div>
          </div>

          <form onSubmit={handleSignalement} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Quartier *</label>
                <select
                  value={signalement.quartier}
                  onChange={(e) => setSignalement({...signalement, quartier: e.target.value})}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  required
                >
                  <option value="">Sélectionnez</option>
                  {quartierList.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type de problème *</label>
                <select
                  value={signalement.typeProbleme}
                  onChange={(e) => setSignalement({...signalement, typeProbleme: e.target.value})}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  required
                >
                  <option value="">-- Choisissez --</option>
                  {problemTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Lieu précis *</label>
                <input
                  type="text"
                  value={signalement.lieuPrecis}
                  onChange={(e) => setSignalement({...signalement, lieuPrecis: e.target.value})}
                  placeholder="Ex: croisement rue X, devant l'école primaire"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Description détaillée *</label>
                <textarea
                  value={signalement.description}
                  onChange={(e) => setSignalement({...signalement, description: e.target.value})}
                  placeholder="Décrivez le danger (poteau penché, câble qui pend, risque d'accident...)"
                  rows="3"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Votre nom (optionnel)</label>
                <input
                  type="text"
                  value={signalement.nom}
                  onChange={(e) => setSignalement({...signalement, nom: e.target.value})}
                  placeholder="Pour vous recontacter"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Téléphone (optionnel)</label>
                <input
                  type="tel"
                  value={signalement.telephone}
                  onChange={(e) => setSignalement({...signalement, telephone: e.target.value})}
                  placeholder="Pour urgence"
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
            </div>

            {signalementMessage && (
              <div className={`p-3 rounded-lg ${signalementMessage.type === 'success' ? 'bg-green-950/50 text-green-400 border border-green-500/30' : 'bg-red-950/50 text-red-400 border border-red-500/30'}`}>
                {signalementMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={signalementLoading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {signalementLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <AlertTriangle size={18} />}
              {signalementLoading ? 'Envoi en cours...' : '🚨 ENVOYER SIGNALEMENT URGENT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ElectriciteCitoyen;