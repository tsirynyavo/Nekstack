import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, Calendar, MapPin, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Particles3D } from '../components/Particles3D';
import { annonceService } from '../services/annonceService';
import { signalementService } from '../services/signalementService';

const ElectriciteCitoyen = () => {
  // État pour les coupures
  const [coupures, setCoupures] = useState([]);
  const [quartierFiltre, setQuartierFiltre] = useState('');
  const [loadingCoupures, setLoadingCoupures] = useState(true);
  const [errorCoupures, setErrorCoupures] = useState(null);

  // État pour le formulaire de signalement
  const [formData, setFormData] = useState({
    quartier: '',
    typeProbleme: '',
    description: '',
    lieuPrecis: '',
    nom: '',
    telephone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // Liste des quartiers (à adapter selon ta réalité)
  const quartiers = [
    'Andrainjato Sud', 'Tanambao', 'Manodidona', 'Ambatovolo',
    'Tsaramandroso', 'Ambalakely', 'Antanimena', 'Ambatomena'
  ];

  const problemTypes = [
    { value: 'poteau_casse', label: '⚡ Poteau électrique cassé / tombé' },
    { value: 'cable_dangereux', label: '⚠️ Câble dangereux (tombé / exposé)' },
    { value: 'transformateur', label: '🔥 Transformateur explosion/fumée' },
    { value: 'cyclone_degats', label: '🌪️ Dégâts après cyclone (urgent)' },
    { value: 'poteau_penche', label: '📐 Poteau penché risque chute' },
    { value: 'autre', label: '📞 Autre danger urgent' }
  ];

  // Charger les coupures depuis le backend
  useEffect(() => {
    const fetchCoupures = async () => {
      try {
        setLoadingCoupures(true);
        const data = await annonceService.getAllAnnonces();
        setCoupures(data);
        setErrorCoupures(null);
      } catch (err) {
        console.error(err);
        setErrorCoupures('Impossible de charger les informations de coupure.');
      } finally {
        setLoadingCoupures(false);
      }
    };
    fetchCoupures();
  }, []);

  // Filtrer les coupures par quartier
  const filteredCoupures = quartierFiltre
    ? coupures.filter(c => c.quartier === quartierFiltre)
    : coupures;

  // Gestion du formulaire
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (submitResult) setSubmitResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.quartier || !formData.typeProbleme || !formData.description) {
      setSubmitResult({ success: false, message: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    setSubmitting(true);
    const result = await signalementService.sendUrgentReport(formData);
    setSubmitResult(result);
    if (result.success) {
      setFormData({
        quartier: '',
        typeProbleme: '',
        description: '',
        lieuPrecis: '',
        nom: '',
        telephone: ''
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      <Particles3D />
      <div className="fixed inset-0 bg-cyber-grid bg-grid pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-full mb-4">
            <Zap className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Électricité à Fianarantsoa
          </h1>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
            Consultez les coupures prévues par quartier et signalez tout danger (poteau cassé, câble tombé, etc.)
          </p>
        </motion.div>

        {/* Section : Coupures prévues */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <GlassCard className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="text-cyan-400" size={24} />
                Coupures de courant prévues
              </h2>
              <select
                value={quartierFiltre}
                onChange={(e) => setQuartierFiltre(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Tous les quartiers</option>
                {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>

            {loadingCoupures && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            )}

            {errorCoupures && (
              <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 text-red-300 text-center">
                {errorCoupures}
              </div>
            )}

            {!loadingCoupures && !errorCoupures && filteredCoupures.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucune coupure prévue pour le moment dans ce quartier.</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {filteredCoupures.map((coupure, idx) => (
                <motion.div
                  key={coupure.id || idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-gray-800/40 border-l-4 border-cyan-500 rounded-xl p-5 hover:bg-gray-800/60 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{coupure.titre || 'Coupure programmée'}</h3>
                      <p className="text-gray-300 mt-1">{coupure.message}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-sm">
                        <span className="flex items-center gap-1 text-cyan-400">
                          <MapPin size={14} /> {coupure.quartier}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Calendar size={14} /> {new Date(coupure.dateDebut || coupure.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="bg-cyan-500/20 px-2 py-1 rounded-full text-xs text-cyan-300 font-mono">
                      ÉLEC
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Section : Signalement urgent */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6 md:p-8 border-2 border-red-500/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Signalement urgent – Jirama</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Danger immédiat (poteau cassé, câble au sol, transformateur qui fume) ? Prévenez les équipes techniques dès maintenant.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-300 mb-1">Quartier *</label>
                  <select name="quartier" value={formData.quartier} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                    <option value="">Sélectionnez</option>
                    {quartiers.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Type de problème *</label>
                  <select name="typeProbleme" value={formData.typeProbleme} onChange={handleChange} required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                    <option value="">-- Choisissez --</option>
                    {problemTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Lieu précis *</label>
                <input
                  type="text"
                  name="lieuPrecis"
                  value={formData.lieuPrecis}
                  onChange={handleChange}
                  placeholder="Ex: croisement rue X, devant l'école primaire"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Description détaillée *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Décrivez le danger (poteau penché, câble qui pend, risque d'accident...)"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-300 mb-1">Votre nom (optionnel)</label>
                  <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Téléphone (optionnel)</label>
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white" />
                </div>
              </div>

              {submitResult && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${submitResult.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {submitResult.success ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  {submitResult.message}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {submitting ? 'Envoi en cours...' : 'Envoyer le signalement urgent'}
              </button>
            </form>
          </GlassCard>
        </motion.div>

      
      </div>
    </div>
  );
};

export default ElectriciteCitoyen;