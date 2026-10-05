export function generateWebRunnerSrc(html: string, css: string, js: string): string {
  const interceptorCode = `
      (function() {
        const originalConsole = {
          log: console.log,
          warn: console.warn,
          error: console.error,
          info: console.info
        };
        
        function formatArg(arg) {
          if (arg instanceof Error) return arg.name + ': ' + arg.message;
          if (typeof arg === 'object') {
            try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); }
          }
          return String(arg);
        }

        function sendLog(type, args) {
          const parsedArgs = Array.from(args).map(formatArg);
          window.parent.postMessage({ source: 'sandbox', type: type, content: parsedArgs.join(' ') }, '*');
        }
        
        console.log = function() { sendLog('log', arguments); originalConsole.log.apply(console, arguments); };
        console.warn = function() { sendLog('warn', arguments); originalConsole.warn.apply(console, arguments); };
        console.error = function() { sendLog('error', arguments); originalConsole.error.apply(console, arguments); };
        console.info = function() { sendLog('info', arguments); originalConsole.info.apply(console, arguments); };
        
        window.addEventListener('error', function(e) {
          let msg = e.error && e.error instanceof Error ? (e.error.name + ': ' + e.error.message) : e.message;
          
          let parsedLine = false;

          if (e.error && e.error.stack) {
            const match = e.error.stack.match(/student\.js:(\d+)/);
            if (match && match[1]) {
              const line = parseInt(match[1], 10);
              if (line >= 1 && line <= __JS_LINES__) {
                msg += ' (line ' + line + ')';
                parsedLine = true;
              }
            }
          }
          
          if (!parsedLine && e.lineno > 0) {
            const line = e.lineno - __JS_LINE_OFFSET__;
            if (line >= 1 && line <= __JS_LINES__) {
               msg += ' (line ' + line + ')';
            }
          }
          
          sendLog('error', [msg]);
        });
        
        window.addEventListener('unhandledrejection', function(e) {
          let msg = e.reason && e.reason instanceof Error ? (e.reason.name + ': ' + e.reason.message) : String(e.reason);
          
          if (e.reason && e.reason.stack) {
            const match = e.reason.stack.match(/student\.js:(\d+)/);
            if (match && match[1]) {
              const line = parseInt(match[1], 10);
              if (line >= 1 && line <= __JS_LINES__) {
                msg += ' (line ' + line + ')';
              }
            }
          }
          
          sendLog('error', [msg]);
        });
      })();
  `;

  const injection = `\n<script>\n${interceptorCode}\n</script>\n<style>\n${css}\n</style>\n`;
  
  let processedHtml = html;
  if (processedHtml.includes('</head>')) {
    const parts = processedHtml.split('</head>');
    processedHtml = parts[0] + injection + '</head>' + parts.slice(1).join('</head>');
  } else {
    processedHtml = injection + processedHtml;
  }
  
  const jsLines = js.split(/\r?\n/).length;
  const jsContent = `\n${js}\n//# sourceURL=student.js\n`;
  const scriptTagRegex = /<script\s+src=["']\/?script\.js["']\s*><\/script>/i;
  
  let htmlPrefix = "";
  let htmlSuffix = "";
  
  const match = processedHtml.match(scriptTagRegex);
  if (match) {
    const index = match.index!;
    htmlPrefix = processedHtml.substring(0, index) + '<script>';
    htmlSuffix = '</script>' + processedHtml.substring(index + match[0].length);
  } else {
    if (processedHtml.includes('</body>')) {
      const parts = processedHtml.split('</body>');
      htmlPrefix = parts[0] + '<script>';
      htmlSuffix = '</script>\n</body>' + parts.slice(1).join('</body>');
    } else {
      htmlPrefix = processedHtml + '\n<script>';
      htmlSuffix = '</script>';
    }
  }

  const prefixNewlines = htmlPrefix.split(/\r?\n/).length - 1;
  const jsLineOffset = prefixNewlines + 1;
  
  htmlPrefix = htmlPrefix.replace(/__JS_LINE_OFFSET__/g, jsLineOffset.toString());
  htmlPrefix = htmlPrefix.replace(/__JS_LINES__/g, jsLines.toString());
  
  return htmlPrefix + jsContent + htmlSuffix;
}
