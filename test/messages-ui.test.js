const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('messages workspace includes inbox filters, project context, and improved composer',()=>{
  const html=read('prototype/dashboard.html'),script=read('prototype/messages-v2.js'),jobs=read('prototype/jobs.js'),styles=read('prototype/messages.css'),polish=read('prototype/layout-polish.css');
  assert.match(html,/conversationSearch/);
  assert.match(html,/data-message-filter="unread"/);
  assert.match(html,/messageHeaderActions/);
  assert.match(script,/renderMessageGroups/);
  assert.match(html,/Shift\+Enter/);
  assert.match(jobs,/data-message-job-context/);
  assert.match(jobs,/startConversation\(button\.dataset\.messageBid,button\.dataset\.messageJobContext\)/);
  assert.match(styles,/\.conversation-item\.active/);
  assert.match(polish,/\.message-form>\.button\{height:46px;min-height:46px;align-self:start\}/);
});

test('server keeps job conversations separate and enriches their context',()=>{
  const server=read('server.js');
  assert.match(server,/function conversationJob/);
  assert.match(server,/\(item\.jobId \|\| null\) === jobId/);
  assert.match(server,/job: conversationJob\(store, item\)/);
});
