const { spawnSync, spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

console.log('\n\x1b[36m🏥  Hospital Management Dashboard\x1b[0m\n');
console.log('📦  Installing dependencies...\n');

// spawnSync so we can ignore exit codes from npm audit warnings
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

spawnSync(npmCmd, ['install', '--no-audit', '--no-fund'], {
  cwd: path.join(root, 'backend'), stdio: 'inherit',
});
spawnSync(npmCmd, ['install', '--no-audit', '--no-fund'], {
  cwd: path.join(root, 'frontend'), stdio: 'inherit',
});

console.log('\n\x1b[32m🚀  Starting servers...\x1b[0m\n');
console.log('   \x1b[36mAPI\x1b[0m  → http://localhost:3001');
console.log('   \x1b[35mUI\x1b[0m   → http://localhost:3000\n');

const backend = spawn(npmCmd, ['start'], {
  cwd: path.join(root, 'backend'), stdio: 'inherit', shell: false,
});

setTimeout(() => {
  const frontend = spawn(npmCmd, ['run', 'dev'], {
    cwd: path.join(root, 'frontend'), stdio: 'inherit', shell: false,
  });
  frontend.on('exit', code => process.exit(code ?? 0));
}, 2000);

backend.on('exit', code => {
  if (code && code !== 0) { console.error('\n❌  Backend crashed (code', code + ')'); process.exit(code); }
});

['SIGINT', 'SIGTERM'].forEach(sig => process.on(sig, () => { try { backend.kill(); } catch {} process.exit(0); }));
