export function generatePythonWorkerUrl(): string {
  const workerSrc = `
    let pyodideReadyPromise = null;
    let pyodide = null;
    let inputLines = [];
    let inputIndex = 0;
    let pyodideBaseUrl = "";
    let sab = null;
    let int32 = null;
    let uint8 = null;
    let currentRunId = 0;

    self.isInteractive = function() { return sab !== null; };

    self.hasInput = function() {
      if (sab) return true;
      return inputIndex < inputLines.length;
    };

    self.jsInput = function(prompt) {
      if (sab) {
        self.postMessage({ source: 'sandbox', runId: currentRunId, type: 'inputRequest', prompt: prompt || "" });
        Atomics.wait(int32, 0, 0);
        const len = int32[1];
        const decoded = new TextDecoder().decode(uint8.slice(0, len));
        Atomics.store(int32, 0, 0);
        return decoded;
      } else {
        return inputLines[inputIndex++];
      }
    };

    async function initPyodide() {
      if (pyodide) return pyodide;
      const { loadPyodide } = await import(pyodideBaseUrl + "pyodide.mjs");
      pyodide = await loadPyodide({ indexURL: pyodideBaseUrl });
      
      pyodide.globals.set('jsInput', self.jsInput);
      pyodide.globals.set('hasInput', self.hasInput);
      pyodide.globals.set('isInteractive', self.isInteractive);
      await pyodide.runPythonAsync(\`
init_code = """
import sys
import builtins

def custom_input(prompt=""):
    if isInteractive():
        sys.stdout.flush()
        val = str(jsInput(prompt))
        return val
    else:
        if not hasInput():
            if prompt:
                print(prompt, end="")
                sys.stdout.flush()
            raise EOFError("Your program asked for more input than provided. Add it in the Input box.") from None
        val = str(jsInput(prompt))
        print(f"{prompt}{val}")
        return val

builtins.input = custom_input
"""
exec(compile(init_code, "<sandbox_init>", "exec"))
      \`);
      
      return pyodide;
    }

    self.onmessage = async (e) => {
      if (e.data.type === 'load') {
        try {
          pyodideBaseUrl = e.data.base;
          pyodideReadyPromise = initPyodide();
          await pyodideReadyPromise;
          self.postMessage({ source: 'sandbox', type: 'loaded' });
        } catch (err) {
          console.error("Pyodide load error:", err);
          self.postMessage({ source: 'sandbox', type: 'error', content: 'Could not load Python. Check your connection and try again.' });
        }
      } else if (e.data.type === 'run') {
        const { code, input, runId } = e.data;
        currentRunId = runId || 0;
        sab = e.data.sab || null;
        if (sab) {
          int32 = new Int32Array(sab);
          uint8 = new Uint8Array(sab, 8);
        } else {
          int32 = null;
          uint8 = null;
        }
        
        inputLines = input ? input.split('\\n') : [];
        inputIndex = 0;
        
        let py = null;
        let globals = null;
        let dict = null;
        try {
          py = await pyodideReadyPromise;
          self.postMessage({ source: 'sandbox', runId: currentRunId, type: 'start' });
          
          let logCount = 0;
          py.setStdout({ batched: (msg) => {
            if (typeof msg === 'string' && logCount++ < 1000) {
              self.postMessage({ source: 'sandbox', runId: currentRunId, type: 'log', content: msg });
            }
          }});
          py.setStderr({ batched: (msg) => {
            if (typeof msg === 'string' && logCount++ < 1000) {
              self.postMessage({ source: 'sandbox', runId: currentRunId, type: 'error', content: msg });
            }
          }});
          
          dict = py.globals.get('dict');
          globals = dict();
          
          await py.runPythonAsync(code, { globals: globals });
          
        } catch (err) {
          console.error("Raw Python error:", err);
          let msg = err.message || String(err);
          const lines = msg.split('\\n');
          
          let errorLineNo = null;
          let exceptionName = "";
          let exceptionMessage = "";
          
          for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(/File "<exec>", line (\\d+)/);
            if (match) {
              errorLineNo = match[1];
            }
          }
          
          for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            if (line && !line.startsWith(' ') && line.includes(':')) {
              const colonIdx = line.indexOf(':');
              const name = line.substring(0, colonIdx).trim();
              if (name === "pyodide.ffi.JsException" || name === "PythonError") continue;
              exceptionName = name;
              exceptionMessage = line.substring(colonIdx + 1).trim();
              break;
            }
          }
          
          let finalErrorText = "Error running Python code.";
          if (exceptionName === "EOFError" && exceptionMessage.includes("Your program asked for more input")) {
            finalErrorText = exceptionMessage;
            if (errorLineNo) finalErrorText += \` (line \${errorLineNo})\`;
          } else if (exceptionName) {
            finalErrorText = \`\${exceptionName}: \${exceptionMessage}\`;
            if (errorLineNo) finalErrorText += \` (line \${errorLineNo})\`;
          } else {
            let lastLine = lines.reverse().find(l => l.trim() !== "");
            if (lastLine) {
                finalErrorText = lastLine;
                if (errorLineNo) finalErrorText += \` (line \${errorLineNo})\`;
            }
          }
          
          self.postMessage({ source: 'sandbox', runId: currentRunId, type: 'error', content: finalErrorText });
        } finally {
          if (globals) globals.destroy();
          if (dict) dict.destroy();
          self.postMessage({ source: 'sandbox', runId: currentRunId, type: 'done' });
        }
      }
    };
  `;
  const blob = new Blob([workerSrc], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}
