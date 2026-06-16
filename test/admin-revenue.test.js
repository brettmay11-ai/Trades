const assert=require('node:assert/strict');
const{spawn}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),test=require('node:test');
const port=32154;
let server,dataDir;
async function wait(){for(let i=0;i<80;i++){try{if((await fetch(`http://127.0.0.1:${port}/health`)).ok)return}catch{}await new Promise(resolve=>setTimeout(resolve,100))}throw Error('server did not start')}
async function request(route,options={},cookie=''){const response=await fetch(`http://127.0.0.1:${port}${route}`,{headers:{'Content-Type':'application/json',...(cookie?{cookie}:{})},...options});const text=await response.text();return{response,data:text?JSON.parse(text):null,cookie:response.headers.get('set-cookie')?.split(';')[0]||cookie}}
test.before(async()=>{dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'trades-admin-revenue-'));server=spawn(process.execPath,['server.js'],{cwd:path.resolve(__dirname,'..'),env:{...process.env,PORT:String(port),DATA_DIR:dataDir,TRADES_ADMIN_EMAILS:'owner@example.com',ADMIN_MAGIC_LINK_PREVIEW:'true'},stdio:'ignore'});await wait()});
test.after(()=>{server.kill();fs.rmSync(dataDir,{recursive:true,force:true})});

test('owner revenue dashboard estimates awarded value and fee potential',async()=>{
  const contractor=await request('/api/signup',{method:'POST',body:JSON.stringify({fullName:'General Owner',companyName:'Revenue GC',city:'Dallas',state:'TX',trades:['Framing and Rough Carpentry'],email:'gc@example.com',password:'test-password',capabilities:['contractor']})});
  const subcontractor=await request('/api/signup',{method:'POST',body:JSON.stringify({fullName:'Sub Owner',companyName:'Revenue Framer',city:'Dallas',state:'TX',trades:['Framing and Rough Carpentry'],email:'sub@example.com',password:'test-password',capabilities:['subcontractor']})});
  const job=await request('/api/jobs',{method:'POST',body:JSON.stringify({title:'Framing package',trade:'Framing and Rough Carpentry',city:'Dallas',state:'TX',budget:'$25,000 - $40,000',description:'Frame a small commercial shell.',materialsIncluded:'no'})},contractor.cookie);
  const bid=await request(`/api/jobs/${job.data.job.id}/bids`,{method:'POST',body:JSON.stringify({amount:'$30k',scope:'Labor-only framing bid.',schedule:'Two weeks',materialsIncluded:'no'})},subcontractor.cookie);
  const awarded=await request(`/api/jobs/${job.data.job.id}/award`,{method:'POST',body:JSON.stringify({bidId:bid.data.bid.id,startDate:'2026-08-01',endDate:'2026-08-15'})},contractor.cookie);
  assert.equal(awarded.response.status,200);

  const requested=await request('/api/admin/magic/request',{method:'POST',body:JSON.stringify({email:'owner@example.com'})});
  const token=new URL(`http://local${requested.data.magicPath}`).searchParams.get('token');
  const verified=await request('/api/admin/magic/verify',{method:'POST',body:JSON.stringify({token})});
  const admin=await request('/api/admin',{},verified.cookie);
  assert.equal(admin.response.status,200);
  assert.equal(admin.data.revenue.metrics.awardedValue,30000);
  assert.equal(admin.data.revenue.metrics.estimatedPlatformFeeAt5,1500);
  assert.equal(admin.data.revenue.metrics.bidPipelineValue,30000);
  assert.equal(admin.data.revenue.markets[0].label,'Dallas, TX');
  assert.equal(admin.data.revenue.trades[0].label,'Framing and Rough Carpentry');
  assert.equal(admin.data.revenue.recentAwards[0].title,'Framing package');

  const adminHtml=await fetch(`http://127.0.0.1:${port}/admin`).then(response=>response.text());
  const adminScript=await fetch(`http://127.0.0.1:${port}/admin.js`).then(response=>response.text());
  assert.match(adminHtml,/data-admin-view="revenue"/);
  assert.match(adminHtml,/revenueMetricGrid/);
  assert.match(adminScript,/estimatedPlatformFeeAt5/);
});
