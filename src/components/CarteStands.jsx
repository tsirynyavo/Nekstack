import { useEffect, useState } from 'react';
import API from '../services/api';

const CarteStands = () => {
  const [stands, setStands] = useState([]);
  const [marches, setMarches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [standsRes, marchesRes] = await Promise.all([
          API.get('/option-b/stands'),
          API.get('/option-b/marches')
        ]);
        setStands(standsRes.data);
        setMarches(marchesRes.data);
      } catch (err) {
        console.error('Erreur chargement carte:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Pas de vert : couleurs sobres
  const getStatusStyle = (statut) => {
    switch (statut) {
      case 'libre':
        return 'bg-blue-600/20 border-blue-500 text-blue-300'; // bleu
      case 'reservé':
        return 'bg-amber-600/20 border-amber-500 text-amber-300'; // orange/ambre
      case 'occupé':
        return 'bg-gray-700/50 border-gray-500 text-gray-300'; // gris
      default:
        return 'bg-gray-800 border-gray-600 text-gray-400';
    }
  };

  const getStatusText = (statut) => {
    if (statut === 'libre') return 'Disponible';
    if (statut === 'reservé') return 'Réservé';
    return 'Occupé';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-cyan-400">Chargement de la carte interactive...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">🗺️ Carte interactive des marchés</h2>
        <p className="text-gray-400">Visualisez l’occupation des stands par quartier – mise à jour en temps réel</p>
      </div>

      {/* Légende (sans vert) */}
      <div className="flex flex-wrap gap-6 mb-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-600/60 border border-blue-400"></div>
          <span className="text-gray-300 text-sm">Libre / Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-600/60 border border-amber-400"></div>
          <span className="text-gray-300 text-sm">Réservé (en attente)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-600/60 border border-gray-400"></div>
          <span className="text-gray-300 text-sm">Occupé</span>
        </div>
      </div>

      {/* Grille des quartiers */}
      <div className="space-y-12">
        {marches.map((marche) => {
          const standsMarche = stands.filter(s => s.marche === marche);
          if (standsMarche.length === 0) return null;

          // Calcul des statistiques (sans vert)
          const libres = standsMarche.filter(s => s.statut === 'libre').length;
          const reserves = standsMarche.filter(s => s.statut === 'reservé').length;
          const occupes = standsMarche.filter(s => s.statut === 'occupé').length;

          return (
            <div key={marche} className="bg-gray-900/30 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
              {/* En-tête du quartier */}
              <div className="bg-gray-800/70 px-6 py-4 border-b border-gray-700">
                <div className="flex flex-wrap justify-between items-center">
                  <h3 className="text-xl font-semibold text-cyan-300">{marche}</h3>
                  <div className="flex gap-4 text-sm">
                    <span className="text-blue-300">🟢 {libres} libre(s)</span>
                    <span className="text-amber-300">🟠 {reserves} réservé(s)</span>
                    <span className="text-gray-400">⚫ {occupes} occupé(s)</span>
                  </div>
                </div>
              </div>

              {/* Liste des stands (grid responsive) */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {standsMarche.map((stand) => (
                    <div
                      key={stand._id}
                      className={`relative rounded-xl border p-4 transition-all hover:scale-[1.02] hover:shadow-xl ${getStatusStyle(stand.statut)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-lg font-bold">Stand {stand.numero}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-black/30 uppercase">
                          {getStatusText(stand.statut)}
                        </span>
                      </div>
                      <div className="text-2xl font-bold mb-1">{stand.superficieM2} m²</div>
                      <div className="text-sm opacity-80 flex justify-between">
                        <span>Zone : {stand.zone}</span>
                        {stand.statut === 'libre' && (
                          <span className="text-blue-200 text-xs">✅ immédiatement disponible</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {stands.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          Aucun stand enregistré pour le moment.
        </div>
      )}
    </div>
  );
};

export default CarteStands;