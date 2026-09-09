// Keep the documentation preview and its authenticated search proxy on this Mac.
// Mint's preview server does not currently expose a bind-address option.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const preload = `--require ${JSON.stringify(__filename)}`;
if (!(process.env.NODE_OPTIONS || '').includes(__filename)) {
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} ${preload}`.trim();
}
const originalListen = http.Server.prototype.listen;
http.Server.prototype.listen = function (...args) {
  if (Number(args[0]) === 3240) {
    const callback = args.find(value => typeof value === 'function');
    return originalListen.call(this, 3240, '127.0.0.1', callback);
  }
  return originalListen.apply(this, args);
};

// Mint's local server omits the hosted Markdown routes used by "Copy page".
// Expose only navigation-listed public pages, never arbitrary project files.
const originalEmit = http.Server.prototype.emit;
http.Server.prototype.emit = function (event, ...args) {
  if (event === 'request' && this.address()?.port === 3240) {
    const [req, res] = args;
    const pathname = new URL(req.url, 'http://127.0.0.1:3240').pathname;
    if (['GET', 'HEAD'].includes(req.method) && (pathname.endsWith('.md') || pathname === '/llms.txt')) {
      try {
        const config = JSON.parse(fs.readFileSync(path.join(root, 'docs.json'), 'utf8'));
        const pages = config.navigation.languages.flatMap(l => l.groups.flatMap(g => g.pages));
        const page = pathname.slice(1, -3);
        let body;
        if (pathname === '/llms.txt') {
          body = '# Faro API\n\n' + pages.map(p => `- [${p}](http://127.0.0.1:3240/${p}.md)`).join('\n');
        } else if (pages.includes(page) && !page.includes('..')) {
          body = fs.readFileSync(path.join(root, `${page}.mdx`), 'utf8');
        }
        if (body !== undefined) {
          res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store'});
          res.end(req.method === 'HEAD' ? undefined : body);
          return true;
        }
      } catch {
        // Let the ordinary preview show its own not-found/error page.
      }
    }
  }
  return originalEmit.call(this, event, ...args);
};
