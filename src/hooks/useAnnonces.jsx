import { useState, useEffect } from 'react';
import { annonceService } from '../services/annonceService';

export const useAnnonces = (quartierInitial = 'Andrainjato Sud') => {
  const [quartier, setQuartier] = useState(quartierInitial);
  const [annonces, setAnnonces] = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les annonces du quartier sélectionné
  const loadAnnonces = async () => {
    setLoading(true);
    try {
      const data = await annonceService.getAnnoncesByQuartier(quartier);
      setAnnonces(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger la liste des quartiers disponibles
  const loadQuartiers = async () => {
    try {
      const data = await annonceService.getQuartiers();
      setQuartiers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadQuartiers();
  }, []);

  useEffect(() => {
    loadAnnonces();
  }, [quartier]);

  return {
    quartier,
    setQuartier,
    annonces,
    quartiers,
    loading,
    error,
    reloadAnnonces: loadAnnonces
  };
};