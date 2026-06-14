const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

test('Find Jobs clear button aligns with the radius control',()=>{
  const styles=fs.readFileSync(path.join(__dirname,'..','prototype','layout-polish.css'),'utf8');
  assert.match(styles,/\.job-filters\{align-items:end\}/);
  assert.match(styles,/\.job-filters #clearJobFilters\{height:40px;min-height:40px;[^}]*align-self:end\}/);
});
