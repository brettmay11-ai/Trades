'use strict';
// Trades marketplace — single consolidated server.
// One process, one HTTP server. No proxy layers, no runtime monkey-patching.
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const port = Number(process.env.PORT || 3000);
const publicRoot = path.resolve(__dirname, 'prototype');
const dataRoot = path.resolve(process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, 'data'));
const dataFile = path.join(dataRoot, 'store.json');
const sessionHours = 336;
const resetMinutes = 30;
const persistentStorage = Boolean(process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH);

const trades = ['Framing and Rough Carpentry', 'Electrical', 'HVAC and Refrigeration', 'Concrete, Formwork, and Rebar', 'Plumbing', 'Drywall and Finishing', 'Painting and Coatings', 'Masonry, Brick, and Stone', 'Roofing', 'Excavation, Grading, and Sitework', 'Demolition', 'Insulation', 'Flooring and Tile', 'Finish Carpentry, Cabinets, and Millwork', 'Siding, Stucco, and Exterior Finishes', 'Windows, Doors, Glass, and Glazing', 'Landscaping and Irrigation', 'Fencing and Gates', 'Low-Voltage, Data, Security, and Access Control', 'Welding, Structural Steel, and Miscellaneous Metals', 'Waterproofing, Gutters, and Drainage', 'Cleaning, Hauling, and Final Jobsite Cleanup'];
const tradeAliases = { framing: 'Framing and Rough Carpentry', carpentry: 'Framing and Rough Carpentry', hvac: 'HVAC and Refrigeration', concrete: 'Concrete, Formwork, and Rebar', drywall: 'Drywall and Finishing', painting: 'Painting and Coatings', masonry: 'Masonry, Brick, and Stone', excavation: 'Excavation, Grading, and Sitework', flooring: 'Flooring and Tile', tile: 'Flooring and Tile', 'stone and tile': 'Flooring and Tile', 'finish carpentry': 'Finish Carpentry, Cabinets, and Millwork', cabinetry: 'Finish Carpentry, Cabinets, and Millwork', siding: 'Siding, Stucco, and Exterior Finishes', 'doors and windows': 'Windows, Doors, Glass, and Glazing', 'glass and glazing': 'Windows, Doors, Glass, and Glazing', landscaping: 'Landscaping and Irrigation', fencing: 'Fencing and Gates', welding: 'Welding, Structural Steel, and Miscellaneous Metals', 'structural steel': 'Welding, Structural Steel, and Miscellaneous Metals', 'metal fabrication': 'Welding, Structural Steel, and Miscellaneous Metals', waterproofing: 'Waterproofing, Gutters, and Drainage', gutters: 'Waterproofing, Gutters, and Drainage', cleaning: 'Cleaning, Hauling, and Final Jobsite Cleanup', 'general labor': 'Cleaning, Hauling, and Final Jobsite Cleanup' };
const cityCoordinates = { 'dallas,tx': [32.7767, -96.797], 'fort worth,tx': [32.7555, -97.3308], 'arlington,tx': [32.7357, -97.1081], 'plano,tx': [33.0198, -96.6989], 'frisco,tx': [33.1507, -96.8236], 'mckinney,tx': [33.1972, -96.6398], 'irving,tx': [32.814, -96.9489], 'garland,tx': [32.9126, -96.6389], 'austin,tx': [30.2672, -97.7431], 'houston,tx': [29.7604, -95.3698], 'san antonio,tx': [29.4241, -98.4936], 'columbus,oh': [39.9612, -82.9988] };

// Extended company profile fields with maximum stored lengths.
const profileFields = { profileImage: 2100000, about: 1800, legalName: 180, website: 250, phone: 40, contactEmail: 254, yearFounded: 4, employeeCount: 40, streetAddress: 180, serviceSummary: 800, projectTypes: 500, annualProjectVolume: 100, subcontractorRequirements: 800, paymentTerms: 500, crewSize: 40, yearsExperience: 40, minimumJobSize: 100, availability: 300 };

const types = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };
const headers = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' https://maps.googleapis.com https://maps.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://maps.gstatic.com https://maps.googleapis.com; connect-src 'self' https://maps.googleapis.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

