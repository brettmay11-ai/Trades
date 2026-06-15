const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('role-aware dashboard replaces generic setup metrics with operational work cards',()=>{
  const html=read('prototype/dashboard.html'),script=read('prototype/dashboard-overview.js'),styles=read('prototype/dashboard-overview.css');
  assert.match(html,/dashboard-overview\.css/);
  assert.match(html,/dashboard-overview\.js/);
  assert.match(script,/Jobs this week/);
  assert.match(script,/Outstanding bids/);
  assert.match(script,/Awarded bids/);
  assert.match(script,/Jobs for you/);
  assert.match(script,/Posted jobs/);
  assert.match(script,/Jobs in progress/);
  assert.match(script,/Recent conversations/);
  assert.match(styles,/\.dashboard-role-grid/);
});

test('dashboard API includes submitted bids and scheduled jobs for role cards',()=>{
  const server=read('server.js');
  assert.match(server,/const submittedBids = store\.bids\.filter/);
  assert.match(server,/const scheduledJobs = store\.jobs\.filter/);
  assert.match(server,/postedJobs, availableJobs, submittedBids, scheduledJobs/);
});
