import http from "node:http";
// Stand-in for the Resend API: accepts POST /emails, keeps messages in memory, lists them at GET /inbox.
const inbox = [];
http.createServer((req, res) => {
  let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => {
    if (req.method === "POST" && req.url === "/emails") {
      if (req.headers.authorization !== "Bearer re_test_key") { res.writeHead(401).end(); return; }
      const m = JSON.parse(b); inbox.push(m); res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ id: "em_" + inbox.length }));
    } else if (req.url === "/inbox") res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(inbox));
    else res.writeHead(404).end();
  });
}).listen(54331);
