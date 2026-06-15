const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

test('Find Jobs clear button aligns with the radius control',()=>{
  const styles=fs.readFileSync(path.join(__dirname,'..','prototype','layout-polish.css'),'utf8');
  assert.match(styles,/\.job-filters\{align-items:end\}/);
  assert.match(styles,/\.job-filters #clearJobFilters\{height:40px;min-height:40px;[^}]*align-self:end\}/);
});

test('contractor-only Jobs view explicitly removes search, alerts, and available jobs',()=>{
  const script=fs.readFileSync(path.join(__dirname,'..','prototype','jobs.js'),'utf8');
  const styles=fs.readFileSync(path.join(__dirname,'..','prototype','jobs.css'),'utf8');
  assert.match(script,/jobFilters\.style\.display=isSub\?'':'none'/);
  assert.match(script,/availableSection\.style\.display=isSub\?'':'none'/);
  assert.match(styles,/\.job-filters\[hidden\],\.job-section\[hidden\]\{display:none!important\}/);
});

test('flexible-account Posted Jobs content stays below the role tabs',()=>{
  const tabs=fs.readFileSync(path.join(__dirname,'..','prototype','job-tabs.js'),'utf8');
  assert.match(tabs,/postedJobs\.previousElementSibling !== tabs/);
  assert.match(tabs,/tabs\.after\(postedJobs\)/);
});

test('job posts and bids capture and display whether materials are included',()=>{
  const script=fs.readFileSync(path.join(__dirname,'..','prototype','jobs.js'),'utf8');
  assert.match(script,/Materials included in budget\?/);
  assert.match(script,/Materials included in bid\?/);
  assert.match(script,/materialsText\(job\.materialsIncluded\)/);
  assert.match(script,/materialsText\(bid\.materialsIncluded\)/);
});
