import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuthStore } from '../store';
import { CreditCard, Smartphone, Calendar, MapPin, Ruler, CheckCircle, AlertCircle, ArrowRight, Send } from 'lucide-react';

const FormulaireReservation = () => {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    marche: '',
    zoneSouhaitee: 'centre',
    superficieM2: 10,
    dateDebut: '',
    dateFin: '',
    methodePaiement: 'mvola',
    estRecurrent: false
  });
  
  const [marches, setMarches] = useState([]);
  const [prixTotal, setPrixTotal] = useState(null);
  const [prixUnitaire] = useState(1000);
  const [numeroAdmin, setNumeroAdmin] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paiementVerifie, setPaiementVerifie] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [etape, setEtape] = useState(1); // 1: formulaire, 2: paiement, 3: confirmation

  // Charger les marchés
  useEffect(() => {
    const fetchMarches = async () => {
      try {
        const res = await API.get('/option-b/marches');
        setMarches(res.data);
        if (res.data.length > 0) {
          setForm(prev => ({ ...prev, marche: res.data[0] }));
        }
      } catch (err) {
        setMarches(['Mahamasina', 'Tanambao', 'Anjoma', 'Tsarandolo', 'Ampasambazaha']);
        setForm(prev => ({ ...prev, marche: 'Mahamasina' }));
      }
    };
    const fetchNumeroAdmin = async () => {
      try {
        const res = await API.get('/option-b/numero-admin');
        setNumeroAdmin(res.data.numero);
      } catch (err) {
        setNumeroAdmin('034 00 00 01');
      }
    };
    fetchMarches();
    fetchNumeroAdmin();
  }, []);

  // Calculer le prix total
  useEffect(() => {
    if (form.superficieM2 && form.dateDebut && form.dateFin) {
      const start = new Date(form.dateDebut);
      const end = new Date(form.dateFin);
      const days = Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;
      if (days > 0) {
        const total = prixUnitaire * form.superficieM2 * days;
        setPrixTotal(total);
      } else {
        setPrixTotal(null);
      }
    }
  }, [prixUnitaire, form.superficieM2, form.dateDebut, form.dateFin]);

  const joursTotal = () => {
    if (form.dateDebut && form.dateFin) {
      const start = new Date(form.dateDebut);
      const end = new Date(form.dateFin);
      return Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;
    }
    return 0;
  };

  const verifierPaiement = async () => {
    if (!transactionId.trim()) {
      setMessage({ type: 'error', text: 'Veuillez entrer le numéro de transaction' });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await API.post('/option-b/verifier-paiement', {
        transactionId: transactionId.trim(),
        montant: prixTotal,
        methodePaiement: form.methodePaiement
      });
      
      if (res.data.success) {
        setPaiementVerifie(true);
        setMessage({ type: 'success', text: '✅ Paiement vérifié ! Vous pouvez maintenant envoyer la demande.' });
        setEtape(3);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Échec de la vérification du paiement' });
    } finally {
      setIsLoading(false);
    }
  };

  const envoyerDemande = async () => {
    if (!paiementVerifie) {
      setMessage({ type: 'error', text: 'Veuillez d\'abord vérifier votre paiement' });
      return;
    }
    
    setIsLoading(true);
    try {
      const { data } = await API.post('/option-b/reservation', { 
        ...form, 
        transactionId: transactionId.trim(),
        prixTotal 
      });
      setMessage({ type: 'success', text: `✅ Demande envoyée avec succès ! En attente de validation par l'administrateur.` });
      setEtape(1);
      // Réinitialiser le formulaire
      setForm(prev => ({ ...prev, dateDebut: '', dateFin: '', superficieM2: 10 }));
      setTransactionId('');
      setPaiementVerifie(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'envoi' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Réserver un stand
          </h1>
          <p className="text-gray-400 mt-2">Attribution flexible et transparente des espaces commerciaux</p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  etape >= step ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-gray-700 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-0.5 mx-2 transition-all ${etape > step ? 'bg-cyan-500' : 'bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Carte principale */}
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-2xl overflow-hidden">
          {/* Étape 1 : Formulaire de réservation */}
          {etape === 1 && (
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <MapPin className="text-cyan-400" size={20} />
                Informations du stand
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Marché / Quartier</label>
                  <select
                    value={form.marche}
                    onChange={(e) => setForm({ ...form, marche: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  >
                    {marches.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Zone</label>
                  <select
                    value={form.zoneSouhaitee}
                    onChange={(e) => setForm({ ...form, zoneSouhaitee: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  >
                    <option value="entrée">Entrée (prime)</option>
                    <option value="centre">Centre</option>
                    <option value="fond">Fond</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Ruler size={16} className="inline mr-1" />
                    Superficie (m²)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.superficieM2}
                    onChange={(e) => setForm({ ...form, superficieM2: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Période
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={form.dateDebut}
                      onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    />
                    <input
                      type="date"
                      value={form.dateFin}
                      onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Smartphone size={16} className="inline mr-1" />
                    Moyen de paiement
                  </label>
                  <select
                    value={form.methodePaiement}
                    onChange={(e) => setForm({ ...form, methodePaiement: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  >
                    <option value="mvola">MVola</option>
                    <option value="orangemoney">Orange Money</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.estRecurrent}
                      onChange={(e) => setForm({ ...form, estRecurrent: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-gray-300">Réservation récurrente (chaque semaine)</span>
                  </label>
                </div>
              </div>

              {/* Récapitulatif */}
              {prixTotal && joursTotal() > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-cyan-950/50 to-purple-950/50 rounded-xl border border-cyan-500/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-400 text-sm">Tarif : {prixUnitaire} Ar/m²/jour</p>
                      <p className="text-gray-400 text-sm">{form.superficieM2} m² × {joursTotal()} jours</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Total estimé</p>
                      <p className="text-2xl font-bold text-cyan-300">{prixTotal.toLocaleString()} Ar</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (form.dateDebut && form.dateFin && form.superficieM2) {
                    setEtape(2);
                  } else {
                    setMessage({ type: 'error', text: 'Veuillez remplir tous les champs' });
                  }
                }}
                className="mt-6 w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Étape 2 : Paiement */}
          {etape === 2 && (
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <CreditCard className="text-cyan-400" size={20} />
                Paiement
              </h2>

              {/* Instructions de paiement */}
              {/* Instructions de paiement - numéro Telma unique */}
<div className="bg-yellow-950/30 border border-yellow-600/30 rounded-xl p-6 mb-6">
  <p className="text-yellow-300 font-medium mb-3">📞 Effectuez le paiement sur :</p>
  <div className="flex items-center justify-between gap-4">
    <div className="bg-gray-800/80 rounded-lg p-3 flex-1 text-center">
      <Smartphone className="mx-auto mb-2 text-cyan-400" size={24} />
      <p className="text-gray-400 text-sm">Yas / MVola</p>
      <p className="text-xl font-bold text-white">{numeroAdmin}</p>
      <p className="text-gray-500 text-xs">(Mairie de Fianarantsoa)</p>
    </div>
    <div className="text-3xl text-cyan-400">→</div>
    <div className="bg-gray-800/80 rounded-lg p-3 flex-1 text-center">
      <p className="text-cyan-300 font-bold text-lg">{prixTotal?.toLocaleString()} Ar</p>
      <p className="text-gray-400 text-sm">Montant à payer</p>
    </div>
  </div>
  <p className="text-center text-gray-500 text-xs mt-3">
    Paiement sécurisé via MVola (Yas) – Numéro unique de la mairie
  </p>
</div>
                

              {/* Formulaire de transaction */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Numéro de transaction (reçu après paiement)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Ex: TXN_20260114_123456"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Le numéro de transaction vous a été envoyé par SMS après votre paiement
                  </p>
                </div>

                <button
                  onClick={verifierPaiement}
                  disabled={isLoading || !transactionId.trim()}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Vérifier le paiement
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 : Confirmation */}
          {etape === 3 && (
            <div className="p-6 md:p-8 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Paiement vérifié !</h2>
              <p className="text-gray-400 mb-6">
                Votre paiement de <span className="text-cyan-300 font-bold">{prixTotal?.toLocaleString()} Ar</span> a été confirmé.
                <br />Vous pouvez maintenant soumettre votre demande.
              </p>

              <div className="bg-gray-800/50 rounded-xl p-4 mb-6 text-left">
                <p className="text-gray-400 text-sm mb-2">Récapitulatif :</p>
                <p className="text-white">📌 {form.marche} - Zone {form.zoneSouhaitee}</p>
                <p className="text-white">📐 {form.superficieM2} m²</p>
                <p className="text-white">📅 Du {new Date(form.dateDebut).toLocaleDateString()} au {new Date(form.dateFin).toLocaleDateString()}</p>
                <p className="text-white">💰 {prixTotal?.toLocaleString()} Ar</p>
                <p className="text-gray-500 text-sm mt-2">Transaction : {transactionId}</p>
              </div>

              <button
                onClick={envoyerDemande}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send size={18} />
                )}
                Envoyer la demande à l'admin
              </button>
            </div>
          )}

          {/* Messages */}
          {message.text && (
            <div className={`mx-6 mb-6 p-3 rounded-xl flex items-center gap-2 ${
              message.type === 'error' ? 'bg-red-950/50 border border-red-500/30 text-red-300' : 'bg-green-950/50 border border-green-500/30 text-green-300'
            }`}>
              {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormulaireReservation;