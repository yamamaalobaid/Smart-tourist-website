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
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getJson(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    console.log('Logging in...');
    const login = await postJson('/api/auth/login', { email: 'ahmed@damascus.com', password: 'password123' });
    console.log('Login response:', login);
    if (!login || !login.token) {
      console.error('No token returned');
      process.exit(1);
    }
    const token = login.token;
    console.log('\nCalling /api/auth/me with token...');
    const me = await getJson('/api/auth/me', token);
    console.log('Me response:', me);
  } catch (e) {
    console.error('Error in auth flow:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
