const fs = require('fs');
const path = require('path');

module.exports = async () => {
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop();
  }

  // Supprimer mongoUri.txt
  const uriPath = path.resolve(__dirname, 'mongoUri.txt');
  if (fs.existsSync(uriPath)) {
    fs.unlinkSync(uriPath);
  }
};
