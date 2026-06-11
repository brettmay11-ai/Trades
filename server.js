const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const port = Number(process.env.PORT || 3000);
const publicRoot = path.resolve(__dirname, 'prototype');
const dataRoot = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const dataFile = path.join(dataRoot, 'store.json');
const sessionHours = 24 * 14;

const contentTypes = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY'
};

function emptyStore() { return { users: [], companies: [], memberships: [], sessions: [], conversations: [], messages: [], jobs: [] }; }
function ensureStore() {
  fs.mkdirSync(dataRoot, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify(emptyStore(), null, 2));
}
function readStore() { ensureStore(); return JSON.parse(fs.readFileSync(dataFile, 'utf8')); }
function writeStore(store) {
  ensureStore();
  const temporary = `${dataFile}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(store, null, 2));
  fs.renameSync(temporary, dataFile);
}
function id(prefix) { return `${prefix}_${crypto.randomUUID()}`; }
function now() { return new Date().toISOString(); }
function clean(value, max = 250) { return String(value || '').trim().slice(0, max); }
function normalizeEmail(value) { return clean(value, 254).toLowerCase(); }
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') };
}
function passwordMatches(password, user) {
  const candidate = crypto.scryptSync(password, user.passwordSalt, 64);
  return crypto.timingSafeEqual(candidate, Buffer.from(user.passwordHash, 'hex'));
}
function parseCookies(request) {
  return Object.fromEntries(String(request.headers.cookie || '').split(';').map(part => part.trim().split('=')).filter(parts => parts.length === 2).map(([key, value]) => [key, decodeURIComponent(value)]));
}
function authenticatedContext(request, store) {
  const token = parseCookies(request).trades_session;
  const session = store.sessions.find(item => item.token === token && item.expiresAt > now());
  if (!session) return null;
  const user = store.users.find(item => item.id === session.userId);
  const membership = store.memberships.find(item => item.userId === user?.id);
  const company = store.companies.find(item => item.id === membership?.companyId);
  return user && company ? { user, company, membership, session } : null;
}
function publicCompany(company) {
  return { id: company.id, name: company.name, city: company.city, state: company.state, capabilities: company.capabilities, trades: company.trades, serviceRadius: company.serviceRadius, createdAt: company.createdAt };
}
function publicUser(user) { return { id: user.id, email: user.email, fullName: user.fullName }; }
function send(response, statusCode, body, headers = {}) { response.writeHead(statusCode, { ...securityHeaders, ...headers }); response.end(body); }
function json(response, statusCode, value, headers = {}) { send(response, statusCode, JSON.stringify(value), { 'Content-Type': contentTypes['.json'], 'Cache-Control': 'no-store', ...headers }); }
function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => { body += chunk; if (body.length > 1_000_000) reject(new Error('Request too large')); });
    request.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Invalid JSON')); } });
    request.on('error', reject);
  });
}
function sessionCookie(token, maxAge = sessionHours * 3600) { return `trades_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`; }
function requireAuth(request, response, store) {
  const context = authenticatedContext(request, store);
  if (!context) json(response, 401, { error: 'Sign in required' });
  return context;
}
function conversationFor(store, conversationId, companyId) { return store.conversations.find(item => item.id === conversationId && item.companyIds.includes(companyId)); }

async function handleApi(request, response, requestUrl) {
  const store = readStore();
  const pathname = requestUrl.pathname;
  try {
    if (request.method === 'POST' && pathname === '/api/signup') {
      const body = await readJson(request);
      const email = normalizeEmail(body.email);
      const password = String(body.password || '');
      const capabilities = Array.isArray(body.capabilities) ? [...new Set(body.capabilities.filter(value => ['contractor', 'subcontractor'].includes(value)))] : [];
      if (!email.includes('@') || password.length < 8 || !clean(body.fullName) || !clean(body.companyName) || capabilities.length === 0) return json(response, 400, { error: 'Complete every required field and use a password with at least 8 characters.' });
      if (store.users.some(user => user.email === email)) return json(response, 409, { error: 'An account already exists for this email.' });
      const passwordResult = hashPassword(password);
      const user = { id: id('usr'), email, fullName: clean(body.fullName, 100), passwordSalt: passwordResult.salt, passwordHash: passwordResult.hash, createdAt: now() };
      const company = { id: id('cmp'), name: clean(body.companyName, 140), city: clean(body.city, 80), state: clean(body.state, 2).toUpperCase(), capabilities, trades: Array.isArray(body.trades) ? body.trades.map(value => clean(value, 80)).filter(Boolean).slice(0, 12) : [], serviceRadius: Math.max(0, Math.min(Number(body.serviceRadius) || 50, 1000)), createdAt: now() };
      const session = { token: crypto.randomBytes(32).toString('hex'), userId: user.id, expiresAt: new Date(Date.now() + sessionHours * 3600_000).toISOString() };
      store.users.push(user); store.companies.push(company); store.memberships.push({ userId: user.id, companyId: company.id, role: 'owner' }); store.sessions.push(session); writeStore(store);
      return json(response, 201, { user: publicUser(user), company: publicCompany(company) }, { 'Set-Cookie': sessionCookie(session.token) });
    }
    if (request.method === 'POST' && pathname === '/api/login') {
      const body = await readJson(request); const user = store.users.find(item => item.email === normalizeEmail(body.email));
      if (!user || !passwordMatches(String(body.password || ''), user)) return json(response, 401, { error: 'Email or password is incorrect.' });
      const session = { token: crypto.randomBytes(32).toString('hex'), userId: user.id, expiresAt: new Date(Date.now() + sessionHours * 3600_000).toISOString() };
      store.sessions = store.sessions.filter(item => item.expiresAt > now()); store.sessions.push(session); writeStore(store);
      const membership = store.memberships.find(item => item.userId === user.id); const company = store.companies.find(item => item.id === membership.companyId);
      return json(response, 200, { user: publicUser(user), company: publicCompany(company) }, { 'Set-Cookie': sessionCookie(session.token) });
    }
    if (request.method === 'POST' && pathname === '/api/logout') {
      const token = parseCookies(request).trades_session; store.sessions = store.sessions.filter(item => item.token !== token); writeStore(store);
      return json(response, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
    }
    if (request.method === 'GET' && pathname === '/api/me') {
      const context = requireAuth(request, response, store); if (!context) return;
      return json(response, 200, { user: publicUser(context.user), company: publicCompany(context.company), membership: context.membership });
    }
    if (request.method === 'GET' && pathname === '/api/dashboard') {
      const context = requireAuth(request, response, store); if (!context) return;
      const conversations = store.conversations.filter(item => item.companyIds.includes(context.company.id)).map(item => {
        const otherId = item.companyIds.find(companyId => companyId !== context.company.id); const other = store.companies.find(company => company.id === otherId); const related = store.messages.filter(message => message.conversationId === item.id); const last = related.at(-1);
        return { ...item, otherCompany: publicCompany(other), lastMessage: last ? { body: last.body, createdAt: last.createdAt, senderCompanyId: last.senderCompanyId } : null, unread: related.filter(message => message.senderCompanyId !== context.company.id && !message.readByCompanyIds.includes(context.company.id)).length };
      }).sort((a, b) => String(b.lastMessage?.createdAt || b.createdAt).localeCompare(String(a.lastMessage?.createdAt || a.createdAt)));
      const directory = store.companies.filter(company => company.id !== context.company.id).map(publicCompany);
      return json(response, 200, { user: publicUser(context.user), company: publicCompany(context.company), conversations, directory, jobs: store.jobs.filter(job => job.postingCompanyId === context.company.id) });
    }
    if (request.method === 'POST' && pathname === '/api/conversations') {
      const context = requireAuth(request, response, store); if (!context) return; const body = await readJson(request); const other = store.companies.find(company => company.id === body.companyId);
      if (!other || other.id === context.company.id) return json(response, 400, { error: 'Choose another company.' });
      let conversation = store.conversations.find(item => item.companyIds.includes(context.company.id) && item.companyIds.includes(other.id));
      if (!conversation) { conversation = { id: id('cnv'), companyIds: [context.company.id, other.id], createdAt: now() }; store.conversations.push(conversation); writeStore(store); }
      return json(response, 201, { conversation, otherCompany: publicCompany(other) });
    }
    const messageMatch = pathname.match(/^\/api\/conversations\/([^/]+)\/messages$/);
    if (messageMatch && request.method === 'GET') {
      const context = requireAuth(request, response, store); if (!context) return; const conversation = conversationFor(store, messageMatch[1], context.company.id); if (!conversation) return json(response, 404, { error: 'Conversation not found.' });
      store.messages.filter(message => message.conversationId === conversation.id && message.senderCompanyId !== context.company.id).forEach(message => { if (!message.readByCompanyIds.includes(context.company.id)) message.readByCompanyIds.push(context.company.id); }); writeStore(store);
      const other = store.companies.find(company => conversation.companyIds.includes(company.id) && company.id !== context.company.id);
      return json(response, 200, { conversation, otherCompany: publicCompany(other), messages: store.messages.filter(message => message.conversationId === conversation.id) });
    }
    if (messageMatch && request.method === 'POST') {
      const context = requireAuth(request, response, store); if (!context) return; const conversation = conversationFor(store, messageMatch[1], context.company.id); if (!conversation) return json(response, 404, { error: 'Conversation not found.' }); const body = await readJson(request); const messageBody = clean(body.body, 3000); if (!messageBody) return json(response, 400, { error: 'Write a message first.' });
      const message = { id: id('msg'), conversationId: conversation.id, senderUserId: context.user.id, senderCompanyId: context.company.id, senderName: context.user.fullName, body: messageBody, readByCompanyIds: [context.company.id], createdAt: now() }; store.messages.push(message); writeStore(store); return json(response, 201, { message });
    }
    return json(response, 404, { error: 'API route not found.' });
  } catch (error) { console.error(error); return json(response, 500, { error: 'Something went wrong. Please try again.' }); }
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (requestUrl.pathname.startsWith('/api/')) return handleApi(request, response, requestUrl);
  if (requestUrl.pathname === '/health') return json(response, 200, { status: 'ok' });
  const routeFiles = { '/login': '/account.html', '/signup': '/account.html', '/dashboard': '/dashboard.html', '/messages': '/dashboard.html' };
  let pathname;
  try { pathname = decodeURIComponent(routeFiles[requestUrl.pathname] || (requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname)); } catch { return send(response, 400, 'Bad request', { 'Content-Type': 'text/plain; charset=utf-8' }); }
  const filePath = path.resolve(publicRoot, `.${pathname}`);
  if (!filePath.startsWith(`${publicRoot}${path.sep}`)) return send(response, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) return send(response, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    const extension = path.extname(filePath).toLowerCase(); response.writeHead(200, { ...securityHeaders, 'Content-Type': contentTypes[extension] || 'application/octet-stream', 'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=3600' }); fs.createReadStream(filePath).pipe(response);
  });
});
server.listen(port, '0.0.0.0', () => console.log(`Trades marketplace listening on port ${port}`));
