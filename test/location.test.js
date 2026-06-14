const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const port = 33000 + Math.floor(Math.random() * 2000);
let server;
let dataDir;

async function wait() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/health`)).ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw Error('server');
}

async function request(route, options = {}, cookie = '') {
  const response = await fetch(`http://127.0.0.1:${port}${route}`, {
    headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) },
    ...options
  });
  return {
    response,
    data: await response.json(),
    cookie: response.headers.get('set-cookie')?.split(';')[0] || cookie
  };
}

test.before(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trades-location-test-'));
  server = spawn(process.execPath, ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: String(port), DATA_DIR: dataDir },
    stdio: 'ignore'
  });
  await wait();
});

test.after(() => {
  server.kill();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

test('coordinate locations persist and drive nationwide radius matching', async () => {
  const contractor = await request('/api/signup', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Coordinate Contractor',
      companyName: 'Coordinate GC',
      city: 'Springfield',
      state: 'TX',
      placeId: 'contractor-place',
      formattedLocation: 'Springfield, TX, USA',
      latitude: 32.7767,
      longitude: -96.797,
      email: 'coordinate-gc@example.com',
      password: 'test-password',
      capabilities: ['contractor']
    })
  });
  const sub = await request('/api/signup', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Coordinate Sub',
      companyName: 'Coordinate Electrical',
      city: 'Springfield',
      state: 'TX',
      placeId: 'sub-place',
      formattedLocation: 'Springfield, TX, USA',
      latitude: 32.8,
      longitude: -96.8,
      email: 'coordinate-sub@example.com',
      password: 'test-password',
      capabilities: ['subcontractor'],
      trades: ['Electrical']
    })
  });

  assert.equal(sub.data.company.placeId, 'sub-place');
  assert.equal(sub.data.company.latitude, 32.8);

  const nearby = await request('/api/jobs', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Nearby electrical work',
      trade: 'Electrical',
      city: 'Springfield',
      state: 'TX',
      placeId: 'nearby-place',
      formattedLocation: 'Springfield, TX, USA',
      latitude: 32.79,
      longitude: -96.81,
      description: 'Nearby coordinate job.'
    })
  }, contractor.cookie);
  const far = await request('/api/jobs', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Far electrical work',
      trade: 'Electrical',
      city: 'Springfield',
      state: 'TX',
      placeId: 'far-place',
      formattedLocation: 'Springfield, TX, USA',
      latitude: 30.2672,
      longitude: -97.7431,
      description: 'Far coordinate job.'
    })
  }, contractor.cookie);

  assert.equal(nearby.data.job.placeId, 'nearby-place');
  assert.equal(far.data.job.longitude, -97.7431);

  const dashboard = await request('/api/dashboard', {}, sub.cookie);
  assert.deepEqual(dashboard.data.availableJobs.map(job => job.title), ['Nearby electrical work']);
  assert.ok(dashboard.data.availableJobs[0].distanceMiles < 10);
  assert.equal(dashboard.data.marketplaceLocation.placeId, 'sub-place');
});

test('legacy city records do not become zero-zero coordinates', async () => {
  const legacy = await request('/api/signup', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Legacy Dallas User',
      companyName: 'Legacy Dallas Co',
      city: 'Dallas',
      state: 'TX',
      email: 'legacy-dallas@example.com',
      password: 'test-password',
      capabilities: ['subcontractor']
    })
  });

  assert.equal(legacy.data.company.latitude, null);
  assert.equal(legacy.data.company.longitude, null);
  const dashboard = await request('/api/dashboard', {}, legacy.cookie);
  assert.equal(dashboard.data.company.latitude, 32.7767);
  assert.equal(dashboard.data.company.longitude, -96.797);
});
