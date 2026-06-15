const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('landing hero swaps role-specific marketplace job cards',()=>{
  const script=read('prototype/home.js');
  assert.match(script,/role-marketplace-preview/);
  assert.match(script,/Your posted jobs/);
  assert.match(script,/Matched to your profile/);
  assert.match(script,/Review bids/);
  assert.match(script,/View & bid/);
  assert.doesNotMatch(script,/preview-window|preview-app|preview-nav/);
});

test('landing job cards remain readable on mobile',()=>{
  const roleStyles=read('prototype/home-role.css');
  const layout=read('prototype/home-hero-layout.css');
  assert.match(roleStyles,/\.hero-job-card:nth-child\(3\)\{display:none\}/);
  assert.match(roleStyles,/\.role-switcher\{grid-template-columns:1fr 1fr\}/);
  assert.match(layout,/@media\(max-width:760px\)/);
});

test('landing proof strip focuses on useful marketplace benefits',()=>{
  const html=read('prototype/index.html');
  assert.match(html,/Jobs near your crew/);
  assert.match(html,/Trade partners you can verify/);
  assert.match(html,/Private bids and messages/);
  assert.match(html,/Referrals that build your network/);
  assert.doesNotMatch(html,/DFW is the first active market/);
});

test('landing role paths use large green labels and omit the old trust section',()=>{
  const html=read('prototype/index.html');
  const styles=read('prototype/styles.css');
  assert.match(html,/role-path-label">Contractor workspace/);
  assert.match(html,/role-path-label">Subcontractor workspace/);
  assert.match(html,/role-path-label">Dual capability/);
  assert.match(styles,/\.role-path-label\{display:block;color:var\(--green\);font:800/);
  assert.doesNotMatch(html,/Local trust\. National reach\./);
  assert.doesNotMatch(html,/class="section trust-section"/);
  assert.doesNotMatch(html,/href="#trust"/);
});

test('landing closes with a full-width orange call to action and green sign in',()=>{
  const html=read('prototype/index.html');
  const styles=read('prototype/styles.css');
  assert.doesNotMatch(html,/DFW first\. Nationwide next\./);
  assert.match(html,/class="button button-green" href="\/login">Sign in/);
  assert.match(styles,/\.button-green \{ color: #fff; background: var\(--green\);/);
  assert.match(styles,/\.cta-section \{ margin: 0; padding: 82px 7vw;/);
  assert.match(styles,/background: var\(--orange\);/);
});

test('how it works uses customer-facing call to action copy',()=>{
  const html=read('prototype/index.html');
  assert.match(html,/Ready to find the right crew or your next job\?/);
  assert.match(html,/>Join Trades<\/a>/);
  assert.doesNotMatch(html,/first backend milestone/i);
});
