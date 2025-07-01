const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const especesRoutes = require('./routes/especes'); 
const authRoutes = require('./routes/auth'); 
const scanRoutes = require('./routes/scans'); 
const dashRoutes = require('./routes/dashboard');
const apiKeyRoutes = require('./routes/apiKey'); // ➕ route de debug pour voir la clé

const app = express();

// Middleware globaux
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/especes', especesRoutes); 
app.use('/api/auth', authRoutes); 
app.use('/api/scans', scanRoutes); 
app.use('/api/dashboard', dashRoutes);

// (DEV uniquement) Obtenir la clé API actuelle
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/key', apiKeyRoutes);
}

// Connexion MongoDB (uniquement si ce fichier est exécuté directement)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connexion MongoDB réussie');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erreur MongoDB :', err);
  });
}

module.exports = app;
