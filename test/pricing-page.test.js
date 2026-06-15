const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('landing intro is explicitly centered and links to pricing',()=>{
  const html=read('prototype/index.html'),styles=read('prototype/styles.css');
  assert.match(styles,/\.centered-heading p\{margin-left:auto;margin-right:auto;text-align:center\}/);
  assert.match(html,/href="\/pricing">Pricing/);
});

test('pricing page presents all three account types as free during launch',()=>{
  const html=read('prototype/pricing.html'),styles=read('prototype/pricing.css'),server=read('server.js');
  assert.match(server,/'\/pricing': '\/pricing\.html'/);
  assert.match(html,/Contractor &amp; Subcontractor/);
  assert.match(html,/Create contractor account/);
  assert.match(html,/Create subcontractor account/);
  assert.equal((html.match(/<strong>Free<\/strong>/g)||[]).length,3);
  assert.match(html,/Pricing will be announced soon\./);
  assert.match(styles,/\.pricing-plans/);
  assert.match(styles,/@media\(max-width:760px\)/);
});
