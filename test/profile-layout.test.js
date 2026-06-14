const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

test('marketplace reach is integrated into the rendered profile flow', () => {
  const location = fs.readFileSync(path.join(root, 'prototype', 'location.js'), 'utf8');
  const roleProfile = fs.readFileSync(path.join(root, 'prototype', 'profile-v2.js'), 'utf8');
  const dashboard = fs.readFileSync(path.join(root, 'prototype', 'dashboard.html'), 'utf8');

  assert.match(location, /profileDetails/);
  assert.match(location, /Marketplace reach/);
  assert.match(location, /profile-trust-section/);
  assert.doesNotMatch(location, /profile\.prepend/);
  assert.match(roleProfile, /TradesLocation\?\.render/);
  assert.match(dashboard, /location\.js\?v=20260614-profile-location1/);
  assert.match(dashboard, /profile-v2\.js\?v=20260614-profile-location1/);
});
