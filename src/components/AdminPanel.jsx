import { useEffect, useState } from 'react';
import API from '../services/api';
import AdminTarifs from './AdminTarifs';
import AdminRegles from './AdminRegles';

const AdminPanel = () => {
  const [demandes, setDemandes] = useState([]);

  const fetchDemandes = async () => {
    try {
      const { data } = await API.get('/option-b/admin/demandes');
      setDemandes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (id) => {
    await API.put(`/option-b/admin/accepter/${id}`);
    fetchDemandes();
  };

  const handleReject = async (id, raison) => {
    await API.put(`/option-b/admin/refuser/${id}`, { raison });
    fetchDemandes();
  };

  useEffect(() => { fetchDemandes(); }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-gray-900/50 backdrop-blur-md rounded-xl border border-cyan-500/30">
      <h2 className="text-2xl font-bold text-cyan-300 mb-6">👑 Administration Option B</h2>
      
      <h3 className="text-xl text-white mb-4">Demandes en attente</h3>
      {demandes.length === 0 ? (
        <p className="text-gray-400">Aucune demande en attente.</p>
      ) : (
        <div className="space-y-4 mb-8">
          {demandes.map(d => (
            <div key={d._id} className="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
              <p><span className="text-cyan-400">Commerçant :</span> {d.commercant?.nom} ({d.commercant?.email})</p>
              <p><span className="text-cyan-400">Zone :</span> {d.zoneSouhaitee} | Surface : {d.superficieM2}m² | Dates : {new Date(d.dateDebut).toLocaleDateString()} → {new Date(d.dateFin).toLocaleDateString()}</p>
              <p><span className="text-cyan-400">Total :</span> {d.prixTotal} Ar | Paiement : {d.methodePaiement}</p>
              <div className="mt-3 flex gap-3">
                <button onClick={() => handleAccept(d._id)} className="bg-green-600 hover:bg-green-500 px-4 py-1 rounded text-white">✅ Accepter</button>
                <button onClick={() => handleReject(d._id, 'Indisponible')} className="bg-red-600 hover:bg-red-500 px-4 py-1 rounded text-white">❌ Refuser</button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <AdminTarifs />
      <AdminRegles />
    </div>
  );
};

export default AdminPanel;