// test/models/scan.test.js
const mongoose = require('mongoose');
const Scan = require('../../models/Scan');
jest.setTimeout(15000);

describe('Modèle Scan', () => {
  afterEach(async () => {
    await Scan.deleteMany({});
  });

  it('devrait créer un scan valide', async () => {
    const scan = new Scan({
      photo: 'image_base64_test',
      especeDetectee: 'Chêne',
      email: 'test@example.com'
    });

    const savedScan = await scan.save();

    expect(savedScan._id).toBeDefined();
    expect(savedScan.date).toBeDefined();
    expect(savedScan.photo).toBe('image_base64_test');
    expect(savedScan.especeDetectee).toBe('Chêne');
    expect(savedScan.email).toBe('test@example.com');
  });

  it('devrait refuser un scan sans photo', async () => {
    const scan = new Scan({
      especeDetectee: 'Chêne',
      email: 'test@example.com'
    });

    let err;
    try {
      await scan.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.photo).toBeDefined();
  });

  it('devrait refuser un scan sans especeDetectee', async () => {
    const scan = new Scan({
      photo: 'img',
      email: 'test@example.com'
    });

    let err;
    try {
      await scan.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.especeDetectee).toBeDefined();
  });

  it('devrait refuser un scan sans email', async () => {
    const scan = new Scan({
      photo: 'img',
      especeDetectee: 'Chêne'
    });

    let err;
    try {
      await scan.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });
});
