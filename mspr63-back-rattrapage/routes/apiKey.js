const express = require('express');
const router = express.Router();
const { getApiKey } = require('../middleware/apiKeyManager');

router.get('/current', (req, res) => {
  res.json({ apiKey: getApiKey() });
});

module.exports = router;
