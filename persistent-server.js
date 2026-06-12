const http=require('node:http');
const originalSetTimeout=http.ClientRequest.prototype.setTimeout;
http.ClientRequest.prototype.setTimeout=function(milliseconds,callback){
  return originalSetTimeout.call(this,milliseconds===15000?120000:milliseconds,callback);
};
const originalReplace=String.prototype.replace;
String.prototype.replace=function(search,replacement){
  let source=String(this);
  if(search==='</head>'&&source.includes('href="jobs.css"')&&source.includes('src="jobs.js"')){
    source=originalReplace.call(source,'href="jobs.css"','href="jobs.css?v=20260612-role-animation-1"');
    source=originalReplace.call(source,/src="jobs\.js[^\"]*"/,'src="jobs.js?v=20260612-role-animation-1"');
  }
  if(source.includes('id="signupForm"')&&source.includes('account-page.css')){
    source=originalReplace.call(source,/href="account-page\.css[^\"]*"/,'href="account-page.css?v=20260612-compact-1"');
    source=originalReplace.call(source,/href="taxonomy\.css[^\"]*"/,'href="taxonomy.css?v=20260612-themed-1"');
    if(!source.includes('taxonomy-theme.js'))source=originalReplace.call(source,/<script src="account\.js/,'<script src="taxonomy-theme.js?v=20260612-themed-1"></script><script src="account.js');
  }
  return originalReplace.call(source,search,replacement);
};
require('./reset-server.js');
