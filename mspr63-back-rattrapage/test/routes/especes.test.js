const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const Espece = require('../../models/Espece');
jest.setTimeout(15000);

let apiKey = '';

const validEspece = {
  espece: 'Chene',
  description: 'Arbre feuillu',
  nomLatin: 'Quercus robur',
  famille: 'Fagacées',
  taille: '20-40m',
  region: 'Europe',
  habitat: 'Forêts tempérées',
  funFact: 'Peut vivre plus de 1000 ans',
  image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAU='
};

beforeAll(async () => {
  const res = await request(app).get('/api/key/current');
  apiKey = res.body.apiKey;
});

afterEach(async () => {
  await Espece.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Routes /api/especes', () => {
  it('POST / -> créer une espèce', async () => {
    const res = await request(app)
      .post('/api/especes')
      .set('x-api-key', apiKey)
      .send(validEspece);

    expect(res.status).toBe(201);
    expect(res.body.espece.espece).toBe('Chene');
  });

  it('GET / -> liste paginée', async () => {
    await Espece.create([
      { ...validEspece, espece: 'Chene' },
      { ...validEspece, espece: 'Hêtre' },
      { ...validEspece, espece: 'Sapin' }
    ]);

    const res = await request(app)
      .get('/api/especes')
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThan(0);
  });

  it('GET /all -> liste simplifiée', async () => {
    await Espece.create({ ...validEspece, espece: 'Chene' });

    const res = await request(app)
      .get('/api/especes/all')
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body[0].espece).toBe('Chene');
  });

  it('GET /random -> une espèce aléatoire', async () => {
    await Espece.create({ ...validEspece, espece: 'Chene' });

    const res = await request(app)
      .get('/api/especes/random')
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body.espece).toBe('Chene');
  });

  it('GET /nom/:espece -> fiche par nom', async () => {
    await Espece.create({ ...validEspece, espece: 'Chene', description: 'Arbre' });

    const res = await request(app)
      .get('/api/especes/nom/Chene')
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Arbre');
  });

  it('PUT /:id -> mise à jour d\'une espèce', async () => {
    const espece = await Espece.create({ ...validEspece, espece: 'Chene' });

    const res = await request(app)
      .put(`/api/especes/${espece._id}`)
      .set('x-api-key', apiKey)
      .send({ description: 'Maj test' });

    expect(res.status).toBe(200);
    expect(res.body.espece.description).toBe('Maj test');
  });

  it('DELETE /:id -> suppression d\'une espèce', async () => {
    const espece = await Espece.create({ ...validEspece, espece: 'Sapin' });

    const res = await request(app)
      .delete(`/api/especes/${espece._id}`)
      .set('x-api-key', apiKey);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/supprimée/);
  });

  it('POST /classify -> image invalide (mock)', async () => {
    const res = await request(app)
      .post('/api/especes/classify')
      .set('x-api-key', apiKey)
      .send({ photo: 'invalid-data' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/base64 invalide/);
  });
});
