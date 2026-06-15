const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('dashboard mobile shell keeps five primary tabs and exposes direct header tools',()=>{
  const html=read('prototype/dashboard.html'),styles=read('prototype/mobile.css'),script=read('prototype/mobile.js');
  assert.match(html,/mobile\.css\?v=20260615-mobile3/);
  assert.match(html,/mobile\.js\?v=20260615-mobile3/);
  assert.match(styles,/grid-template-columns:repeat\(5,1fr\)/);
  assert.match(styles,/\[data-view="calendar"\],\.dashboard-nav nav \[data-view="notifications"\]\{display:none\}/);
  assert.match(script,/data-mobile-calendar/);
  assert.match(script,/data-mobile-notifications/);
  assert.match(script,/data-mobile-signout/);
  assert.doesNotMatch(script,/mobile-more-sheet|data-mobile-more|data-mobile-view="profile"/);
});

test('mobile messages use an inbox-to-conversation flow',()=>{
  const styles=read('prototype/mobile.css'),script=read('prototype/mobile.js'),messages=read('prototype/messages-v2.js');
  assert.match(styles,/mobile-chat-open \.conversation-list\{display:none\}/);
  assert.match(styles,/mobile-chat-open \.message-panel\{height:100%;display:flex/);
  assert.match(script,/mobile-message-back/);
  assert.match(script,/classList\.add\('mobile-chat-open'\)/);
  assert.match(messages,/shouldAutoOpenConversation/);
});

test('public and account pages load the phone-first layer',()=>{
  assert.match(read('prototype/index.html'),/mobile\.css\?v=20260615-mobile3/);
  assert.match(read('prototype/account.html'),/mobile\.css\?v=20260615-mobile3/);
  const styles=read('prototype/mobile.css');
  assert.match(styles,/\.role-preview\{width:100%;overflow:visible\}/);
  assert.match(styles,/\.account-panel\{padding:16px 12px 30px\}/);
});
