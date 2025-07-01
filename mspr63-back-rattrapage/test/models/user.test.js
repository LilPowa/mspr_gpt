const mongoose = require('mongoose');
const User = require('../../models/User');

jest.setTimeout(15000);

describe('User Model Test', () => {
  afterEach(async () => {
    await User.deleteMany({});
  });

  it('Créer un utilisateur avec succès', async () => {
    const validUser = new User({
      email: 'test@example.com',
      password: 'hashedpassword',
      nom: 'Dupont',
      prenom: 'Jean',
    });

    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe('test@example.com');
    expect(savedUser.password).toBe('hashedpassword');
    expect(savedUser.nom).toBe('Dupont');
    expect(savedUser.prenom).toBe('Jean');
    expect(savedUser.createdAt).toBeDefined();
  });

  it('Ne doit pas créer un utilisateur sans email', async () => {
    const userWithoutEmail = new User({
      password: 'hashedpassword',
      nom: 'Dupont',
      prenom: 'Jean',
    });

    let err;
    try {
      await userWithoutEmail.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it('Ne doit pas créer un utilisateur sans password', async () => {
    const userWithoutPassword = new User({
      email: 'test@example.com',
      nom: 'Dupont',
      prenom: 'Jean',
    });

    let err;
    try {
      await userWithoutPassword.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it('Ne doit pas créer un utilisateur avec email non unique', async () => {
    const user1 = new User({
      email: 'unique@example.com',
      password: 'pass1',
    });

    const user2 = new User({
      email: 'unique@example.com',
      password: 'pass2',
    });

    await user1.save();

    let err;
    try {
      await user2.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // Erreur doublon
  });
});
