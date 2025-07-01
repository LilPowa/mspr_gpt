const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Scan = require('../models/Scan');
const bcrypt = require('bcryptjs');

const checkApiKey = require('../middleware/checkApiKey');
router.use(checkApiKey);

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, nom, prenom } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Utilisateur déjà existant.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, nom, prenom });

    await newUser.save();
    res.status(201).json({ message: 'Inscription réussie.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Utilisateur non trouvé.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect.' });

    res.status(200).json({
      message: 'Connexion réussie.',
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// Récupération profil
router.get('/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email requis.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    res.status(200).json({
      email: user.email,
      nom: user.nom,
      prenom: user.prenom
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// Mise à jour profil
router.put('/profile', async (req, res) => {
  try {
    const { email, password, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect.' });

    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.status(200).json({ message: 'Profil mis à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// Suppression profil
router.delete('/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email requis.' });

    const result = await User.deleteOne({ email });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.status(200).json({ message: 'Compte supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// Liste utilisateurs avec pagination
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const emails = users.map(u => u.email);
    const counts = await Scan.aggregate([
      { $match: { email: { $in: emails } } },
      { $group: { _id: "$email", count: { $sum: 1 } } }
    ]);

    const countsMap = {};
    counts.forEach(c => { countsMap[c._id] = c.count; });

    const usersWithCounts = users.map(u => ({
      email: u.email,
      nom: u.nom,
      prenom: u.prenom,
      createdAt: u.createdAt,
      scanCount: countsMap[u.email] || 0
    }));

    res.json({
      users: usersWithCounts,
      page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', error: err.message });
  }
});

// Total utilisateurs
router.get('/totalUsers', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ totalUsers: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
