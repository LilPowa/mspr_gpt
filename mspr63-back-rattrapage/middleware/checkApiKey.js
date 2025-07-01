const { validateApiKey } = require('./apiKeyManager');

function checkApiKey(req, res, next) {
  const apiKey = req.header('x-api-key');
  if (!apiKey || !validateApiKey(apiKey)) {
    return res.status(403).json({ error: 'Clé API invalide ou manquante.' });
  }
  next();
}

module.exports = checkApiKey;
