import http from "node:http";
// Supabase serves PostgREST under /rest/v1; this forwards it to the local PostgREST.
http.createServer((req, res) => {
  if (!req.url.startsWith("/rest/v1/")) { res.writeHead(404).end(); return; }
  const p = http.request({ host: "127.0.0.1", port: 54340, path: req.url.slice(8), method: req.method, headers: req.headers }, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
  p.on("error", () => res.writeHead(502).end()); req.pipe(p);
}).listen(54330);
