const http = require('http');

function postJson(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    const email = `testuser${Date.now()%10000}@example.com`;
    const password = 'testpass123';
    console.log('Creating user:', email);
    const reg = await postJson('/api/auth/register', { email, password, firstName: 'جرب', lastName: 'مستخدم', phone: '+96390000000' });
    console.log('Register response:', reg);

    console.log('\nTrying login...');
    const login = await postJson('/api/auth/login', { email, password });
    console.log('Login response:', login);
  } catch (e) {
    console.error('Error:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
