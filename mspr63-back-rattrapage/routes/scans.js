const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const checkApiKey = require('../middleware/checkApiKey');

// Appliquer la vérification de la clé API à toutes les routes
router.use(checkApiKey);

// POST /api/scans/userscan
router.post('/userscan', async (req, res) => {
  try {
    const { photo, especeDetectee, email, confidence } = req.body;
    if (!photo || !especeDetectee || !email) {
      return res.status(400).json({ error: 'Champs manquants dans la requête.' });
    }

    const scan = new Scan({ photo, especeDetectee, email, confidence });
    await scan.save();

    res.status(201).json({ message: 'Scan enregistré avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du scan :', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/scans/all
router.get('/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const email = req.query.email;
    const espece = req.query.espece;

    const filter = {};
    if (email) filter.email = email;
    if (espece) filter.especeDetectee = espece;

    const skip = (page - 1) * limit;

    const scans = await Scan.find(filter, {
      photo: 1,
      especeDetectee: 1,
      confidence: 1,
      date: 1,
      email: 1,
      executionTimeMs: 1 // ✅ AJOUTÉ ICI
    })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Scan.countDocuments(filter);

    res.json({ scans, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Erreur récupération scans :', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// GET /api/scans/myscans
router.get('/myscans', async (req, res) => {
  try {
    const email = req.query.email;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    if (!email) return res.status(400).json({ message: 'Email requis.' });

    const scans = await Scan.find({ email }, { photo: 1, especeDetectee: 1, confidence: 1, date: 1 })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Scan.countDocuments({ email });

    res.json({
      scans,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error('Erreur récupération scans utilisateur :', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});


// GET /api/scans/countByPeriod
router.get('/countByPeriod', async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [dayCount, weekCount, monthCount, yearCount] = await Promise.all([
      Scan.countDocuments({ date: { $gte: startOfDay } }),
      Scan.countDocuments({ date: { $gte: startOfWeek } }),
      Scan.countDocuments({ date: { $gte: startOfMonth } }),
      Scan.countDocuments({ date: { $gte: startOfYear } }),
    ]);

    res.json({ dayCount, weekCount, monthCount, yearCount });
  } catch (err) {
    console.error('Erreur countByPeriod :', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/scans/countBySpecies
router.get('/countBySpecies', async (req, res) => {
  try {
    const result = await Scan.aggregate([
      { $group: { _id: "$especeDetectee", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(result);
  } catch (err) {
    console.error('Erreur countBySpecies :', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
