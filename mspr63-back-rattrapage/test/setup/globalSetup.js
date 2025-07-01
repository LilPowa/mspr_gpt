const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Sauvegarder l'URI dans mongoUri.txt pour tests et globalTeardown
  fs.writeFileSync(path.resolve(__dirname, 'mongoUri.txt'), uri);

  // Sauvegarder le serveur dans global pour le stopper ensuite
  global.__MONGO_SERVER__ = mongoServer;
};
