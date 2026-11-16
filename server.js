const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const dataDir = path.join(root, 'data');
const ordersFile = path.join(dataDir, 'orders.json');
const reviewsFile = path.join(dataDir, 'reviews.json');
const menuFile = path.join(dataDir, 'menu.json');
const port = Number(process.env.PORT || 4173);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.avif':'image/avif','.svg':'image/svg+xml'};
fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, '[]', 'utf8');
if (!fs.existsSync(menuFile)) fs.writeFileSync(menuFile, JSON.stringify([{id:'kambu-kool',name:'Kambu Kool',price:30},{id:'butter-milk',name:'Butter Milk',price:30}], null, 2), 'utf8');
if (!fs.existsSync(reviewsFile)) fs.writeFileSync(reviewsFile, JSON.stringify([{name:'Kaviya S.',rating:5,text:'Best kambu kool — cool, tangy, and just like home.',date:'2026-08-02'},{name:'Suresh M.',rating:4,text:'The buttermilk is fresh and perfectly spiced.',date:'2026-08-14'},{name:'Anushiya S.',rating:5,text:'The sides pair perfectly with the traditional kool.',date:'2026-08-29'}], null, 2), 'utf8');
function readOrders() { try { return JSON.parse(fs.readFileSync(ordersFile, 'utf8')); } catch { return []; } }
function saveOrders(items) { fs.writeFileSync(ordersFile, JSON.stringify(items, null, 2), 'utf8'); }
function readReviews() { try { return JSON.parse(fs.readFileSync(reviewsFile, 'utf8')); } catch { return []; } }
function saveReviews(items) { fs.writeFileSync(reviewsFile, JSON.stringify(items, null, 2), 'utf8'); }
function readMenu() { try { return JSON.parse(fs.readFileSync(menuFile, 'utf8')); } catch { return []; } }
function saveMenu(items) { fs.writeFileSync(menuFile, JSON.stringify(items, null, 2), 'utf8'); }
function json(res, status, value) { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify(value)); }
function body(req) { return new Promise((resolve, reject) => { let raw = ''; req.on('data', chunk => { raw += chunk; if (raw.length > 1024 * 1024) { reject(new Error('Request too large')); req.destroy(); } }); req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { reject(new Error('Invalid JSON')); } }); req.on('error', reject); }); }
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/menu' && req.method === 'GET') return json(res, 200, readMenu());
  if (url.pathname === '/api/menu' && req.method === 'PUT') {
    try { const payload = await body(req); if (!Array.isArray(payload.items) || payload.items.some(item => !item.id || !Number.isFinite(Number(item.price)) || Number(item.price) < 0 || Number(item.price) > 100000)) return json(res, 400, {error:'Invalid menu prices'}); const items = payload.items.map(item => ({id:String(item.id),name:String(item.name || '').slice(0, 80),price:Math.round(Number(item.price))})); saveMenu(items); return json(res, 200, items); }
    catch (error) { return json(res, 400, {error:error.message}); }
  }
  if (url.pathname === '/api/orders' && req.method === 'GET') return json(res, 200, readOrders());
  if (url.pathname === '/api/reviews' && req.method === 'GET') return json(res, 200, readReviews());
  if (url.pathname === '/api/reviews' && req.method === 'POST') {
    try { const review = await body(req); const rating = Number(review.rating); if (!review.name || !review.text || rating < 1 || rating > 5) return json(res, 400, {error:'Incomplete review'}); review.rating = rating; review.name = String(review.name).slice(0, 80); review.text = String(review.text).slice(0, 1200); review.date = typeof review.date === 'string' ? review.date.slice(0, 10) : new Date().toISOString().slice(0, 10); const items = readReviews(); items.push(review); saveReviews(items); return json(res, 201, review); }
    catch (error) { return json(res, 400, {error:error.message}); }
  }
  if (url.pathname === '/api/orders' && req.method === 'POST') {
    try { const order = await body(req); if (!order.id || !order.customer?.name || !order.customer?.phone || !Array.isArray(order.items) || !order.items.length) return json(res, 400, {error:'Incomplete order'}); const items = readOrders(); if (!items.some(item => item.id === order.id)) items.push(order); saveOrders(items); return json(res, 201, order); }
    catch (error) { return json(res, 400, {error:error.message}); }
  }
  const match = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (match && req.method === 'PATCH') {
    try { const patch = await body(req), items = readOrders(), order = items.find(item => item.id === decodeURIComponent(match[1])); if (!order) return json(res, 404, {error:'Order not found'}); if (typeof patch.status === 'string') order.status = patch.status.slice(0, 40); if (typeof patch.billPrepared === 'boolean') order.billPrepared = patch.billPrepared; if (typeof patch.acceptedAt === 'string') order.acceptedAt = patch.acceptedAt; if (Object.prototype.hasOwnProperty.call(patch, 'adminPackage')) order.adminPackage = Number(patch.adminPackage) || 0; if (Object.prototype.hasOwnProperty.call(patch, 'finalTotal')) order.finalTotal = Number(patch.finalTotal) || 0; saveOrders(items); return json(res, 200, order); }
    catch (error) { return json(res, 400, {error:error.message}); }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, {error:'Method not allowed'});
  let requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  let file = path.resolve(root, '.' + requested);
  if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) return json(res, 403, {error:'Forbidden'});
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); return res.end('Not found'); }
    res.writeHead(200, {'Content-Type':mime[path.extname(file).toLowerCase()] || 'application/octet-stream'});
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
});
server.listen(port, '0.0.0.0', () => console.log(`Priya Kambu Kool is running at http://localhost:${port}`));