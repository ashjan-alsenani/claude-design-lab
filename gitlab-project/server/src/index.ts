import { config, validate } from './config.js';
import { log } from './log.js';
import { migrate, pool } from './db.js';
import { emptyData, sampleData, seed } from './state.js';
import { createApp } from './app.js';

const problems = validate();
if (problems.length) {
  for (const p of problems) log('error', 'configuration problem: ' + p);
  process.exit(1);
}

await migrate();
if (await seed('main', config.initialData === 'sample' ? sampleData() : emptyData(), 'system')) {
  log('info', `empty database: started with ${config.initialData} data`);
}

const server = createApp().listen(config.port, config.host, () => {
  log('info', 'employee directory listening', { port: config.port, basePath: config.basePath, auth: config.authMode });
});

// OpenShift sends SIGTERM before stopping a pod: finish open requests, then close the database pool.
for (const sig of ['SIGTERM', 'SIGINT'] as const) {
  process.on(sig, () => {
    log('info', 'shutting down', { signal: sig });
    server.close(() => pool.end().finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