// ---- Storage ---------------------------------------------------------------
function blank() {
  return { users: [], companies: [], memberships: [], sessions: [], conversations: [], messages: [], jobs: [], bids: [], networkConnections: [], networkInvites: [], referrals: [], portfolioProjects: [], credentials: [], savedSearches: [], notifications: [], reviews: [], passwordResetTokens: [] };
}
function ensure() {
  fs.mkdirSync(dataRoot, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, JSON.stringify(blank(), null, 2));
}
function read() {
  ensure();
  return { ...blank(), ...JSON.parse(fs.readFileSync(dataFile, 'utf8')) };
}
function write(store) {
  ensure();
  const temp = `${dataFile}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(store, null, 2));
  fs.renameSync(temp, dataFile);
}
// Repair legacy company records that predate later schema fields.
function normalizeCompanies(store) {
  let changed = false;
  (store.companies || []).forEach(company => {
    if (!Array.isArray(company.capabilities)) { company.capabilities = []; changed = true; }
    if (!Array.isArray(company.trades)) { company.trades = []; changed = true; }
    if (typeof company.city !== 'string') { company.city = ''; changed = true; }
    if (typeof company.state !== 'string') { company.state = ''; changed = true; }
    if (!Number.isFinite(company.serviceRadius)) { company.serviceRadius = 50; changed = true; }
  });
  if (changed) write(store);
  return store;
}

// ---- Small helpers ---------------------------------------------------------
function uid(prefix) { return `${prefix}_${crypto.randomUUID()}`; }
function now() { return new Date().toISOString(); }
function clean(value, max = 250) { return String(value || '').trim().slice(0, max); }
function email(value) { return clean(value, 254).toLowerCase(); }
function canonicalTrade(value) {
  const normalized = clean(value, 100).toLowerCase();
  return trades.find(trade => trade.toLowerCase() === normalized) || tradeAliases[normalized] || '';
}
function hash(password, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') };
}
function match(password, user) {
  if (!user.passwordSalt || !user.passwordHash) return false;
  const actual = crypto.scryptSync(password, user.passwordSalt, 64);
  const expected = Buffer.from(user.passwordHash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
function tokenHash(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function cookies(req) {
  return Object.fromEntries(String(req.headers.cookie || '').split(';').map(part => part.trim().split('=')).filter(pair => pair.length === 2).map(([key, value]) => [key, decodeURIComponent(value)]));
}
function body(req, max = 1e6) {
  return new Promise((resolve, reject) => {
    let value = '';
    req.on('data', chunk => { value += chunk; if (value.length > max) reject(Error('large')); });
    req.on('end', () => { try { resolve(value ? JSON.parse(value) : {}); } catch { reject(Error('json')); } });
    req.on('error', reject);
  });
}
function send(res, status, payload, extra = {}) { res.writeHead(status, { ...headers, ...extra }); res.end(payload); }
function json(res, status, value, extra = {}) { send(res, status, JSON.stringify(value), { 'Content-Type': types['.json'], 'Cache-Control': 'no-store', ...extra }); }
function cookie(token, age = sessionHours * 3600) {
  return `trades_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

// ---- Domain helpers --------------------------------------------------------
function pub(company) {
  return { id: company.id, name: company.name, city: company.city || '', state: company.state || '', capabilities: company.capabilities || [], trades: company.trades || [], serviceRadius: company.serviceRadius || 50, createdAt: company.createdAt };
}
function companyDetail(company) {
  const detail = Object.fromEntries(Object.keys(profileFields).map(key => [key, company[key] || '']));
  return { id: company.id, name: company.name, city: company.city || '', state: company.state || '', capabilities: company.capabilities || [], trades: company.trades || [], serviceRadius: company.serviceRadius || 50, ...detail };
}
function ctx(req, store) {
  const session = store.sessions.find(item => item.token === cookies(req).trades_session && item.expiresAt > now());
  const user = store.users.find(item => item.id === session?.userId);
  const membership = store.memberships.find(item => item.userId === user?.id);
  const company = store.companies.find(item => item.id === membership?.companyId);
  return user && company ? { user, company, membership } : null;
}
function auth(req, res, store) { const context = ctx(req, store); if (!context) json(res, 401, { error: 'Sign in required' }); return context; }
function companyById(store, id) { return store.companies.find(item => item.id === id); }
function conv(store, id, companyId) { return store.conversations.find(item => item.id === id && item.companyIds.includes(companyId)); }
function connection(store, a, b) { return store.networkConnections.find(item => [item.requesterCompanyId, item.targetCompanyId].includes(a) && [item.requesterCompanyId, item.targetCompanyId].includes(b)); }
function enrichNet(store, item, companyId) { const otherId = item.requesterCompanyId === companyId ? item.targetCompanyId : item.requesterCompanyId; return { ...item, direction: item.requesterCompanyId === companyId ? 'outgoing' : 'incoming', otherCompany: pub(companyById(store, otherId)) }; }
function enrichRef(store, item, companyId) { const otherId = item.fromCompanyId === companyId ? item.toCompanyId : item.fromCompanyId; return { ...item, direction: item.fromCompanyId === companyId ? 'outgoing' : 'incoming', otherCompany: pub(companyById(store, otherId)) }; }
function enrichJob(store, job, company) {
  const mine = store.bids.find(bid => bid.jobId === job.id && bid.biddingCompanyId === company.id);
  const count = store.bids.filter(bid => bid.jobId === job.id && bid.status !== 'withdrawn').length;
  return { ...job, postingCompany: pub(companyById(store, job.postingCompanyId)), bidCount: count, myBid: mine || null, isMine: job.postingCompanyId === company.id };
}

// Location / service-area math.
function locationKey(item) { return `${clean(item.city, 80).toLowerCase()},${clean(item.state, 2).toLowerCase()}`; }
function distanceMiles(a, b) {
  if (locationKey(a) === locationKey(b)) return 0;
  const p = cityCoordinates[locationKey(a)], q = cityCoordinates[locationKey(b)];
  if (!p || !q) return Infinity;
  const rad = degrees => degrees * Math.PI / 180;
  const dLat = rad(q[0] - p[0]), dLon = rad(q[1] - p[1]);
  const z = Math.sin(dLat / 2) ** 2 + Math.cos(rad(p[0])) * Math.cos(rad(q[0])) * Math.sin(dLon / 2) ** 2;
  return Math.round(3959 * 2 * Math.atan2(Math.sqrt(z), Math.sqrt(1 - z)));
}
function inServiceArea(item, company, radius = company.serviceRadius || 50) { const distance = distanceMiles(item, company); return { matches: distance <= radius, distance }; }
function searchMatches(search, job, company) {
  return (!search.trade || clean(job.trade).toLowerCase().includes(clean(search.trade).toLowerCase())) && inServiceArea(job, company, search.radiusMiles || company.serviceRadius || 50).matches;
}

// Notifications.
function notify(store, companyId, type, title, message, pathValue = '', sourceId = '') {
  if (sourceId && store.notifications.some(item => item.companyId === companyId && item.type === type && item.sourceId === sourceId)) return;
  store.notifications.push({ id: uid('not'), companyId, type, title, message, path: pathValue, sourceId, readAt: null, createdAt: now() });
}

// Reviews + calendar.
function otherParty(job, companyId) { return job.postingCompanyId === companyId ? job.awardedCompanyId : job.postingCompanyId; }
function reviewSummary(store, companyId) {
  const reviews = store.reviews.filter(item => item.reviewedCompanyId === companyId);
  return { count: reviews.length, overallRating: reviews.length ? Number((reviews.reduce((sum, item) => sum + item.overallRating, 0) / reviews.length).toFixed(1)) : null, recommends: reviews.filter(item => item.recommends).length, reviews };
}
function calendarParticipant(job, companyId) { return ['awarded', 'completed', 'closed'].includes(job.status) && (job.postingCompanyId === companyId || job.awardedCompanyId === companyId); }
function date(value) { return /^\d{4}-\d{2}-\d{2}$/.test(clean(value, 10)) ? clean(value, 10) : ''; }
function addDay(value) { const d = new Date(`${value}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); }
function compact(value) { return value.replaceAll('-', ''); }
function calendarEvent(store, job, companyId) {
  const partner = companyById(store, otherParty(job, companyId));
  const details = `${job.trade} project with ${partner?.name || 'trade partner'}. ${job.calendarNotes || job.description || ''}`.trim();
  const endExclusive = addDay(job.endDate);
  const googleParams = { text: job.title, dates: `${compact(job.startDate)}/${compact(endExclusive)}`, details, location: `${job.city}, ${job.state}` };
  const outlookParams = { path: '/calendar/action/compose', rru: 'addevent', subject: job.title, startdt: job.startDate, enddt: endExclusive, allday: 'true', body: details, location: `${job.city}, ${job.state}` };
  return { ...job, partnerCompany: pub(partner), googleUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&${new URLSearchParams(googleParams)}`, outlookUrl: `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams(outlookParams)}`, icsPath: `/api/calendar/jobs/${job.id}.ics` };
}
function icsEscape(value) { return String(value || '').replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replace(/\r?\n/g, '\\n'); }
function calendarIcs(store, job, companyId) {
  const event = calendarEvent(store, job, companyId);
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Trades//Shared Project Calendar//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', `UID:${job.id}@trades.app`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`, `DTSTART;VALUE=DATE:${compact(job.startDate)}`, `DTEND;VALUE=DATE:${compact(addDay(job.endDate))}`, `SUMMARY:${icsEscape(job.title)}`, `DESCRIPTION:${icsEscape(`${job.trade} project with ${event.partnerCompany.name}. ${job.calendarNotes || job.description || ''}`)}`, `LOCATION:${icsEscape(`${job.city}, ${job.state}`)}`, 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
}
function validUrl(value) { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : ''; } catch { return ''; } }

// ---- API router ------------------------------------------------------------
async function api(req, res, url) {
  const store = read();
  const p = url.pathname;
  try {
    // Public, unauthenticated routes.
    if (req.method === 'GET' && p === '/api/public-config') return json(res, 200, { googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '', trades });
    if (req.method === 'GET' && p === '/api/storage/status') return json(res, 200, { persistent: persistentStorage, provider: process.env.RAILWAY_VOLUME_MOUNT_PATH ? 'railway-volume' : process.env.DATA_DIR ? 'configured-directory' : 'temporary-filesystem' });

    if (req.method === 'POST' && p === '/api/signup') {
      const b = await body(req);
      const userEmail = email(b.email);
      const password = String(b.password || '');
      const caps = Array.isArray(b.capabilities) ? [...new Set(b.capabilities.filter(value => ['contractor', 'subcontractor'].includes(value)))] : [];
      if (!userEmail.includes('@') || password.length < 8 || !clean(b.fullName) || !clean(b.companyName) || !caps.length) return json(res, 400, { error: 'Complete every required field and use a password with at least 8 characters.' });
      let companyTrades = [];
      if (Array.isArray(b.trades) && b.trades.length) {
        companyTrades = [...new Set(b.trades.map(canonicalTrade).filter(Boolean))];
        if (!companyTrades.length) return json(res, 400, { error: 'Select trades from the standard trade list.' });
      }
      if (store.users.some(item => item.email === userEmail)) return json(res, 409, { error: 'An account already exists for this email.' });
      const credentials = hash(password);
      const user = { id: uid('usr'), email: userEmail, fullName: clean(b.fullName, 100), passwordSalt: credentials.salt, passwordHash: credentials.hash, createdAt: now() };
      const company = { id: uid('cmp'), name: clean(b.companyName, 140), city: clean(b.city, 80), state: clean(b.state, 2).toUpperCase(), capabilities: caps, trades: companyTrades, serviceRadius: 50, createdAt: now() };
      const session = { token: crypto.randomBytes(32).toString('hex'), userId: user.id, expiresAt: new Date(Date.now() + sessionHours * 3600e3).toISOString() };
      store.users.push(user); store.companies.push(company); store.memberships.push({ userId: user.id, companyId: company.id, role: 'owner' }); store.sessions.push(session);
      const invite = store.networkInvites.find(item => item.token === clean(b.inviteToken, 100) && item.status === 'pending');
      if (invite) {
        invite.status = 'accepted'; invite.acceptedCompanyId = company.id; invite.acceptedAt = now();
        store.networkConnections.push({ id: uid('net'), requesterCompanyId: invite.inviterCompanyId, targetCompanyId: company.id, status: 'accepted', note: invite.note || '', sourceInviteId: invite.id, createdAt: now(), respondedAt: now() });
      }
      write(store);
      return json(res, 201, { user: { id: user.id, email: user.email, fullName: user.fullName }, company: pub(company), connectedThroughInvite: Boolean(invite) }, { 'Set-Cookie': cookie(session.token) });
    }

    if (req.method === 'POST' && p === '/api/login') {
      const b = await body(req);
      const user = store.users.find(item => item.email === email(b.email));
      if (!user) return json(res, 404, { error: 'We could not find an account for that email. Accounts created before persistent storage was enabled may need to be recreated.', code: 'account_not_found' });
      if (!match(String(b.password || ''), user)) return json(res, 401, { error: 'The password is incorrect.', code: 'incorrect_password' });
      const membership = store.memberships.find(item => item.userId === user.id);
      const company = companyById(store, membership?.companyId);
      if (!company) return json(res, 409, { error: 'This account needs support before it can sign in.' });
      const session = { token: crypto.randomBytes(32).toString('hex'), userId: user.id, expiresAt: new Date(Date.now() + sessionHours * 3600e3).toISOString() };
      store.sessions = store.sessions.filter(item => item.expiresAt > now());
      store.sessions.push(session);
      write(store);
      return json(res, 200, { user: { id: user.id, email: user.email, fullName: user.fullName }, company: pub(company) }, { 'Set-Cookie': cookie(session.token) });
    }

    if (req.method === 'POST' && p === '/api/logout') {
      store.sessions = store.sessions.filter(item => item.token !== cookies(req).trades_session);
      write(store);
      return json(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) });
    }

    if (req.method === 'GET' && p === '/api/me') {
      const context = auth(req, res, store);
      if (context) return json(res, 200, { user: { id: context.user.id, email: context.user.email, fullName: context.user.fullName }, company: pub(context.company), membership: context.membership });
      return;
    }

    if (req.method === 'GET' && p === '/api/invites/preview') {
      const invite = store.networkInvites.find(item => item.token === clean(url.searchParams.get('token'), 100) && item.status === 'pending');
      return invite ? json(res, 200, { inviterCompany: pub(companyById(store, invite.inviterCompanyId)), invite }) : json(res, 404, { error: 'Invite not found or already used.' });
    }

    // Password reset.
    if (req.method === 'POST' && p === '/api/password/forgot') {
      const b = await body(req);
      const user = store.users.find(item => item.email === email(b.email));
      store.passwordResetTokens = store.passwordResetTokens.filter(item => !item.usedAt && item.expiresAt > now());
      let resetPath = '';
      if (user) {
        store.passwordResetTokens = store.passwordResetTokens.filter(item => item.userId !== user.id);
        const raw = crypto.randomBytes(32).toString('hex');
        store.passwordResetTokens.push({ id: uid('rst'), userId: user.id, tokenHash: tokenHash(raw), expiresAt: new Date(Date.now() + resetMinutes * 60000).toISOString(), usedAt: null, createdAt: now() });
        resetPath = `/reset-password?token=${raw}`;
      }
      write(store);
      return json(res, 200, { message: 'If an account exists for that email, a password reset link is ready.', resetPath, delivery: process.env.PASSWORD_RESET_EMAIL_ENABLED === 'true' ? 'email' : 'preview' });
    }
    if (req.method === 'POST' && p === '/api/password/reset') {
      const b = await body(req);
      const password = String(b.password || '');
      const record = store.passwordResetTokens.find(item => item.tokenHash === tokenHash(clean(b.token, 200)) && !item.usedAt && item.expiresAt > now());
      if (password.length < 8) return json(res, 400, { error: 'Use a password with at least 8 characters.' });
      if (!record) return json(res, 400, { error: 'This reset link is invalid or has expired.' });
      const user = store.users.find(item => item.id === record.userId);
      if (!user) return json(res, 400, { error: 'This reset link is invalid or has expired.' });
      const hashed = hash(password);
      user.passwordSalt = hashed.salt; user.passwordHash = hashed.hash; record.usedAt = now();
      store.sessions = store.sessions.filter(item => item.userId !== user.id);
      write(store);
      return json(res, 200, { message: 'Your password has been updated. Sign in with your new password.' });
    }

    // Dashboard — the single aggregate read for the workspace.
    if (req.method === 'GET' && p === '/api/dashboard') {
      normalizeCompanies(store);
      const context = auth(req, res, store);
      if (!context) return;
      const company = context.company;
      const conversations = store.conversations.filter(item => item.companyIds.includes(company.id)).map(item => {
        const other = companyById(store, item.companyIds.find(id => id !== company.id));
        const messages = store.messages.filter(message => message.conversationId === item.id);
        const last = messages.at(-1);
        return { ...item, otherCompany: pub(other), lastMessage: last ? { body: last.body, createdAt: last.createdAt } : null, unread: messages.filter(message => message.senderCompanyId !== company.id && !message.readByCompanyIds.includes(company.id)).length };
      });
      const connections = store.networkConnections.filter(item => [item.requesterCompanyId, item.targetCompanyId].includes(company.id)).map(item => enrichNet(store, item, company.id));
      const referrals = store.referrals.filter(item => [item.fromCompanyId, item.toCompanyId].includes(company.id)).map(item => enrichRef(store, item, company.id));
      const radius = company.serviceRadius || 50;
      const directory = store.companies.filter(item => item.id !== company.id).map(item => ({ ...pub(item), connectionStatus: connection(store, company.id, item.id)?.status || 'none', distanceMiles: inServiceArea(item, company).distance })).filter(item => item.distanceMiles <= radius);
      const postedJobs = store.jobs.filter(item => item.postingCompanyId === company.id).map(item => enrichJob(store, item, company));
      const availableJobs = store.jobs.filter(item => item.status === 'published' && item.postingCompanyId !== company.id).map(item => ({ ...enrichJob(store, item, company), distanceMiles: inServiceArea(item, company).distance })).filter(item => item.distanceMiles <= radius)
        .sort((a, b) => { const score = job => (job.state === company.state ? 4 : 0) + (job.city.toLowerCase() === company.city.toLowerCase() ? 3 : 0) + (company.trades.some(trade => trade.toLowerCase() === job.trade.toLowerCase()) ? 5 : 0); return score(b) - score(a); });
      return json(res, 200, {
        user: { id: context.user.id, email: context.user.email, fullName: context.user.fullName },
        company: pub(company), conversations, directory, connections,
        invites: store.networkInvites.filter(item => item.inviterCompanyId === company.id), referrals, postedJobs, availableJobs,
        marketplaceLocation: { city: company.city, state: company.state, serviceRadius: radius },
        unreadNotifications: store.notifications.filter(item => item.companyId === company.id && !item.readAt).length
      });
    }

    // Jobs.
    if (req.method === 'POST' && p === '/api/jobs') {
      const context = auth(req, res, store);
      if (!context) return;
      if (!context.company.capabilities.includes('contractor')) return json(res, 403, { error: 'Enable contractor capability to post jobs.' });
      const b = await body(req);
      const title = clean(b.title, 180);
      const trade = canonicalTrade(b.trade);
      const city = clean(b.city, 80);
      const state = clean(b.state, 2).toUpperCase();
      if (!title || !city || state.length !== 2) return json(res, 400, { error: 'Add a title, trade, city, and two-letter state.' });
      if (!trade) return json(res, 400, { error: 'Select a trade from the standard trade list.' });
      const job = { id: uid('job'), postingCompanyId: context.company.id, title, trade, city, state, projectType: clean(b.projectType, 100), budget: clean(b.budget, 100), startDate: clean(b.startDate, 20), description: clean(b.description, 3000), status: 'published', createdAt: now() };
      store.jobs.push(job);
      store.savedSearches.forEach(search => {
        const searchCompany = companyById(store, search.companyId);
        if (searchCompany && searchCompany.id !== job.postingCompanyId && searchMatches(search, job, searchCompany)) notify(store, searchCompany.id, 'matching_job', 'New job matches your saved search', `${job.title} in ${job.city}, ${job.state} matches ${search.name}.`, '/jobs', `${search.id}:${job.id}`);
      });
      write(store);
      return json(res, 201, { job: enrichJob(store, job, context.company) });
    }
    const jobBids = p.match(/^\/api\/jobs\/([^/]+)\/bids$/);
    if (jobBids && req.method === 'GET') {
      const context = auth(req, res, store);
      if (!context) return;
      const job = store.jobs.find(item => item.id === jobBids[1]);
      if (!job || job.postingCompanyId !== context.company.id) return json(res, 403, { error: 'Only the posting company can review these bids.' });
      return json(res, 200, { job: enrichJob(store, job, context.company), bids: store.bids.filter(item => item.jobId === job.id).map(item => ({ ...item, biddingCompany: pub(companyById(store, item.biddingCompanyId)) })) });
    }
    if (jobBids && req.method === 'POST') {
      const context = auth(req, res, store);
      if (!context) return;
      const job = store.jobs.find(item => item.id === jobBids[1]);
      const b = await body(req);
      if (!job || job.status !== 'published') return json(res, 404, { error: 'This job is not open for bids.' });
      if (job.postingCompanyId === context.company.id) return json(res, 403, { error: 'A company cannot bid on its own job.' });
      if (!context.company.capabilities.includes('subcontractor')) return json(res, 403, { error: 'Enable subcontractor capability to submit bids.' });
      const amount = clean(b.amount, 100);
      const scope = clean(b.scope, 2500);
      if (!amount || !scope) return json(res, 400, { error: 'Add a bid amount and scope.' });
      let bid = store.bids.find(item => item.jobId === job.id && item.biddingCompanyId === context.company.id);
      if (bid) Object.assign(bid, { amount, scope, schedule: clean(b.schedule, 200), status: 'submitted', updatedAt: now() });
      else { bid = { id: uid('bid'), jobId: job.id, biddingCompanyId: context.company.id, submittedByUserId: context.user.id, amount, scope, schedule: clean(b.schedule, 200), status: 'submitted', createdAt: now(), updatedAt: now() }; store.bids.push(bid); }
      write(store);
      return json(res, 201, { bid });
    }
    const jobAward = p.match(/^\/api\/jobs\/([^/]+)\/award$/);
    if (jobAward && req.method === 'POST') {
      const context = auth(req, res, store);
      if (!context) return;
      const job = store.jobs.find(item => item.id === jobAward[1]);
      const b = await body(req);
      const bid = store.bids.find(item => item.id === b.bidId && item.jobId === job?.id);
      const startDate = date(b.startDate), endDate = date(b.endDate);
      if (!job || job.postingCompanyId !== context.company.id) return json(res, 403, { error: 'Only the posting contractor can award this job.' });
      if (job.status !== 'published' || !bid) return json(res, 400, { error: 'Choose a valid open bid.' });
      if (!startDate || !endDate || endDate < startDate) return json(res, 400, { error: 'Choose valid project start and end dates.' });
      Object.assign(job, { status: 'awarded', awardedBidId: bid.id, awardedCompanyId: bid.biddingCompanyId, startDate, endDate, calendarNotes: clean(b.calendarNotes, 1200), awardedAt: now() });
      store.bids.filter(item => item.jobId === job.id).forEach(item => { item.status = item.id === bid.id ? 'accepted' : 'declined'; item.updatedAt = now(); });
      if (!store.conversations.find(item => item.companyIds.includes(job.postingCompanyId) && item.companyIds.includes(job.awardedCompanyId))) store.conversations.push({ id: uid('cnv'), companyIds: [job.postingCompanyId, job.awardedCompanyId], jobId: job.id, createdAt: now() });
      notify(store, job.awardedCompanyId, 'job_awarded', 'You were awarded a job', `${context.company.name} awarded you ${job.title}.`, '/calendar', job.id);
      write(store);
      return json(res, 200, { event: calendarEvent(store, job, context.company.id) });
    }
    const jobComplete = p.match(/^\/api\/jobs\/([^/]+)\/complete$/);
    if (jobComplete && req.method === 'POST') {
      const context = auth(req, res, store);
      if (!context) return;
      const job = store.jobs.find(item => item.id === jobComplete[1]);
      if (!job || job.postingCompanyId !== context.company.id) return json(res, 403, { error: 'Only the posting contractor can complete this job.' });
      if (job.status !== 'awarded') return json(res, 400, { error: 'Only awarded jobs can be marked complete.' });
      job.status = 'completed'; job.completedAt = now();
      notify(store, job.awardedCompanyId, 'job_completed', 'Project marked complete', `${job.title} is complete. You can now leave a verified review.`, '/calendar', job.id);
      write(store);
      return json(res, 200, { job });
    }
    const jobEdit = p.match(/^\/api\/jobs\/([^/]+)$/);
    if (jobEdit && req.method === 'PATCH') {
      const context = auth(req, res, store);
      if (!context) return;
      const job = store.jobs.find(item => item.id === jobEdit[1]);
      if (!job || job.postingCompanyId !== context.company.id) return json(res, 403, { error: 'Only the posting contractor can edit this job.' });
      if (job.status !== 'published') return json(res, 400, { error: 'Only published jobs can be edited.' });
      const b = await body(req);
      if (b.title !== undefined) job.title = clean(b.title, 180);
      if (b.trade !== undefined) { const t = canonicalTrade(b.trade); if (!t) return json(res, 400, { error: 'Select a trade from the standard trade list.' }); job.trade = t; }
      if (b.city !== undefined) job.city = clean(b.city, 80);
      if (b.state !== undefined) job.state = clean(b.state, 2).toUpperCase();
      if (b.budget !== undefined) job.budget = clean(b.budget, 100);
      if (b.startDate !== undefined) job.startDate = clean(b.startDate, 20);
      if (b.description !== undefined) job.description = clean(b.description, 3000);
      if (!job.title || !job.city || job.state.length !== 2) return json(res, 400, { error: 'Job must have a title, city, and two-letter state.' });
      job.updatedAt = now();
      write(store);
      return json(res, 200, { job: enrichJob(store, job, context.company) });
    }
    if (jobEdit && req.method === 'DELETE') {
      const context = auth(req, res, store);
      if (!context) return;
      const idx = store.jobs.findIndex(item => item.id === jobEdit[1]);
      if (idx === -1 || store.jobs[idx].postingCompanyId !== context.company.id) return json(res, 403, { error: 'Only the posting contractor can delete this job.' });
      if (store.jobs[idx].status !== 'published') return json(res, 400, { error: 'Only published jobs can be deleted.' });
      store.jobs.splice(idx, 1);
      write(store);
      return json(res, 200, { ok: true });
    }
    const jobReviews = p.match(/^\/api\/jobs\/([^/]+)\/reviews$/);
    if (jobReviews && req.method === 'GET') {
      const context = auth(req, res, store);
      if (!context) return;
      const job = store.jobs.find(item => item.id === jobReviews[1]);
      if (!job || !calendarParticipant(job, context.company.id)) return json(res, 403, { error: 'Reviews are available only to project parties.' });
      return json(res, 200, { reviews: store.reviews.filter(item => item.jobId === job.id) });
    }
    if (jobReviews && req.method === 'POST') {
      const context = auth(req, res, store);
      if (!context) return;
      const job = store.jobs.find(item => item.id === jobReviews[1]);
      const b = await body(req);
      if (!job || job.status !== 'completed' || !calendarParticipant(job, context.company.id)) return json(res, 403, { error: 'Reviews require a completed awarded job.' });
      if (store.reviews.some(item => item.jobId === job.id && item.reviewerCompanyId === context.company.id)) return json(res, 409, { error: 'Your company already reviewed this project partner.' });
      const reviewedCompanyId = otherParty(job, context.company.id);
      const ratings = ['qualityRating', 'scheduleRating', 'communicationRating', 'professionalismRating'].map(key => Math.max(1, Math.min(5, Number(b[key]) || 0)));
      if (ratings.some(value => !value)) return json(res, 400, { error: 'Rate every review category.' });
      const review = { id: uid('rev'), jobId: job.id, trade: job.trade, reviewerCompanyId: context.company.id, reviewedCompanyId, qualityRating: ratings[0], scheduleRating: ratings[1], communicationRating: ratings[2], professionalismRating: ratings[3], overallRating: Number((ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1)), recommends: Boolean(b.recommends), body: clean(b.body, 1500), createdAt: now() };
      store.reviews.push(review);
      notify(store, reviewedCompanyId, 'review_received', 'New verified review', `${context.company.name} reviewed your work on ${job.title}.`, '/profile', review.id);
      write(store);
      return json(res, 201, { review });
    }

    // Calendar.
    if (req.method === 'GET' && p === '/api/calendar') {
      const context = auth(req, res, store);
      if (!context) return;
      return json(res, 200, { events: store.jobs.filter(job => calendarParticipant(job, context.company.id) && job.startDate && job.endDate).map(job => calendarEvent(store, job, context.company.id)) });
    }
    const calendarUpdate = p.match(/^\/api\/calendar\/jobs\/([^/.]+)$/);
    if (calendarUpdate && req.method === 'PUT') {
      const context = auth(req, res, store);
      if (!context) return;
      const job = store.jobs.find(item => item.id === calendarUpdate[1]);
      const b = await body(req);
      const startDate = date(b.startDate), endDate = date(b.endDate);
      if (!job || !calendarParticipant(job, context.company.id)) return json(res, 403, { error: 'This project is not on your shared calendar.' });
      if (!startDate || !endDate || endDate < startDate) return json(res, 400, { error: 'Choose valid project start and end dates.' });
      job.startDate = startDate; job.endDate = endDate; job.calendarNotes = clean(b.calendarNotes, 1200); job.scheduleUpdatedAt = now();
      notify(store, otherParty(job, context.company.id), 'schedule_updated', 'Project schedule updated', `${context.company.name} updated the schedule for ${job.title}.`, '/calendar', `${job.id}:${job.scheduleUpdatedAt}`);
      write(store);
      return json(res, 200, { event: calendarEvent(store, job, context.company.id) });
    }
    const calendarDownload = p.match(/^\/api\/calendar\/jobs\/([^/.]+)\.ics$/);
    if (calendarDownload && req.method === 'GET') {
      const context = auth(req, res, store);
      if (!context) return;
      const job = store.jobs.find(item => item.id === calendarDownload[1]);
      if (!job || !calendarParticipant(job, context.company.id)) return json(res, 404, { error: 'Calendar event not found.' });
      return send(res, 200, calendarIcs(store, job, context.company.id), { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Disposition': `attachment; filename="trades-${job.id}.ics"` });
    }

    // Notifications.
    if (req.method === 'GET' && p === '/api/notifications') {
      const context = auth(req, res, store);
      if (!context) return;
      return json(res, 200, { notifications: store.notifications.filter(item => item.companyId === context.company.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), unread: store.notifications.filter(item => item.companyId === context.company.id && !item.readAt).length });
    }
    if (req.method === 'POST' && p === '/api/notifications/read-all') {
      const context = auth(req, res, store);
      if (!context) return;
      store.notifications.filter(item => item.companyId === context.company.id && !item.readAt).forEach(item => { item.readAt = now(); });
      write(store);
      return json(res, 200, { ok: true });
    }
    const notificationRead = p.match(/^\/api\/notifications\/([^/]+)\/read$/);
    if (notificationRead && req.method === 'POST') {
      const context = auth(req, res, store);
      if (!context) return;
      const item = store.notifications.find(notification => notification.id === notificationRead[1] && notification.companyId === context.company.id);
      if (!item) return json(res, 404, { error: 'Notification not found.' });
      item.readAt = now();
      write(store);
      return json(res, 200, { notification: item });
    }

    // Saved searches.
    if (req.method === 'GET' && p === '/api/saved-searches') {
      const context = auth(req, res, store);
      if (!context) return;
      return json(res, 200, { savedSearches: store.savedSearches.filter(item => item.companyId === context.company.id) });
    }
    if (req.method === 'POST' && p === '/api/saved-searches') {
      const context = auth(req, res, store);
      if (!context) return;
      if (!context.company.capabilities.includes('subcontractor')) return json(res, 403, { error: 'Saved job searches are for subcontractor-capable companies.' });
      const b = await body(req);
      const trade = canonicalTrade(b.trade) || clean(b.trade, 100);
      const radiusMiles = Math.max(5, Math.min(250, Number(b.radiusMiles) || context.company.serviceRadius || 50));
      const search = { id: uid('sea'), companyId: context.company.id, name: clean(b.name, 100) || `${trade || 'All trades'} near ${context.company.city}`, trade, radiusMiles, createdAt: now() };
      store.savedSearches.push(search);
      write(store);
      return json(res, 201, { savedSearch: search });
    }
    const savedSearchDelete = p.match(/^\/api\/saved-searches\/([^/]+)$/);
    if (savedSearchDelete && req.method === 'DELETE') {
      const context = auth(req, res, store);
      if (!context) return;
      store.savedSearches = store.savedSearches.filter(item => !(item.id === savedSearchDelete[1] && item.companyId === context.company.id));
      write(store);
      return json(res, 200, { ok: true });
    }

    // Profile: service area, location, company details, public profile, portfolio, credentials.
    if (req.method === 'PUT' && p === '/api/profile/service-area') {
      const context = auth(req, res, store);
      if (!context) return;
      const b = await body(req);
      const radius = Math.max(5, Math.min(250, Number(b.serviceRadius) || 0));
      if (!radius) return json(res, 400, { error: 'Choose a service radius between 5 and 250 miles.' });
      context.company.serviceRadius = radius;
      write(store);
      return json(res, 200, { company: pub(context.company) });
    }
    if (req.method === 'PUT' && p === '/api/profile/location') {
      const context = auth(req, res, store);
      if (!context) return;
      const b = await body(req);
      const city = clean(b.city, 80);
      const state = clean(b.state, 2).toUpperCase();
      if (!city || state.length !== 2) return json(res, 400, { error: 'Enter a city and two-letter state.' });
      context.company.city = city; context.company.state = state;
      write(store);
      return json(res, 200, { company: pub(context.company) });
    }
    if (req.method === 'PUT' && p === '/api/profile/company') {
      const context = auth(req, res, store);
      if (!context) return;
      let b;
      try { b = await body(req, 2600000); } catch { return json(res, 400, { error: 'Choose a profile image under 1.5 MB.' }); }
      const image = String(b.profileImage || '');
      if (image && (!/^data:image\/(png|jpeg|webp);base64,/i.test(image) || image.length > 2100000)) return json(res, 400, { error: 'Choose a PNG, JPG, or WebP image under 1.5 MB.' });
      for (const [key, max] of Object.entries(profileFields)) context.company[key] = key === 'profileImage' ? image : clean(b[key], max);
      write(store);
      return json(res, 200, { company: companyDetail(context.company) });
    }
    const profileView = p.match(/^\/api\/profiles\/([^/]+)$/);
    if (profileView && req.method === 'GET') {
      const context = auth(req, res, store);
      if (!context) return;
      const target = companyById(store, profileView[1]);
      if (!target) return json(res, 404, { error: 'Company profile not found.' });
      return json(res, 200, { company: companyDetail(target), portfolio: store.portfolioProjects.filter(item => item.companyId === target.id), credentials: store.credentials.filter(item => item.companyId === target.id).map(({ privateDocumentUrl, ...rest }) => rest), reviewSummary: reviewSummary(store, target.id), isOwner: target.id === context.company.id });
    }
    if (req.method === 'POST' && p === '/api/profile/portfolio') {
      const context = auth(req, res, store);
      if (!context) return;
      if (!context.company.capabilities.includes('subcontractor')) return json(res, 403, { error: 'Enable subcontractor capability to publish completed work.' });
      const b = await body(req);
      const title = clean(b.title, 160);
      const photoUrl = validUrl(b.photoUrl);
      if (!title || !photoUrl) return json(res, 400, { error: 'Add a project title and valid image URL.' });
      const project = { id: uid('por'), companyId: context.company.id, title, trade: clean(b.trade, 100), city: clean(b.city, 80), state: clean(b.state, 2).toUpperCase(), completedAt: clean(b.completedAt, 20), description: clean(b.description, 1500), photoUrl, createdAt: now() };
      store.portfolioProjects.push(project);
      write(store);
      return json(res, 201, { project });
    }
    if (req.method === 'POST' && p === '/api/profile/credentials') {
      const context = auth(req, res, store);
      if (!context) return;
      if (!context.company.capabilities.includes('subcontractor')) return json(res, 403, { error: 'Enable subcontractor capability to publish credentials.' });
      const b = await body(req);
      const type = ['license', 'insurance', 'certification', 'bond'].includes(b.type) ? b.type : '';
      const name = clean(b.name, 160);
      if (!type || !name) return json(res, 400, { error: 'Choose a credential type and name.' });
      const credential = { id: uid('cred'), companyId: context.company.id, type, name, issuer: clean(b.issuer, 160), credentialNumber: clean(b.credentialNumber, 100), state: clean(b.state, 2).toUpperCase(), expiresAt: clean(b.expiresAt, 20), coverage: clean(b.coverage, 160), notes: clean(b.notes, 1000), verificationStatus: 'self-reported', createdAt: now() };
      store.credentials.push(credential);
      write(store);
      return json(res, 201, { credential });
    }

    // Conversations + messaging.
    if (req.method === 'POST' && p === '/api/conversations') {
      const context = auth(req, res, store);
      if (!context) return;
      const b = await body(req);
      const other = companyById(store, b.companyId);
      if (!other || other.id === context.company.id) return json(res, 400, { error: 'Choose another company.' });
      let conversation = store.conversations.find(item => item.companyIds.includes(context.company.id) && item.companyIds.includes(other.id));
      if (!conversation) { conversation = { id: uid('cnv'), companyIds: [context.company.id, other.id], jobId: clean(b.jobId, 100) || null, createdAt: now() }; store.conversations.push(conversation); write(store); }
      return json(res, 201, { conversation, otherCompany: pub(other) });
    }
    const conversationMessages = p.match(/^\/api\/conversations\/([^/]+)\/messages$/);
    if (conversationMessages && req.method === 'GET') {
      const context = auth(req, res, store);
      if (!context) return;
      const conversation = conv(store, conversationMessages[1], context.company.id);
      if (!conversation) return json(res, 404, { error: 'Conversation not found.' });
      store.messages.filter(item => item.conversationId === conversation.id && item.senderCompanyId !== context.company.id).forEach(item => { if (!item.readByCompanyIds.includes(context.company.id)) item.readByCompanyIds.push(context.company.id); });
      write(store);
      return json(res, 200, { conversation, otherCompany: pub(companyById(store, conversation.companyIds.find(id => id !== context.company.id))), messages: store.messages.filter(item => item.conversationId === conversation.id) });
    }
    if (conversationMessages && req.method === 'POST') {
      const context = auth(req, res, store);
      if (!context) return;
      const conversation = conv(store, conversationMessages[1], context.company.id);
      const b = await body(req);
      if (!conversation || !clean(b.body, 3000)) return json(res, 400, { error: 'Write a message first.' });
      const message = { id: uid('msg'), conversationId: conversation.id, senderUserId: context.user.id, senderCompanyId: context.company.id, senderName: context.user.fullName, body: clean(b.body, 3000), readByCompanyIds: [context.company.id], createdAt: now() };
      store.messages.push(message);
      write(store);
      return json(res, 201, { message });
    }

    // Trade network.
    if (req.method === 'POST' && p === '/api/network/requests') {
      const context = auth(req, res, store);
      if (!context) return;
      const b = await body(req);
      const other = companyById(store, b.companyId);
      if (!other || connection(store, context.company.id, other.id)) return json(res, 409, { error: 'A connection or request already exists.' });
      const record = { id: uid('net'), requesterCompanyId: context.company.id, targetCompanyId: other.id, status: 'pending', note: clean(b.note, 500), createdAt: now() };
      store.networkConnections.push(record);
      write(store);
      return json(res, 201, { connection: enrichNet(store, record, context.company.id) });
    }
    const networkRespond = p.match(/^\/api\/network\/requests\/([^/]+)\/respond$/);
    if (networkRespond && req.method === 'POST') {
      const context = auth(req, res, store);
      if (!context) return;
      const record = store.networkConnections.find(item => item.id === networkRespond[1] && item.targetCompanyId === context.company.id && item.status === 'pending');
      const b = await body(req);
      if (!record || !['accepted', 'declined'].includes(b.status)) return json(res, 400, { error: 'This request cannot be updated.' });
      record.status = b.status; record.respondedAt = now();
      write(store);
      return json(res, 200, { connection: enrichNet(store, record, context.company.id) });
    }
    if (req.method === 'POST' && p === '/api/network/invites') {
      const context = auth(req, res, store);
      if (!context) return;
      const b = await body(req);
      const inviteEmail = email(b.email);
      if (!inviteEmail.includes('@')) return json(res, 400, { error: 'Enter a valid email address.' });
      let invite = store.networkInvites.find(item => item.inviterCompanyId === context.company.id && item.email === inviteEmail && item.status === 'pending');
      if (!invite) { invite = { id: uid('inv'), token: crypto.randomBytes(24).toString('hex'), inviterCompanyId: context.company.id, email: inviteEmail, name: clean(b.name, 100), companyName: clean(b.companyName, 140), trade: clean(b.trade, 100), note: clean(b.note, 500), status: 'pending', createdAt: now() }; store.networkInvites.push(invite); write(store); }
      return json(res, 201, { invite, signupPath: `/signup?invite=${invite.token}` });
    }
    if (req.method === 'POST' && p === '/api/referrals') {
      const context = auth(req, res, store);
      if (!context) return;
      const b = await body(req);
      const other = companyById(store, b.companyId);
      if (!other || connection(store, context.company.id, other.id)?.status !== 'accepted') return json(res, 400, { error: 'Referrals require an accepted connection.' });
      const referral = { id: uid('ref'), fromCompanyId: context.company.id, toCompanyId: other.id, title: clean(b.title, 180), note: clean(b.note, 1500), status: 'sent', createdAt: now() };
      store.referrals.push(referral);
      write(store);
      return json(res, 201, { referral: enrichRef(store, referral, context.company.id) });
    }
    const referralRespond = p.match(/^\/api\/referrals\/([^/]+)\/respond$/);
    if (referralRespond && req.method === 'POST') {
      const context = auth(req, res, store);
      if (!context) return;
      const referral = store.referrals.find(item => item.id === referralRespond[1] && item.toCompanyId === context.company.id);
      const b = await body(req);
      if (!referral || !['interested', 'passed'].includes(b.status)) return json(res, 400, { error: 'Referral cannot be updated.' });
      referral.status = b.status; referral.respondedAt = now();
      write(store);
      return json(res, 200, { referral: enrichRef(store, referral, context.company.id) });
    }

    return json(res, 404, { error: 'API route not found.' });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'Something went wrong. Please try again.' });
  }
}

