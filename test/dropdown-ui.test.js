const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('predictive pickers use the custom Trades suggestion menu instead of browser datalists',()=>{
  const taxonomy=read('prototype/taxonomy.js');
  assert.match(taxonomy,/enableSuggestionMenu/);
  assert.match(taxonomy,/input\.addEventListener\('click',\(\)=>open\(true\)\)/);
  assert.match(taxonomy,/input\.addEventListener\('focus',\(\)=>open\(true\)\)/);
  assert.doesNotMatch(taxonomy,/createElement\('datalist'\)|setAttribute\('list'/);
});

test('native selects and predictive menus have Trades styling',()=>{
  const styles=read('prototype/styles.css');
  const taxonomy=read('prototype/taxonomy.css');
  assert.match(styles,/select\s*\{[\s\S]*appearance:\s*none/);
  assert.match(styles,/background-image:[\s\S]*var\(--green\)/);
  assert.match(taxonomy,/\.trades-suggestion-menu/);
  assert.match(taxonomy,/border-top:3px solid var\(--orange\)/);
});

test('profile credential type dropdown keeps the Trades picker design',()=>{
  const brand=read('prototype/brand-blue.css');
  assert.match(brand,/\.profile-form-section select,/);
  assert.match(brand,/\.trust-form select/);
  assert.match(brand,/background-image:[\s\S]*var\(--green\)/);
});
