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
