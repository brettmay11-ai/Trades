const http=require('node:http'),childProcess=require('node:child_process');
const originalSpawn=childProcess.spawn;childProcess.spawn=function(command,args,options){const next=Array.isArray(args)?args.map(value=>value==='profile-server.js'?'profile-patched-server.js':value):args;return originalSpawn.call(this,command,next,options)};
const originalSetTimeout=http.ClientRequest.prototype.setTimeout;
http.ClientRequest.prototype.setTimeout=function(milliseconds,callback){return originalSetTimeout.call(this,Math.max(milliseconds||0,120000),callback)};
const originalReplace=String.prototype.replace;
String.prototype.replace=function(search,replacement){
  let source=String(this);
  if(source.includes('id="signupForm"')&&source.includes('account-page.css')){
    source=originalReplace.call(source,/href="account-page\.css[^\"]*"/,'href="account-page.css?v=20260612-compact-1"');
    source=originalReplace.call(source,/href="taxonomy\.css[^\"]*"/,'href="taxonomy.css?v=20260612-themed-1"');
    if(!source.includes('taxonomy-theme.js'))source=originalReplace.call(source,/<script src="account\.js/,'<script src="taxonomy-theme.js?v=20260612-themed-1"></script><script src="account.js');
  }
  if(source.includes("const notice=document.getElementById('accountNotice')")&&!source.includes('taxonomy-theme.js?v=20260612-themed-1'))source+=`;document.querySelector('link[href*=\"account-page.css\"]')?.setAttribute('href','account-page.css?v=20260612-compact-1');document.querySelector('link[href*=\"taxonomy.css\"]')?.setAttribute('href','taxonomy.css?v=20260612-themed-1');const themedPickerScript=document.createElement('script');themedPickerScript.src='taxonomy-theme.js?v=20260612-themed-1';document.body.appendChild(themedPickerScript);`;
  if(source.includes('id="profileView"')&&source.includes('src="jobs.js')){
    source=originalReplace.call(source,/href="jobs\.css[^\"]*"/,'href="jobs.css?v=20260612-stable-3"');
    source=originalReplace.call(source,/src="jobs\.js[^\"]*"/,'src="jobs.js?v=20260612-stable-3"');
    source=originalReplace.call(source,/src="profile\.js[^\"]*"/,'src="profile.js?v=20260612-stable-3"');
    if(!source.includes('role-label.js'))source=originalReplace.call(source,'</body>','<script src="role-label.js?v=20260612-stable-3"></script></body>');
  }
  return originalReplace.call(source,search,replacement);
};
require('./reset-server.js');
