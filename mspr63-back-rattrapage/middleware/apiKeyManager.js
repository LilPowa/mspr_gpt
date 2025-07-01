const crypto = require('crypto');

let currentApiKey = generateKey();
let lastUpdated = Date.now();

// genère une clé api de 32caracteres
function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}

// génération de la clé api toutes les heures
function refreshKeyIfNeeded() {
  const oneHour = 60 * 60 * 1000;
  const now = Date.now();
  if (now - lastUpdated >= oneHour) {
    currentApiKey = generateKey();
    lastUpdated = now;
  }
}

function getApiKey() {
  refreshKeyIfNeeded();
  return currentApiKey;
}

function validateApiKey(key) {
  refreshKeyIfNeeded();
  return key === currentApiKey;
}

module.exports = {
  getApiKey,
  validateApiKey,
};
