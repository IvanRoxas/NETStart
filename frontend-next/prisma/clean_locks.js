const fs = require('fs');
const path = require('path');

try {
  const localAppData = process.env.LOCALAPPDATA;
  if (localAppData) {
    const streamDir = path.join(localAppData, 'prisma-dev-nodejs', 'Data', 'durable-streams', 'default');
    const lockDir = path.join(streamDir, 'server.lock.lock');
    const lockFile = path.join(streamDir, 'server.lock');

    if (fs.existsSync(lockDir)) {
      fs.rmSync(lockDir, { recursive: true, force: true });
    }
    if (fs.existsSync(lockFile)) {
      fs.rmSync(lockFile, { force: true });
    }
  }
} catch (e) {
  // Ignore error if cleanup fails
}
