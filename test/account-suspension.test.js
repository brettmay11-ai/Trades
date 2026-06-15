const assert=require('node:assert/strict');
const{spawn}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),test=require('node:test');
const port=32153;
let server,dataDir;
async function wait(){for(let i=0;i<80;i++){try{if((await fetch(`http://127.0.0.1:${port}/health`)).ok)return}catch{}await new Promise(resolve=>setTimeout(resolve,100))}throw Error('server did not start')}
async function request(route,options={},cookie=''){const response=await fetch(`http://127.0.0.1:${port}${route}`,{headers:{'Content-Type':'application/json',...(cookie?{cookie}:{})},...options});const text=await response.text();return{response,data:text?JSON.parse(text):null,cookie:response.headers.get('set-cookie')?.split(';')[0]||cookie}}
test.before(async()=>{dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'trades-suspension-test-'));server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port),DATA_DIR:dataDir,TRADES_ADMIN_EMAILS:'owner@example.com',ADMIN_MAGIC_LINK_PREVIEW:'true'},stdio:'ignore'});await wait()});
test.after(()=>{server.kill();fs.rmSync(dataDir,{recursive:true,force:true})});

test('owner can suspend and reactivate a company account',async()=>{
  await request('/api/signup',{method:'POST',body:JSON.stringify({fullName:'Account Owner',companyName:'Suspend Test Co',city:'Dallas',state:'TX',trades:['Electrical'],email:'member@example.com',password:'test-password',capabilities:['subcontractor']})});
  const normalLogin=await request('/api/login',{method:'POST',body:JSON.stringify({email:'member@example.com',password:'test-password'})});
  const magic=await request('/api/admin/magic/request',{method:'POST',body:JSON.stringify({email:'owner@example.com'})});
  const token=new URL(`http://local${magic.data.magicPath}`).searchParams.get('token');
  const verified=await request('/api/admin/magic/verify',{method:'POST',body:JSON.stringify({token})});
  const admin=await request('/api/admin',{},verified.cookie);
  const company=admin.data.companies.find(item=>item.name==='Suspend Test Co');

  const suspended=await request(`/api/admin/companies/${company.id}/status`,{method:'PATCH',body:JSON.stringify({status:'suspended'})},verified.cookie);
  assert.equal(suspended.response.status,200);
  assert.equal(suspended.data.company.accountStatus,'suspended');
  assert.equal((await request('/api/me',{},normalLogin.cookie)).response.status,401);
  const blocked=await request('/api/login',{method:'POST',body:JSON.stringify({email:'member@example.com',password:'test-password'})});
  assert.equal(blocked.response.status,403);
  assert.equal(blocked.data.code,'account_suspended');

  const active=await request(`/api/admin/companies/${company.id}/status`,{method:'PATCH',body:JSON.stringify({status:'active'})},verified.cookie);
  assert.equal(active.response.status,200);
  assert.equal(active.data.company.accountStatus,'active');
  assert.equal((await request('/api/login',{method:'POST',body:JSON.stringify({email:'member@example.com',password:'test-password'})})).response.status,200);
});
