const request = require('supertest');
const mongoose = require('mongoose');
const moment = require('moment');
const app = require('../../server'); // ton fichier Express principal
const Scan = require('../../models/Scan');
const User = require('../../models/User');
jest.setTimeout(15000);

describe('Dashboard Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany();
    await Scan.deleteMany();
  });

  describe('GET /api/dashboard/stats', () => {
    it('devrait retourner les stats correctes', async () => {
      const today = new Date();
      const earlierThisMonth = moment().startOf('month').add(1, 'day').toDate();
      const lastYear = moment().subtract(1, 'year').toDate();

      await User.create({ email: 'a@test.com', password: '123' });

      await Scan.create([
        { email: 'a@test.com', especeDetectee: 'Test1', date: today },
        { email: 'a@test.com', especeDetectee: 'Test2', date: earlierThisMonth },
        { email: 'a@test.com', especeDetectee: 'Test3', date: lastYear }
      ]);

      const res = await request(app).get('/api/dashboard/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('today');
      expect(res.body).toHaveProperty('week');
      expect(res.body).toHaveProperty('month');
      expect(res.body).toHaveProperty('year');
      expect(res.body).toHaveProperty('users');

      expect(res.body.today).toBeGreaterThanOrEqual(1);
      expect(res.body.month).toBeGreaterThanOrEqual(2);
      expect(res.body.year).toBeGreaterThanOrEqual(2);
      expect(res.body.users).toBe(1);
    });
  });

  describe('GET /api/dashboard/species-distribution', () => {
    it('devrait retourner la répartition des espèces', async () => {
      await Scan.create([
        { email: 'user1@test.com', especeDetectee: 'Espèce A', date: new Date() },
        { email: 'user1@test.com', especeDetectee: 'Espèce A', date: new Date() },
        { email: 'user1@test.com', especeDetectee: 'Espèce B', date: new Date() },
      ]);

      const res = await request(app).get('/api/dashboard/species-distribution');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('labels');
      expect(res.body).toHaveProperty('counts');
      expect(res.body.labels).toEqual(expect.arrayContaining(['Espèce A', 'Espèce B']));
      expect(res.body.counts).toEqual(expect.arrayContaining([2, 1]));
    });
  });
});
