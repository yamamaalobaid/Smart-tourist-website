import fetch from 'node-fetch';

async function main(){
  try{
    const res = await fetch('http://localhost:5000/api/auth/login-debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tourist@gmail.com', password: 'password123' }),
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY', text);
  }catch(e){
    console.error('fetch error', e);
  }
}

main();
