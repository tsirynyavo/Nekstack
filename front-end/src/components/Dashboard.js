// 📁 src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  EventAvailable as PresenceIcon,
  BeachAccess as CongeIcon,
  History as HistoryIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import { 
  PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import "./Dashboard.css";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5050/dashboard/stats');
      if (!response.ok) throw new Error('Erreur chargement données');
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box className="dashboard-container">
      <Typography variant="h4" className="dashboard-title">
        Tableau de Bord RH
      </Typography>

      {/* TOUS LES 5 BLOCS KPI ALIGNÉS HORIZONTALEMENT */}
      <Grid container spacing={2} className="kpi-grid">
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="Employés"
            value={dashboardData?.kpis?.employesActifs || 0}
            subtitle={`${dashboardData?.kpis?.totalEmployes || 0} au total`}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="Présents Aujourd'hui"
            value={dashboardData?.kpis?.presencesAujourdhui || 0}
            subtitle={`${dashboardData?.kpis?.absentsAujourdhui || 0} absents`}
            icon={<PresenceIcon />}
            color="#2e7d32"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="Tâches en Cours"
            value={dashboardData?.kpis?.tachesEnCours || 0}
            subtitle="À compléter"
            icon={<TaskIcon />}
            color="#d32f2f"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="Anciens Employés"
            value={dashboardData?.kpis?.anciensEmployes || 0}
            subtitle="Licenciés • Démission • Retraite"
            icon={<HistoryIcon />}
            color="#757575"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard
            title="Congés en Attente"
            value={dashboardData?.kpis?.congesEnAttente || 0}
            subtitle="Demandes à valider"
            icon={<CongeIcon />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      {/* GRAPHIQUES ALIGNÉS HORIZONTALEMENT EN BAS */}
      <Grid container spacing={3} className="charts-grid">
        {/* Graphique linéaire - ÉVOLUTION PRÉSENCES */}
        <Grid item xs={12} md={8}>
          <Paper className="chart-paper">
            <Typography variant="h5" className="chart-title">
              Évolution des Présences (30 derniers jours)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData?.graphiques?.evolutionPresences || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="présences" 
                  stroke="#8884d8" 
                  strokeWidth={3}
                  dot={{ fill: '#8884d8', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Présences"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Camembert - DÉPARTEMENTS */}
        <Grid item xs={12} md={5}>
          <Paper className="chart-paper">
            <Typography variant="h5" className="chart-title">
              Répartition par Département
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={dashboardData?.graphiques?.repartitionDepartements || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(dashboardData?.graphiques?.repartitionDepartements || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  ); 
};

// Composant Carte KPI
const KPICard = ({ title, value, subtitle, icon, color, small = false }) => (
  <Card className={small ? "kpi-card kpi-card-small" : "kpi-card"}>
    <CardContent className="kpi-card-content">
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography className="kpi-title">
            {title}
          </Typography>
          <Typography className={small ? "kpi-value kpi-value-small" : "kpi-value"} style={{ color }}>
            {value}
          </Typography>
          <Typography className={small ? "kpi-subtitle kpi-subtitle-small" : "kpi-subtitle"}>
            {subtitle}
          </Typography>
        </Box>
        <Box className="kpi-icon" sx={{ color, fontSize: small ? 26 : 30 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default Dashboard;