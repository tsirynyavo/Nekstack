import { useState, useEffect } from 'react';
import API from '../services/api';

const AdminRegles = () => {
  const [regles, setRegles] = useState([]);
  const [nouvelle, setNouvelle] = useState({ categorieA: '', categorieB: '', compatible: false });

  useEffect(() => {
    API.get('/option-b/admin/regles').then(res => setRegles(res.data)).catch(() => {});
  }, []);

  const ajouter = async () => {
    await API.post('/option-b/admin/regles', nouvelle);
    const { data } = await API.get('/option-b/admin/regles');
    setRegles(data);
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-700">
      <h3 className="text-xl text-white mb-4">🔗 Règles de compatibilité produits</h3>
      <ul className="mb-4 space-y-1">
        {regles.map(r => <li key={r._id} className="text-gray-300">{r.categorieA} ↔ {r.categorieB} : {r.compatible ? 'compatible' : 'incompatible'}</li>)}
      </ul>
      <div className="flex gap-2 flex-wrap items-end">
        <div>
          <label className="block text-xs text-gray-400">Catégorie A</label>
          <input placeholder="ex: poisson" value={nouvelle.categorieA} onChange={e => setNouvelle({...nouvelle, categorieA: e.target.value})}
            className="bg-gray-800 border border-gray-700 rounded p-2 text-white" />
        </div>
        <div>
          <label className="block text-xs text-gray-400">Catégorie B</label>
          <input placeholder="ex: tissu" value={nouvelle.categorieB} onChange={e => setNouvelle({...nouvelle, categorieB: e.target.value})}
            className="bg-gray-800 border border-gray-700 rounded p-2 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={nouvelle.compatible} onChange={e => setNouvelle({...nouvelle, compatible: e.target.checked})}
            className="w-4 h-4" />
          <label className="text-gray-300">Compatible</label>
        </div>
        <button onClick={ajouter} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded text-white">Ajouter</button>
      </div>
    </div>
  );
};

export default AdminRegles;