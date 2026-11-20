const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_investmate_12345';

const app = require('../server');

let userToken = '';
let adminToken = '';
let sampleSchemeId = '';
let sampleCategoryId = '';

before(async () => {
  if (app.initPromise) {
    await app.initPromise;
  }
});

describe('INVESTMATE API Suite (Automated Backend Tests)', () => {

  test('1. GET /api/health should return 200 with healthy status', async () => {
    const res = await request(app).get('/api/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.status, 'healthy');
    assert.equal(res.body.platform, 'INVESTMATE Financial Awareness Backend');
  });

  test('2. POST /api/auth/register should create new citizen user and return JWT', async () => {
    const uniqueEmail = `farmer_${Date.now()}@investmate.in`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Baldev Singh (Farmer)',
        email: uniqueEmail,
        password: 'Password@123',
        preferredLanguage: 'pa',
        role: 'user'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token, 'Token should be returned');
    assert.equal(res.body.data.user.fullName, 'Baldev Singh (Farmer)');
    assert.equal(res.body.data.user.role, 'user');
    assert.equal(res.body.data.user.password, undefined, 'Password must never be returned');

    userToken = res.body.data.token;
  });

  test('3. POST /api/auth/login should authenticate seeded admin and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@investmate.gov.in',
        password: 'Admin@Secure123'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token, 'Admin token should be generated');
    assert.equal(res.body.data.user.role, 'admin');

    adminToken = res.body.data.token;
  });

  test('3b. POST /api/auth/login should authenticate seeded citizen user and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'citizen@investmate.gov.in',
        password: 'Citizen@Secure123'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token, 'Citizen token should be generated');
    assert.equal(res.body.data.user.role, 'user');
    assert.equal(res.body.data.user.email, 'citizen@investmate.gov.in');
  });

  test('4. POST /api/auth/login with invalid password should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@investmate.gov.in',
        password: 'IncorrectPassword'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid/i);
  });

  test('5. GET /api/auth/profile with Bearer token should return user profile', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.fullName, 'Baldev Singh (Farmer)');
  });

  test('6. GET /api/auth/profile without token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/profile');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('7. GET /api/categories should return active categories list with scheme counts', async () => {
    const res = await request(app).get('/api/categories');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data), 'Data should be an array of categories');
    assert.ok(res.body.data.length >= 5, 'Should have at least 5 categories');
    assert.ok(res.body.data[0].schemesCount !== undefined, 'Should have schemesCount');

    sampleCategoryId = res.body.data[0]._id;
  });

  test('8. GET /api/schemes should return schemes with pagination metadata (Guest access)', async () => {
    const res = await request(app).get('/api/schemes?page=1&limit=5');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length > 0);
    assert.ok(res.body.meta.total > 0);
    assert.equal(res.body.meta.page, 1);
    assert.equal(res.body.meta.limit, 5);

    sampleSchemeId = res.body.data[0]._id;
  });

  test('9. GET /api/schemes?lite=true should return compact payload for low bandwidth', async () => {
    const res = await request(app).get('/api/schemes?lite=true&limit=3');

    assert.equal(res.status, 200);
    assert.ok(res.body.data.length > 0);
    const first = res.body.data[0];
    assert.ok(first.name);
    assert.ok(first.shortDescription);
    assert.equal(first.detailedExplanation, undefined, 'Detailed explanation omitted in lite mode');
  });

  test('10. GET /api/schemes/search?q=kisan should return PM-KISAN scheme', async () => {
    const res = await request(app).get('/api/schemes/search?q=kisan');

    assert.equal(res.status, 200);
    assert.ok(res.body.data.length > 0);
    const found = res.body.data.some((s) => s.name.includes('PM-KISAN'));
    assert.ok(found, 'Should find PM-KISAN');
  });

  test('11. GET /api/schemes/:id should return full scheme with Fine-Print transparency details', async () => {
    const res = await request(app).get(`/api/schemes/${sampleSchemeId}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.finePrint, 'Fine print disclosure must exist');
    assert.ok(res.body.data.finePrint.lockInPeriod, 'Lock-in period must be disclosed');
    assert.ok(res.body.data.finePrint.exitPenalties, 'Exit penalties must be disclosed');
    assert.ok(res.body.data.finePrint.hiddenCharges, 'Hidden charges must be disclosed');
    assert.ok(Array.isArray(res.body.data.finePrint.importantWarnings), 'Warnings must be present');
  });

  test('12. GET /api/documents/:schemeId should return document checklist & guidelines', async () => {
    const res = await request(app).get(`/api/documents/${sampleSchemeId}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.documents), 'Documents list must be an array');
    assert.ok(res.body.data.documents.length > 0, 'Should have document items');
    assert.ok(res.body.data.documents[0].preparationInstructions, 'Must have preparation instructions');
    assert.ok(Array.isArray(res.body.data.preparationGuidelines), 'Must have general preparation guidelines');
  });

  test('13. GET /api/admin/stats with Admin token should return dashboard metrics', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.overview.totalSchemes > 0);
    assert.ok(res.body.data.overview.totalCategories > 0);
  });

  test('14. GET /api/admin/stats with regular citizen token should return 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /forbidden/i);
  });

  test('15. GET /api/schemes/non-existent-id should return 404', async () => {
    const res = await request(app).get('/api/schemes/non-existent-id-9999');

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  test('16. PUT /api/schemes/:id/fine-print with Admin token should update fine-print details', async () => {
    const res = await request(app)
      .put(`/api/schemes/${sampleSchemeId}/fine-print`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        lockInPeriod: 'Updated verified lock-in: None',
        hiddenCharges: '₹0 (Verified 100% Free)'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

});
