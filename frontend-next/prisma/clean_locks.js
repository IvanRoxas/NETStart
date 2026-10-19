const fs = require('fs');
const path = require('path');

function isPidAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

try {
  const localAppData = process.env.LOCALAPPDATA;
  if (localAppData) {
    const prismaDevDir = path.join(localAppData, 'prisma-dev-nodejs', 'Data');

    // 1. Clean durable-streams locks
    const streamDir = path.join(prismaDevDir, 'durable-streams', 'default');
    const lockDir = path.join(streamDir, 'server.lock.lock');
    const lockFile = path.join(streamDir, 'server.lock');

    if (fs.existsSync(lockDir)) {
      fs.rmSync(lockDir, { recursive: true, force: true });
      console.log('[clean_locks] Removed durable-streams server.lock.lock');
    }
    if (fs.existsSync(lockFile)) {
      fs.rmSync(lockFile, { force: true });
      console.log('[clean_locks] Removed durable-streams server.lock');
    }

    // 2. Clean stale server.json in durable-streams
    const streamServerJson = path.join(streamDir, 'server.json');
    if (fs.existsSync(streamServerJson)) {
      try {
        const info = JSON.parse(fs.readFileSync(streamServerJson, 'utf8'));
        if (!isPidAlive(info.pid)) {
          fs.rmSync(streamServerJson, { force: true });
          console.log(`[clean_locks] Removed stale stream server.json (PID ${info.pid} is dead)`);
        }
      } catch (err) {
        fs.rmSync(streamServerJson, { force: true });
      }
    }

    // 3. Clean stale server.json in default server
    const defaultDir = path.join(prismaDevDir, 'default');
    const defaultServerJson = path.join(defaultDir, 'server.json');
    if (fs.existsSync(defaultServerJson)) {
      try {
        const info = JSON.parse(fs.readFileSync(defaultServerJson, 'utf8'));
        if (!isPidAlive(info.pid)) {
          fs.rmSync(defaultServerJson, { force: true });
          console.log(`[clean_locks] Removed stale default server.json (PID ${info.pid} is dead)`);
        }
      } catch (err) {
        fs.rmSync(defaultServerJson, { force: true });
      }
    }
  }
} catch (e) {
  console.warn('[clean_locks] Error during cleanup:', e.message);
}
