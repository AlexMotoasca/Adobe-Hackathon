const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
const server = http.createServer((req,res)=>{
  const url = new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/')){
    const proxy=http.request({hostname:'127.0.0.1',port:process.env.BACKEND_PORT||3001,path:req.url,method:req.method,headers:{...req.headers,host:'localhost:3001'}}, upstream=>{
      res.writeHead(upstream.statusCode,upstream.headers);upstream.pipe(res);
    });
    proxy.on('error',()=>{if(!res.headersSent){res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:{message:'The backend is unavailable. Start the full-stack app and retry.'}}));}else res.destroy();});
    req.pipe(proxy);return;
  }
  let name;
  try{name=decodeURIComponent(url.pathname);}catch{res.writeHead(400);res.end();return;}
  const allowed = name === '/' || name === '/index.html' || name === '/dashboard' || name === '/analysis/new' || /^\/analysis\/[^/]+$/.test(name) || name === '/login' || name === '/settings';
  const file=allowed?path.join(root,'index.html'):path.resolve(root,'.'+name);
  const relative=path.relative(root,file);
  if(!allowed && (relative.startsWith('..') || !/^(js|css|assets)[\\/]/.test(relative))){res.writeHead(404);res.end();return;}
  fs.stat(file,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(file).pipe(res);
  });
});
server.listen(process.env.PORT||3000,()=>console.log('MindMarket: http://localhost:'+(process.env.PORT||3000)));
