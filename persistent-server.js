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
  return originalReplace.call(source,search,replacement);
};
require('./reset-server.js');
