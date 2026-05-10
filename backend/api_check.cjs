const http = require('http');

function post(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let str = '';
      res.on('data', chunk => str += chunk);
      res.on('end', () => resolve(JSON.parse(str)));
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

function get(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let str = '';
      res.on('data', chunk => str += chunk);
      res.on('end', () => resolve(JSON.parse(str)));
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    const auth = await post({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@kriparth.com', password: 'admin123' });
    
    const token = auth.data?.token;
    if (!token) { console.log("Bad auth structure", auth); return; }
    
    const date = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    const rep = await get({
      hostname: 'localhost',
      port: 3000,
      path: `/api/v1/reports/revenue?startDate=${date}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(JSON.stringify(rep, null, 2));
  } catch(e) {
    console.log("ERR", e);
  }
})();
