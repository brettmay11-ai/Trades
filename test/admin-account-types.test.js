const assert=require('node:assert/strict');
const{spawn}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),test=require('node:test');
const port=32155;
let server,dataDir;
async function wait(){for(let i=0;i<80;i++){try{if((await fetch(`http://127.0.0.1:${port}/health`)).ok)return}catch{}await new Promise(resolve=>setTimeout(resolve,100))}throw Error('server did not start')}
async function request(route,options={},cookie=''){const response=await fetch(`http://127.0.0.1:${port}${route}`,{headers:{'Content-Type':'application/json',...(cookie?{cookie}:{})},...options});const text=await response.text();return{response,data:text?JSON.parse(text):null,cookie:response.headers.get('set-cookie')?.split(';')[0]||cookie}}
test.before(async()=>{dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'trades-admin-types-'));server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port),DATA_DIR:dataDir,TRADES_ADMIN_EMAILS:'owner@example.com',ADMIN_MAGIC_LINK_PREVIEW:'true'},stdio:'ignore'});await wait()});
test.after(()=>{server.kill();fs.rmSync(dataDir,{recursive:true,force:true})});

test('owner dashboard separates contractor-only, subcontractor-only, and dual accounts',async()=>{
  await request('/api/signup',{method:'POST',body:JSON.stringify({fullName:'Contractor Owner',companyName:'Only Contractor Co',city:'Dallas',state:'TX',trades:['Framing and Rough Carpentry'],email:'contractor@example.com',password:'test-password',capabilities:['contractor']})});
  await request('/api/signup',{method:'POST',body:JSON.stringify({fullName:'Subcontractor Owner',companyName:'Only Sub Co',city:'Fort Worth',state:'TX',trades:['Electrical'],email:'subcontractor@example.com',password:'test-password',capabilities:['subcontractor']})});
  await request('/api/signup',{method:'POST',body:JSON.stringify({fullName:'Flexible Owner',companyName:'Dual Role Co',city:'Arlington',state:'TX',trades:['Painting and Coatings'],email:'dual@example.com',password:'test-password',capabilities:['contractor','subcontractor']})});

  const requested=await request('/api/admin/magic/request',{method:'POST',body:JSON.stringify({email:'owner@example.com'})});
  const token=new URL(`http://local${requested.data.magicPath}`).searchParams.get('token');
  const verified=await request('/api/admin/magic/verify',{method:'POST',body:JSON.stringify({token})});
  const admin=await request('/api/admin',{},verified.cookie);
  assert.equal(admin.response.status,200);
  assert.equal(admin.data.metrics.companies,3);
  assert.equal(admin.data.metrics.contractors,2);
  assert.equal(admin.data.metrics.subcontractors,2);
  assert.equal(admin.data.metrics.contractorOnlyCompanies,1);
  assert.equal(admin.data.metrics.subcontractorOnlyCompanies,1);
  assert.equal(admin.data.metrics.dualRoleCompanies,1);

  const adminScript=await fetch(`http://127.0.0.1:${port}/admin.js`).then(response=>response.text());
  assert.match(adminScript,/Contractor only/);
  assert.match(adminScript,/Subcontractor only/);
  assert.match(adminScript,/Dual accounts/);
});
