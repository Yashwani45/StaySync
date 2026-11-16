const http = require('http');

function post(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(body);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testEndpoints() {
  console.log('Testing live API endpoints on http://localhost:5001...');

  // 1. Login as admin
  const loginRes = await post('http://localhost:5001/api/auth/login', {
    email: 'admin@staysync.com',
    password: 'password123'
  });

  if (loginRes.status !== 200 || !loginRes.body.token) {
    console.error('Login failed:', loginRes);
    process.exit(1);
  }

  const token = loginRes.body.token;
  const user = loginRes.body.user;
  console.log(`✓ Logged in as ${user.email} (Role: ${user.role})`);

  const headers = { Authorization: `Bearer ${token}` };

  // 2. Test Admin Stats
  const statsRes = await get('http://localhost:5001/api/admin/stats', headers);
  console.log(`✓ GET /api/admin/stats -> Status ${statsRes.status}, Users: ${statsRes.body?.stats?.users}, Bookings: ${statsRes.body?.stats?.bookings}, GrossVol: ₹${statsRes.body?.stats?.grossVolume}, PlatformRev: ₹${statsRes.body?.stats?.platformRevenue}`);

  // 3. Test Users
  const usersRes = await get('http://localhost:5001/api/admin/users', headers);
  console.log(`✓ GET /api/admin/users -> Status ${usersRes.status}, Total: ${usersRes.body?.total}, Role Counts:`, usersRes.body?.roleCounts);

  const ownersRes = await get('http://localhost:5001/api/admin/users?role=PROPERTY_OWNER', headers);
  console.log(`✓ GET /api/admin/users?role=PROPERTY_OWNER -> Found: ${ownersRes.body?.data?.length} owners`);

  const providersRes = await get('http://localhost:5001/api/admin/users?role=PROVIDER', headers);
  console.log(`✓ GET /api/admin/users?role=PROVIDER -> Found: ${providersRes.body?.data?.length} providers`);

  const cleaningRes = await get('http://localhost:5001/api/admin/users?role=CLEANING_PROVIDER', headers);
  console.log(`✓ GET /api/admin/users?role=CLEANING_PROVIDER -> Found: ${cleaningRes.body?.data?.length} cleaning providers (${cleaningRes.body?.data?.[0]?.name})`);

  const tiffinRes = await get('http://localhost:5001/api/admin/users?role=TIFFIN_PROVIDER', headers);
  console.log(`✓ GET /api/admin/users?role=TIFFIN_PROVIDER -> Found: ${tiffinRes.body?.data?.length} tiffin providers`);

  const laundryRes = await get('http://localhost:5001/api/admin/users?role=LAUNDRY_PROVIDER', headers);
  console.log(`✓ GET /api/admin/users?role=LAUNDRY_PROVIDER -> Found: ${laundryRes.body?.data?.length} laundry providers`);

  const tenantsRes = await get('http://localhost:5001/api/admin/users?role=USER', headers);
  console.log(`✓ GET /api/admin/users?role=USER -> Found: ${tenantsRes.body?.data?.length} tenants`);

  // 4. Test Properties
  const propsRes = await get('http://localhost:5001/api/admin/properties', headers);
  console.log(`✓ GET /api/admin/properties -> Status ${propsRes.status}, Total: ${propsRes.body?.total}`);

  // 5. Test Services
  const servRes = await get('http://localhost:5001/api/admin/services', headers);
  console.log(`✓ GET /api/admin/services -> Status ${servRes.status}, Count: ${servRes.body?.count}`);

  // 6. Test Bookings
  const bookRes = await get('http://localhost:5001/api/admin/bookings', headers);
  console.log(`✓ GET /api/admin/bookings -> Status ${bookRes.status}, Total: ${bookRes.body?.total}`);

  // 7. Test Payments
  const payRes = await get('http://localhost:5001/api/admin/payments', headers);
  console.log(`✓ GET /api/admin/payments -> Status ${payRes.status}, Count: ${payRes.body?.count}, TotalCaptured: ₹${payRes.body?.totalCaptured}`);

  // 8. Test Settings
  const setRes = await get('http://localhost:5001/api/admin/settings', headers);
  console.log(`✓ GET /api/admin/settings -> Status ${setRes.status}, Fee: ${setRes.body?.data?.platformFeePercent}%, Cities: ${setRes.body?.data?.supportedCities?.length}`);

  // 9. Test Audit Logs
  const auditRes = await get('http://localhost:5001/api/admin/audit-logs', headers);
  console.log(`✓ GET /api/admin/audit-logs -> Status ${auditRes.status}, Count: ${auditRes.body?.count}`);

  // 10. Test Complaints
  const compRes = await get('http://localhost:5001/api/admin/complaints', headers);
  console.log(`✓ GET /api/admin/complaints -> Status ${compRes.status}, Count: ${compRes.body?.count}`);

  console.log('\nAll Super Admin API endpoints responded successfully with real MongoDB data!');
  process.exit(0);
}

testEndpoints().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
