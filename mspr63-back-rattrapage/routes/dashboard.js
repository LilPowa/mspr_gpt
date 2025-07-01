const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const User = require('../models/User');
const moment = require('moment');

// Statistiques globales
// Statistiques globales (modifié)
router.get('/stats', async (req, res) => {
  const today = moment().startOf('day');
  const startOfWeek = moment().startOf('week');
  const startOfMonth = moment().startOf('month');
  const startOfYear = moment().startOf('year');

  const [todayCount, weekCount, monthCount, yearCount, userCount] = await Promise.all([
    Scan.countDocuments({ date: { $gte: today.toDate() } }),
    Scan.countDocuments({ date: { $gte: startOfWeek.toDate() } }),
    Scan.countDocuments({ date: { $gte: startOfMonth.toDate() } }),
    Scan.countDocuments({ date: { $gte: startOfYear.toDate() } }),
    User.countDocuments()
  ]);

  // Calcul temps moyen d'exécution et confiance moyenne (sur tous les scans)
  const avgStats = await Scan.aggregate([
    {
      $group: {
        _id: null,
        avgExecutionTime: { $avg: "$executionTimeMs" },
        avgConfidence: { $avg: "$confidence" }
      }
    }
  ]);

  const avgExecutionTime = avgStats[0]?.avgExecutionTime || 0;
  const avgConfidence = avgStats[0]?.avgConfidence || 0;

  res.json({
    today: todayCount,
    week: weekCount,
    month: monthCount,
    year: yearCount,
    users: userCount,
    avgExecutionTime: avgExecutionTime.toFixed(2), 
    avgConfidence: avgConfidence.toFixed(2)
  });
});


// Répartition par espèce
router.get('/species-distribution', async (req, res) => {
  const aggregation = await Scan.aggregate([
    { $group: { _id: '$especeDetectee', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const labels = aggregation.map(item => item._id);
  const counts = aggregation.map(item => item.count);

  res.json({ labels, counts });
});

router.get('/execution-evolution', async (req, res) => {
  try {
    const scans = await Scan.find(
      { executionTimeMs: { $exists: true } }, // filtrer uniquement ceux qui ont la valeur
      { executionTimeMs: 1, date: 1 }
    ).sort({ date: 1 }); // tri chronologique

    const labels = scans.map(scan => moment(scan.date).format('DD/MM/YYYY HH:mm'));
    const values = scans.map(scan => scan.executionTimeMs.toFixed(0));  // convertir en secondes

    res.json({ labels, values });
  } catch (error) {
    console.error('Erreur execution-evolution:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});
module.exports = router;
