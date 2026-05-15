import { useEffect, useState } from 'react';
import API from '../services/api';

const Classement = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    API.get('/option-b/classement').then(res => setScores(res.data)).catch(() => {});
  }, []);

  const demo = [
    { commercant: { nom: 'Rakoto Alina' }, valeur: 95, anciennetePoints: 28, presencePoints: 30 },
    { commercant: { nom: 'Rabe Jaona' }, valeur: 72, anciennetePoints: 15, presencePoints: 25 },
  ];
  const data = scores.length ? scores : demo;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-900/50 backdrop-blur-md rounded-xl border border-cyan-500/30">
      <h2 className="text-2xl font-bold text-cyan-300 mb-6">🏆 Classement des commerçants (score dynamique)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800/50 rounded-lg">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Commerçant</th>
              <th className="px-4 py-2 text-center">Score</th>
              <th className="px-4 py-2 text-center">Ancienneté</th>
              <th className="px-4 py-2 text-center">Présence</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s, idx) => (
              <tr key={idx} className="border-t border-gray-700">
                <td className="px-4 py-2 font-medium">{s.commercant?.nom || 'Inconnu'}</td>
                <td className="px-4 py-2 text-center text-cyan-300 font-bold">{s.valeur}</td>
                <td className="px-4 py-2 text-center">{s.anciennetePoints}</td>
                <td className="px-4 py-2 text-center">{s.presencePoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Classement;