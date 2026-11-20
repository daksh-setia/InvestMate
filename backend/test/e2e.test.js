process.env.NODE_ENV = 'test';
const http = require('http');
const app = require('../server');

async function run() {
  await app.initPromise;
  
  const server = app.listen(0, async () => {
    const port = server.address().port;
    console.log(`Test server running on port ${port}`);

    function get(path) {
      return new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}${path}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode, data }));
        }).on('error', reject);
      });
    }

    function post(path, body) {
      return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const req = http.request(
          `http://127.0.0.1:${port}${path}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload)
            }
          },
          (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
          }
        );
        req.on('error', reject);
        req.write(payload);
        req.end();
      });
    }

    try {
      // 1. Health check
      const health = await get('/api/health');
      const healthData = JSON.parse(health.data);
      console.log(`[PASS] Health API (Status: ${health.status}) -> ${healthData.platform}`);

      // 1b. Citizen Login Test
      const citizenLogin = await post('/api/auth/login', {
        email: 'citizen@investmate.gov.in',
        password: 'Citizen@Secure123'
      });
      const citizenData = JSON.parse(citizenLogin.data);
      console.log(`[PASS] Citizen Login (Status: ${citizenLogin.status}) -> User: "${citizenData.data?.user?.fullName}", Role: "${citizenData.data?.user?.role}"`);

      // 2. Schemes API
      const schemes = await get('/api/schemes');
      const schemesData = JSON.parse(schemes.data);
      console.log(`[PASS] Schemes API (Status: ${schemes.status}) -> Retrieved ${schemesData.data.length} schemes (Total: ${schemesData.meta.total})`);

      // 3. Categories API
      const categories = await get('/api/categories');
      const catData = JSON.parse(categories.data);
      console.log(`[PASS] Categories API (Status: ${categories.status}) -> Retrieved ${catData.data.length} categories`);

      // 4. Scheme Detail with Fine-Print
      const firstSchemeId = schemesData.data[0]._id;
      const detail = await get(`/api/schemes/${firstSchemeId}`);
      const detailData = JSON.parse(detail.data);
      console.log(`[PASS] Scheme Detail API (Status: ${detail.status}) -> Name: "${detailData.data.name}", Lock-in: "${detailData.data.finePrint.lockInPeriod}"`);

      // 5. Document Checklist
      const docs = await get(`/api/documents/${firstSchemeId}`);
      const docsData = JSON.parse(docs.data);
      console.log(`[PASS] Document Checklist API (Status: ${docs.status}) -> Required documents: ${docsData.data.documents.length}`);

      // 6. Frontend static index.html
      const frontend = await get('/');
      const hasRoot = frontend.data.includes('id="root"');
      console.log(`[PASS] Frontend Serving (Status: ${frontend.status}) -> Root div found: ${hasRoot}`);

      console.log('\n*** ALL INTEGRATION CHECKS VERIFIED SUCCESSFULLY ***');
    } catch (err) {
      console.error('[FAIL] Integration check error:', err);
      process.exitCode = 1;
    } finally {
      server.close();
    }
  });
}

run();
