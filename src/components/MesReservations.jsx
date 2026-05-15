import { useEffect, useState } from 'react';
import API from '../services/api';
import { Clock, CheckCircle, XCircle, CreditCard, MapPin, Calendar, Ruler, QrCode } from 'lucide-react';

const MesReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await API.get('/option-b/mes-reservations');
        setReservations(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const getStatusBadge = (decision, statutPaiement) => {
    if (decision === 'accepté') {
      return { text: 'Acceptée', icon: CheckCircle, bg: 'bg-green-600/20 text-green-400 border-green-500' };
    }
    if (decision === 'refusé') {
      return { text: 'Refusée', icon: XCircle, bg: 'bg-red-600/20 text-red-400 border-red-500' };
    }
    if (statutPaiement === 'capturé') {
      return { text: 'En attente validation', icon: Clock, bg: 'bg-yellow-600/20 text-yellow-400 border-yellow-500' };
    }
    return { text: 'En attente', icon: Clock, bg: 'bg-gray-600/20 text-gray-400 border-gray-500' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Mes réservations
          </h1>
          <p className="text-gray-400 mt-2">Suivez l'état de vos demandes de stand</p>
        </div>

        {reservations.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/40 rounded-2xl border border-gray-700">
            <p className="text-gray-400">Aucune réservation pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((resa) => {
              const status = getStatusBadge(resa.decisionAdmin, resa.statutPaiement);
              const StatusIcon = status.icon;
              
              return (
                <div key={resa._id} className="bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-cyan-500/50 transition-all">
                  <div className="p-5">
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                      <div>
                        <p className="text-xl font-semibold text-white">{resa.marche}</p>
                        <p className="text-gray-400 text-sm">Zone {resa.zoneSouhaitee}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${status.bg}`}>
                        <StatusIcon size={14} />
                        <span className="text-xs font-medium">{status.text}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Ruler size={16} />
                        <span className="text-sm">{resa.superficieM2} m²</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar size={16} />
                        <span className="text-sm">
                          {new Date(resa.dateDebut).toLocaleDateString()} → {new Date(resa.dateFin).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <CreditCard size={16} />
                        <span className="text-sm">{resa.prixTotal.toLocaleString()} Ar</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin size={16} />
                        <span className="text-sm capitalize">{resa.methodePaiement}</span>
                      </div>
                    </div>

                    {resa.qrCode && (
                      <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-cyan-400">
                          <QrCode size={16} />
                          <span className="text-sm">QR code généré</span>
                        </div>
                        <img src={resa.qrCode} alt="QR Code" className="w-12 h-12 rounded border border-gray-600" />
                      </div>
                    )}

                    {resa.decisionAdmin === 'refusé' && resa.raisonRefus && (
                      <div className="mt-3 p-2 bg-red-950/30 rounded-lg text-red-300 text-sm">
                        Raison : {resa.raisonRefus}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesReservations;