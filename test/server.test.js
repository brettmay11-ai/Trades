const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const port = 32147;
let server;
let dataDir;

async function waitForServer() { for (let attempt = 0; attempt < 40; attempt += 1) { try { const response = await fetch(`http://127.0.0.1:${port}/health`); if (response.ok) return; } catch {} await new Promise(resolve => setTimeout(resolve, 100)); } throw new Error('Server did not start'); }
async function request(pathname, options = {}, cookie = '') { const response = await fetch(`http://127.0.0.1:${port}${pathname}`, { headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) }, ...options }); return { response, data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] || cookie }; }

test.before(async () => { dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trades-test-')); server = spawn(process.execPath, ['server.js'], { cwd: path.resolve(__dirname, '..'), env: { ...process.env, PORT: String(port), DATA_DIR: dataDir }, stdio: 'ignore' }); await waitForServer(); });
test.after(() => { server.kill(); fs.rmSync(dataDir, { recursive: true, force: true }); });

test('contractor and subcontractor accounts can communicate', async () => {
  const contractor = await request('/api/signup', { method: 'POST', body: JSON.stringify({ fullName: 'Casey Builder', companyName: 'Casey General', city: 'Dallas', state: 'TX', email: 'contractor@example.com', password: 'test-password', capabilities: ['contractor'] }) });
  assert.equal(contractor.response.status, 201);
  const subcontractor = await request('/api/signup', { method: 'POST', body: JSON.stringify({ fullName: 'Sam Trade', companyName: 'Sam Electric', city: 'Fort Worth', state: 'TX', trades: ['Electrical'], email: 'sub@example.com', password: 'test-password', capabilities: ['subcontractor'] }) });
  assert.equal(subcontractor.response.status, 201);
  const contractorDashboard = await request('/api/dashboard', {}, contractor.cookie);
  assert.equal(contractorDashboard.data.directory[0].name, 'Sam Electric');
  const conversation = await request('/api/conversations', { method: 'POST', body: JSON.stringify({ companyId: subcontractor.data.company.id }) }, contractor.cookie);
  assert.equal(conversation.response.status, 201);
  const sent = await request(`/api/conversations/${conversation.data.conversation.id}/messages`, { method: 'POST', body: JSON.stringify({ body: 'Can you price our electrical package?' }) }, contractor.cookie);
  assert.equal(sent.response.status, 201);
  const received = await request(`/api/conversations/${conversation.data.conversation.id}/messages`, {}, subcontractor.cookie);
  assert.equal(received.data.messages[0].body, 'Can you price our electrical package?');
  assert.equal(received.data.otherCompany.name, 'Casey General');
});
