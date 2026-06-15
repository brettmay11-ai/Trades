const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('shared schedule job references have dedicated responsive formatting',()=>{
  const script=read('prototype/dashboard-overview.js');
  const styles=read('prototype/dashboard-overview.css');
  const html=read('prototype/dashboard.html');
  assert.match(script,/dashboard-week-reference/);
  assert.match(script,/dashboard-week-arrow/);
  assert.match(styles,/\.dashboard-week-copy\{min-width:0\}/);
  assert.match(styles,/\.dashboard-week-reference small\+small/);
  assert.match(styles,/grid-template-columns:46px minmax\(0,1fr\) 20px/);
  assert.match(html,/dashboard-overview\.css\?v=20260615-dashboard2/);
  assert.match(html,/dashboard-overview\.js\?v=20260615-dashboard2/);
});
