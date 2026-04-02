const http = require('http');

const data = JSON.stringify({ email: 'ahmed@damascus.com', password: 'password123' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    try {
      console.log(body);
    } catch (e) {
      console.error('Failed to parse response', e);
      console.log(body);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error', e);
  process.exit(1);
});

req.write(data);
req.end();
