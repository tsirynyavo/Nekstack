const API_BASE = 'http://localhost:5000/api';

export const signalementService = {
  sendUrgentReport: async (reportData) => {
    try {
      const response = await fetch(`${API_BASE}/signalements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quartier: reportData.quartier,
          typeProbleme: reportData.typeProbleme,
          description: reportData.description,
          lieuPrecis: reportData.lieuPrecis || reportData.quartier,
          nomCitoyen: reportData.nom || 'Anonyme',
          telephone: reportData.telephone || '',
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l’envoi');
      }
      const data = await response.json();
      return { success: true, message: 'Signalement envoyé avec succès', data };
    } catch (error) {
      console.error('Erreur envoi signalement:', error);
      return { success: false, message: error.message };
    }
  }
};