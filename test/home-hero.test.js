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

test('landing page exposes Facebook-ready social preview metadata',()=>{
  const html=read('prototype/index.html');
  assert.match(html,/<link rel="canonical" href="https:\/\/findtrades\.co\/">/);
  assert.match(html,/property="og:title" content="Trades \| The Smart Construction Trade Network"/);
  assert.match(html,/property="og:image" content="https:\/\/findtrades\.co\/trades-social-preview\.png"/);
  assert.match(html,/property="og:image:secure_url" content="https:\/\/findtrades\.co\/trades-social-preview\.png"/);
  assert.match(html,/property="og:image:type" content="image\/png"/);
  assert.match(html,/property="og:image:alt"/);
  assert.match(html,/name="twitter:image" content="https:\/\/findtrades\.co\/trades-social-preview\.png"/);
  assert.ok(fs.existsSync(path.join(root,'prototype','trades-social-preview.png')));
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

test('landing hero uses the selected dark blueprint background',()=>{
  const html=read('prototype/index.html');
  const styles=read('prototype/styles.css');
  assert.match(styles,/\.hero \{[^}]*background: #0b2538;/);
  assert.match(styles,/background-size: 48px 48px, 48px 48px, 12px 12px, 12px 12px;/);
  assert.match(styles,/\.hero-glow-two \{[^}]*background: #5e94b2;/);
  assert.match(html,/styles\.css\?v=20260616-logo1/);
});

test('site uses the blueprint blue brand system across public and account pages',()=>{
  const styles=read('prototype/styles.css');
  const brand=read('prototype/brand-blue.css');
  for(const page of ['prototype/index.html','prototype/pricing.html','prototype/account.html','prototype/admin.html','prototype/admin-login.html']){
    assert.match(read(page),/brand-blue\.css\?v=20260615-blue1/);
  }
  assert.match(styles,/--ink: #102331;/);
  assert.match(styles,/--green: #245f82;/);
  assert.match(styles,/--sage: #dce9f0;/);
  assert.match(brand,/\.dashboard-nav \{ background: #0b2538; \}/);
  assert.match(brand,/\.admin-nav \{ background: #071c2a; \}/);
  assert.match(read('prototype/dashboard-bridge.js'),/brand-blue\.css\?v=20260615-blue1/);
});

test('landing hero removes the old create workspace and sign in box',()=>{
  const script=read('prototype/home.js');
  const brand=read('prototype/brand-blue.css');
  assert.match(script,/document\.querySelector\('\.hero-search'\)\?\.remove\(\)/);
  assert.match(brand,/\.hero-search \{ display: none !important; \}/);
});
