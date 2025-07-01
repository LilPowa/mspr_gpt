const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const Espece = require('../models/Espece');
const Scan = require('../models/Scan');
const checkApiKey = require('../middleware/checkApiKey');

// Middleware API Key
router.use(checkApiKey);

// Ajouter une espèce
router.post('/', async (req, res) => {
  try {
    const espece = new Espece(req.body);
    await espece.save();
    res.status(201).json({ message: 'Espèce ajoutée avec succès', espece });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtenir les espèces avec pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const especes = await Espece.find().skip(skip).limit(limit);
    const total = await Espece.countDocuments();

    res.status(200).json({
      data: especes,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modifier une espèce
router.put('/:id', async (req, res) => {
  try {
    const espece = await Espece.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!espece) return res.status(404).json({ message: 'Espèce non trouvée' });
    res.json({ message: 'Espèce modifiée avec succès', espece });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer une espèce
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Espece.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Espèce non trouvée' });
    res.json({ message: 'Espèce supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir une espèce aléatoire
router.get('/random', async (req, res) => {
  try {
    const count = await Espece.countDocuments();
    if (count === 0) return res.status(404).json({ message: 'Aucune espèce trouvée' });

    const randomIndex = Math.floor(Math.random() * count);
    const randomEspece = await Espece.findOne().skip(randomIndex);

    res.status(200).json(randomEspece);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir toutes les espèces (simplifié)
router.get('/all', async (req, res) => {
  try {
    const especes = await Espece.find({}, 'espece image').sort({ espece: 1 });
    res.json(especes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir une espèce par son nom (fiche détaillée)
router.get('/nom/:espece', async (req, res) => {
  try {
    const espece = await Espece.findOne({ espece: req.params.espece });
    if (!espece) return res.status(404).json({ message: 'Espèce non trouvée' });
    res.json(espece);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Classification d'une photo
router.post('/classify', async (req, res) => {
  try {
    const { photo, email } = req.body;
    if (!photo) return res.status(400).json({ error: 'Image manquante.' });

    const matches = photo.match(/^data:image\/png;base64,(.+)$/);
    if (!matches) return res.status(400).json({ error: 'Format base64 invalide.' });

    const imageBuffer = Buffer.from(matches[1], 'base64');
    const filename = `${uuidv4()}.png`;
    const imagePath = path.join(__dirname, '/uploads', filename);

    fs.writeFileSync(imagePath, imageBuffer);

    const pythonScript = path.join(__dirname, '../Model/test_model.py');
    const command = `python "${pythonScript}" "${imagePath}"`;

    exec(command, async (error, stdout, stderr) => {
      fs.unlinkSync(imagePath);

      if (error) {
        console.error('Erreur script Python :', stderr);
        return res.status(500).json({ error: 'Erreur de classification.' });
      }

      try {
        const result = JSON.parse(stdout);
        const predicted = result.predicted_species;
        const confidence = result.probabilities?.[0]?.[1] || null;
        const execution_time = result.execution_time || null;

        const species = await Espece.findOne({ espece: predicted });

        if (email) {
          await Scan.create({
            photo,
            especeDetectee: predicted,
            email,
            confidence,
            executionTimeMs: execution_time 
          });
        }

        if (species) {
          return res.json({ match: true, data: species, predicted_species: predicted, confidence, execution_time });
        } else {
          return res.json({ match: false, predicted_species: predicted, confidence, execution_time });
        }
      } catch (parseError) {
        console.error('Erreur parsing JSON:', parseError);
        return res.status(500).json({ error: 'Erreur de traitement de la réponse.' });
      }
    });

  } catch (err) {
    console.error('Erreur /classify :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});
module.exports = router;
