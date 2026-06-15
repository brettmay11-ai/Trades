const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('hero preview gallery provides five alternatives and the current direction',()=>{
  const html=read('prototype/hero-options.html'),styles=read('prototype/hero-options.css'),server=read('server.js');
  for(const name of ['Topographic','Blueprint','Spotlight Gradient','Connected Markets','Architectural Paper','Green Grid'])assert.match(html,new RegExp(name));
  assert.match(styles,/\.sample-topographic/);
  assert.match(styles,/\.sample-blueprint/);
  assert.match(styles,/\.sample-spotlight/);
  assert.match(server,/'\/hero-options': '\/hero-options\.html'/);
});
