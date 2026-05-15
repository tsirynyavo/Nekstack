import { useEffect, useState } from 'react';
import API from '../services/api';
import { CheckCircle, XCircle, Clock, RefreshCw, User, MapPin, Calendar, DollarSign } from 'lucide-react';

const AdminStandPanel = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/option-b/admin/demandes');
      setDemandes(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur de chargement des demandes' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await API.put(`/option-b/admin/accepter/${id}`);
      setMessage({ type: 'success', text: '✅ Demande acceptée avec succès' });
      fetchDemandes();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'acceptation' });
    }
  };

  const handleReject = async (id) => {
    const raison = prompt('Raison du refus :', 'Stand non disponible');
    if (!raison) return;
    try {
      await API.put(`/option-b/admin/refuser/${id}`, { raison });
      setMessage({ type: 'success', text: '❌ Demande refusée' });
      fetchDemandes();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors du refus' });
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Administration des stands
            </h1>
            <p className="text-gray-400 mt-1">Gérez les demandes de réservation des commerçants</p>
          </div>
          <button
            onClick={fetchDemandes}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
          >
            <RefreshCw size={18} className="text-cyan-400" />
            <span>Rafraîchir</span>
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-3 rounded-xl ${
            message.type === 'error' 
              ? 'bg-red-950/50 border border-red-500/30 text-red-300' 
              : 'bg-green-950/50 border border-green-500/30 text-green-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Liste des demandes */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        ) : demandes.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/40 rounded-2xl border border-gray-700">
            <p className="text-gray-400">Aucune demande en attente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {demandes.map((d) => (
              <div key={d._id} className="bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-cyan-500/50 transition-all">
                <div className="p-5">
                  {/* En-tête */}
                  <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                        <User size={20} className="text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{d.commercant?.nom || 'Commerçant'}</p>
                        <p className="text-gray-400 text-sm">{d.commercant?.email}</p>
                        <p className="text-gray-500 text-xs">Tél: {d.commercant?.telephone || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-600/20 rounded-full border border-yellow-500">
                      <Clock size={14} className="text-yellow-400" />
                      <span className="text-yellow-400 text-xs">En attente</span>
                    </div>
                  </div>

                  {/* Détails */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin size={16} />
                      <span className="text-sm">{d.marche} - {d.zoneSouhaitee}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="text-sm">{d.superficieM2} m²</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={16} />
                      <span className="text-sm">
                        {new Date(d.dateDebut).toLocaleDateString()} → {new Date(d.dateFin).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <DollarSign size={16} />
                      <span className="text-sm font-medium text-cyan-300">{d.prixTotal.toLocaleString()} Ar</span>
                    </div>
                  </div>

                  {/* Transaction */}
                  <div className="mb-4 p-2 bg-gray-800/30 rounded-lg">
                    <p className="text-gray-500 text-xs">
                      Transaction: {d.transactionId || 'Non spécifiée'} | 
                      Paiement: {d.methodePaiement === 'mvola' ? 'MVola' : 'Orange Money'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-3 border-t border-gray-700">
                    <button
                      onClick={() => handleAccept(d._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition border border-green-500/30"
                    >
                      <CheckCircle size={16} />
                      Accepter
                    </button>
                    <button
                      onClick={() => handleReject(d._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition border border-red-500/30"
                    >
                      <XCircle size={16} />
                      Refuser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStandPanel;