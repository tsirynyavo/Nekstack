import { useState, useEffect } from 'react';
import API from '../services/api';

const AdminTarifs = () => {
  const [tarifs, setTarifs] = useState([]);
  const [nouveau, setNouveau] = useState({ marche: 'Mahamasina', zone: 'centre', prixParM2ParJour: 3000 });

  useEffect(() => {
    API.get('/option-b/admin/tarifs').then(res => setTarifs(res.data)).catch(() => {});
  }, []);

  const ajouter = async () => {
    await API.post('/option-b/admin/tarifs', nouveau);
    const { data } = await API.get('/option-b/admin/tarifs');
    setTarifs(data);
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-700">
      <h3 className="text-xl text-white mb-4">💰 Tarifs par zone</h3>
      <ul className="mb-4 space-y-1">
        {tarifs.map(t => <li key={t._id} className="text-gray-300">{t.marche} - {t.zone} : {t.prixParM2ParJour} Ar/m²/jour</li>)}
      </ul>
      <div className="flex gap-2 flex-wrap">
        <input placeholder="Zone" value={nouveau.zone} onChange={e => setNouveau({...nouveau, zone: e.target.value})}
          className="bg-gray-800 border border-gray-700 rounded p-2 text-white" />
        <input type="number" placeholder="Prix" value={nouveau.prixParM2ParJour} onChange={e => setNouveau({...nouveau, prixParM2ParJour: e.target.value})}
          className="bg-gray-800 border border-gray-700 rounded p-2 text-white" />
        <button onClick={ajouter} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded text-white">Ajouter</button>
      </div>
    </div>
  );
};

export default AdminTarifs;