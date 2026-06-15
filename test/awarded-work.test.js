const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('subcontractor Jobs page tracks awarded bids with full project details',()=>{
  const script=read('prototype/awarded-work.js');
  const styles=read('prototype/awarded-work.css');
  const html=read('prototype/dashboard.html');
  assert.match(script,/Awarded Work/);
  assert.match(script,/submittedBids\|\|\[\]\)\.filter\(bid=>bid\.status==='accepted'\)/);
  assert.match(script,/Accepted scope/);
  assert.match(script,/Job scope/);
  assert.match(script,/Posted budget/);
  assert.match(script,/Proposed schedule/);
  assert.match(script,/Shared schedule notes/);
  assert.match(script,/Message contractor/);
  assert.match(script,/Open calendar/);
  assert.match(styles,/\.awarded-work-grid/);
  assert.match(styles,/\.awarded-work-facts/);
  assert.match(html,/awarded-work\.css\?v=20260615-awarded1/);
  assert.match(html,/awarded-work\.js\?v=20260615-awarded1/);
});
