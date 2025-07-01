// test/routes/scans.test.js
const request = require('supertest');
const app = require('../../server');
const Scan = require('../../models/Scan');
jest.setTimeout(15000);

let apiKey;

beforeAll(async () => {
  // Récupère la clé API valide avant les tests
  const res = await request(app).get('/api/key/current');
  apiKey = res.body.apiKey;
});

afterEach(async () => {
  // Nettoie la base après chaque test
  await Scan.deleteMany({});
});

describe('Routes /api/scans', () => {
  describe('POST /userscan', () => {
    it('devrait enregistrer un scan valide', async () => {
      const res = await request(app)
        .post('/api/scans/userscan')
        .set('x-api-key', apiKey)
        .send({
          photo: 'image_base64',
          especeDetectee: 'Chêne',
          email: 'user@example.com',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Scan enregistré avec succès.');
    });

    it('devrait retourner une erreur si champs manquants', async () => {
      const res = await request(app)
        .post('/api/scans/userscan')
        .set('x-api-key', apiKey)
        .send({
          photo: 'image_base64',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /all', () => {
    it('devrait retourner une liste vide si aucun scan', async () => {
      const res = await request(app)
        .get('/api/scans/all')
        .set('x-api-key', apiKey);

      expect(res.statusCode).toBe(200);
      expect(res.body.scans).toEqual([]);
      expect(res.body.total).toBe(0);
    });
  });

  describe('GET /myscans', () => {
    it('devrait retourner une erreur sans email', async () => {
      const res = await request(app)
        .get('/api/scans/myscans')
        .set('x-api-key', apiKey);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Email requis.');
    });
  });

  describe('GET /countByPeriod', () => {
    it('devrait retourner des stats (valeurs numériques)', async () => {
      const res = await request(app)
        .get('/api/scans/countByPeriod')
        .set('x-api-key', apiKey);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('dayCount');
      expect(typeof res.body.dayCount).toBe('number');
    });
  });

  describe('GET /countBySpecies', () => {
    it('devrait retourner un tableau vide sans données', async () => {
      const res = await request(app)
        .get('/api/scans/countBySpecies')
        .set('x-api-key', apiKey);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('🔒 Clé API invalide', () => {
    it('devrait rejeter une requête avec mauvaise clé', async () => {
      const res = await request(app)
        .get('/api/scans/all')
        .set('x-api-key', 'cle-fausse');

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBe('Clé API invalide ou manquante.');
    });
  });
});