// ---- Static + page routes --------------------------------------------------
const routes = { '/login': '/account.html', '/signup': '/account.html', '/forgot-password': '/account.html', '/reset-password': '/account.html', '/dashboard': '/dashboard.html', '/messages': '/dashboard.html', '/network': '/dashboard.html', '/jobs': '/dashboard.html', '/profile': '/dashboard.html', '/calendar': '/dashboard.html', '/notifications': '/dashboard.html' };

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) return api(req, res, url);
  if (url.pathname === '/health') return json(res, 200, { status: 'ok' });
  let pathname;
  try { pathname = decodeURIComponent(routes[url.pathname] || (url.pathname === '/' ? '/index.html' : url.pathname)); } catch { return send(res, 400, 'Bad request'); }
  const file = path.resolve(publicRoot, `.${pathname}`);
  if (!file.startsWith(`${publicRoot}${path.sep}`)) return send(res, 403, 'Forbidden');
  fs.stat(file, (error, stats) => {
    if (error || !stats.isFile()) return send(res, 404, 'Not found');
    const extension = path.extname(file).toLowerCase();
    res.writeHead(200, { ...headers, 'Content-Type': types[extension] || 'application/octet-stream', 'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=3600' });
    fs.createReadStream(file).pipe(res);
  });
});

server.listen(port, '0.0.0.0', () => console.log(`Trades marketplace listening on port ${port}; storage=${persistentStorage ? 'persistent' : 'temporary'}`));
