const http=require('node:http');
const originalSetTimeout=http.ClientRequest.prototype.setTimeout;
http.ClientRequest.prototype.setTimeout=function(milliseconds,callback){
  return originalSetTimeout.call(this,milliseconds===15000?120000:milliseconds,callback);
};
require('./reset-server.js');
