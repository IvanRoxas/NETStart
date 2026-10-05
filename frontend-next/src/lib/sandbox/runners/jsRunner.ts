export function generateJsWorkerUrl(js: string, runId: number = 0): string {
  const workerSrc = `
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };

    function formatArg(arg) {
      if (arg instanceof Error) {
        return arg.name + ': ' + arg.message;
      }
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch(e) {
          return String(arg);
        }
      }
      return String(arg);
    }

    function sendLog(type, args) {
      const parsedArgs = Array.from(args).map(formatArg);
      
      self.postMessage({
        source: 'sandbox',
        runId: ${runId},
        type: type,
        content: parsedArgs.join(' ')
      });
    }

    console.log = function() { sendLog('log', arguments); originalConsole.log.apply(console, arguments); };
    console.warn = function() { sendLog('warn', arguments); originalConsole.warn.apply(console, arguments); };
    console.error = function() { sendLog('error', arguments); originalConsole.error.apply(console, arguments); };
    console.info = function() { sendLog('info', arguments); originalConsole.info.apply(console, arguments); };

    try {
      const runFn = new Function(${JSON.stringify(js)});
      runFn();
    } catch(e) {
      let msg = e instanceof Error ? (e.name + ': ' + e.message) : String(e);
      if (e instanceof Error && e.stack) {
        const match = e.stack.match(/<anonymous>:(\\d+):\\d+/) || 
                      e.stack.match(/eval.*?:(\\d+):\\d+/) || 
                      e.stack.match(/anonymous.*?:(\\d+):\\d+/);
        if (match && match[1]) {
          const line = parseInt(match[1], 10) - 2;
          if (line > 0 && !Number.isNaN(line)) {
            msg += ' (line ' + line + ')';
          }
        }
      }
      self.postMessage({
        source: 'sandbox',
        runId: ${runId},
        type: 'error',
        message: msg
      });
    } finally {
      self.postMessage({
        source: 'sandbox',
        runId: ${runId},
        type: 'done'
      });
    }
  `;

  const blob = new Blob([workerSrc], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}
