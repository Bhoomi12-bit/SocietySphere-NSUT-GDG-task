const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function send(res, status, type, body) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (requestPath === '/manus-routes.json') {
    const file = path.join(root, 'public', 'manus-routes.json');
    return send(res, 200, mime['.json'], fs.readFileSync(file));
  }
  const safePath = path.normalize(requestPath).replace(/^([.][.][/\\])+/, '');
  const candidate = path.join(root, safePath === '/' ? 'index.html' : safePath);
  if (candidate.startsWith(root) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    const ext = path.extname(candidate).toLowerCase();
    return send(res, 200, mime[ext] || 'application/octet-stream', fs.readFileSync(candidate));
  }
  return send(res, 200, mime['.html'], fs.readFileSync(path.join(root, 'index.html')));
});

server.listen(port, '0.0.0.0', () => console.log(`SocietySphere listening on http://0.0.0.0:${port}`));
