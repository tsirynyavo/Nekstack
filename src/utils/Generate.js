export const generateReport = async (dashboardData) => {
  const report = {
    team: "Vanquaire Team 4",
    date: new Date().toISOString(),
    timestamp: new Date().toLocaleString('fr-FR'),
    metrics: {
      performance: dashboardData?.stats?.speed || "0.2ms",
      availability: dashboardData?.stats?.availability || "99.99%",
      rank: dashboardData?.stats?.rank || "#1",
      teamSize: 4
    },
    systemHealth: dashboardData?.systemHealth || {
      status: "healthy",
      uptime: 120,
      memory: 128
    },
    achievements: [
      "🏆 Dark mode ultime",
      "🌀 3D animations",
      "📡 Offline support",
      "🔌 WebSocket real-time",
      "💾 Smart cache",
      "🎨 Glassmorphism design"
    ],
    recentActivity: dashboardData?.recentActivity || []
  };
  
  // Rapport JSON
  const jsonBlob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  
  const download = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  download(jsonUrl, `vanquaire-report-${Date.now()}.json`);
  
  return report;
};