import fs from "node:fs";
import path from "node:path";

// Fresh SANDBOX licensing data and dev mailbox for every run (fictional data only).
export default function globalSetup() {
  for (const f of ["licensing.json", "outbox.json"]) fs.rmSync(path.join(process.cwd(), ".data", f), { force: true });
}
