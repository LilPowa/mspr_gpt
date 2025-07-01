const mongoose = require('mongoose');
const Espece = require('../../models/Espece');
jest.setTimeout(15000);

afterEach(async () => {
  await Espece.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Modèle Espece', () => {
  const validData = {
    espece: 'Chêne', // ✅ corrigé pour correspondre au test
    description: 'Tests',
    nomLatin: 'Quercus robur',
    famille: 'mamiferes',
    taille: '20-40m',
    region: 'Europe',
    habitat: 'Forêts tempérées',
    funFact: 'Peut vivre plus de 1000 ans',
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAU='
  };

  it('valide une espèce complète', async () => {
    const espece = new Espece(validData);
    const saved = await espece.save();

    expect(saved._id).toBeDefined();
    expect(saved.espece).toBe('Chêne');
    expect(saved.nomLatin).toBe('Quercus robur');
  });

  it('rejette une espèce sans champ requis', async () => {
    const invalid = new Espece({ ...validData, espece: undefined });

    let err;
    try {
      await invalid.save();
    } catch (e) {
      err = e;
    }

    expect(err).toBeDefined();
    expect(err.errors['espece'].message).toMatch(/Path `espece` is required/);
  });

  it('autorise une image base64', async () => {
    const espece = new Espece(validData);
    const saved = await espece.save();

    expect(saved.image).toMatch(/^data:image\/png;base64/);
  });

  it('peut sauvegarder sans image', async () => {
    const espece = new Espece({ ...validData, image: undefined });
    const saved = await espece.save();

    expect(saved._id).toBeDefined();
    expect(saved.image).toBeUndefined();
  });
});
