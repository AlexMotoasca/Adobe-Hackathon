const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const root = path.resolve(__dirname, '..');
const backend = path.join(root, 'backend');
const next = path.join(backend, 'node_modules/next/dist/bin/next');
if (!fs.existsSync(next) || !fs.existsSync(path.join(backend, '.env.local'))) {
  console.error('Install backend dependencies and configure backend/.env.local first.');
  process.exit(1);
}

const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
function run(args, cwd, env = {}) {
  const child = spawn(process.execPath, args, {
    cwd, env: { ...process.env, ...env }, stdio: 'inherit', windowsHide: true,
  });
  children.push(child);
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code || 1); });
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());

// PostgreSQL must already be running at the address in backend/.env.local.
run([next, 'dev', '-H', '127.0.0.1', '-p', '3001'], backend);
run(['--env-file=.env.local', '--import', 'tsx', 'src/worker.ts'], backend);
run([path.join(root, 'server.js')], root, { BACKEND_PORT: '3001' });
console.log('MindMarket full stack: http://localhost:3000 (Ctrl+C stops all components).');
