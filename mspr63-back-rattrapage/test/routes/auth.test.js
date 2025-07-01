const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Scan = require('../../models/Scan');
const bcrypt = require('bcryptjs');

const API_KEY = 'votre_clé_api'; // Remplace par la vraie clé API

beforeAll(async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/testdb';
  await mongoose.connect(mongoURI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Scan.deleteMany({});
});

const headers = { 'x-api-key': API_KEY };
const user = {
  email: 'test@example.com',
  password: 'Password123!',
  nom: 'Jean',
  prenom: 'Dupont',
};

describe('Auth Routes', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .set(headers)
      .send(user);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Inscription réussie.');
  });

  it('should not register existing user', async () => {
    await new User({ ...user, password: await bcrypt.hash(user.password, 10) }).save();

    const res = await request(app)
      .post('/auth/register')
      .set(headers)
      .send(user);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Utilisateur déjà existant.');
  });

  it('should login with correct credentials', async () => {
    const hashed = await bcrypt.hash(user.password, 10);
    await new User({ ...user, password: hashed }).save();

    const res = await request(app)
      .post('/auth/login')
      .set(headers)
      .send({ email: user.email, password: user.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Connexion réussie.');
    expect(res.body.email).toBe(user.email);
  });

  it('should not login with wrong password', async () => {
    const hashed = await bcrypt.hash(user.password, 10);
    await new User({ ...user, password: hashed }).save();

    const res = await request(app)
      .post('/auth/login')
      .set(headers)
      .send({ email: user.email, password: 'wrongpass' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Mot de passe incorrect.');
  });

  it('should get user profile', async () => {
    await new User({ ...user, password: await bcrypt.hash(user.password, 10) }).save();

    const res = await request(app)
      .get('/auth/profile')
      .set(headers)
      .query({ email: user.email });

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(user.email);
    expect(res.body.nom).toBe(user.nom);
  });

  it('should update user password', async () => {
    await new User({ ...user, password: await bcrypt.hash(user.password, 10) }).save();

    const res = await request(app)
      .put('/auth/profile')
      .set(headers)
      .send({
        email: user.email,
        password: user.password,
        newPassword: 'NewPassword123!',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Profil mis à jour.');

    user.password = 'NewPassword123!';
  });

  it('should delete user profile', async () => {
    await new User({ ...user, password: await bcrypt.hash(user.password, 10) }).save();

    const res = await request(app)
      .delete('/auth/profile')
      .set(headers)
      .query({ email: user.email });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Compte supprimé avec succès.');
  });

  it('should paginate user list with scan counts', async () => {
    const users = [];
    for (let i = 0; i < 7; i++) {
      const email = `user${i}@test.com`;
      const hashed = await bcrypt.hash('pass123', 10);
      const created = new User({ email, password: hashed, nom: 'Nom', prenom: 'Prenom' });
      await created.save();
      users.push(email);

      if (i < 3) {
        await Scan.create({ email, data: 'scan', createdAt: new Date() });
      }
    }

    const res = await request(app)
      .get('/auth/users')
      .set(headers)
      .query({ page: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body.users.length).toBeLessThanOrEqual(5);
    expect(res.body.totalUsers).toBe(7);
    expect(res.body.totalPages).toBe(2);
  });

  it('should return total user count', async () => {
    await new User({ ...user, password: await bcrypt.hash(user.password, 10) }).save();

    const res = await request(app)
      .get('/auth/totalUsers')
      .set(headers);

    expect(res.statusCode).toBe(200);
    expect(res.body.totalUsers).toBeGreaterThanOrEqual(1);
  });
});
