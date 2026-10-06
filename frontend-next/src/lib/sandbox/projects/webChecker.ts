import * as acorn from 'acorn';
import { StepCheck, CheckResult } from './types';
import { injectBuiltInAssets } from '../assets';

export type CheckerError = {
  type: 'syntax_error';
  message: string;
  line?: number;
};

export async function runWebChecks(
  rawFiles: { 'index.html': string; 'style.css': string; 'script.js': string },
  originalChecks: StepCheck[],
  iframeRef: React.RefObject<HTMLIFrameElement | null>
): Promise<CheckResult[] | CheckerError> {
  const assets = injectBuiltInAssets(rawFiles['index.html'], rawFiles['style.css'], rawFiles['script.js']);
  const files = {
    'index.html': assets.html,
    'style.css': assets.css,
    'script.js': assets.js
  };
  // 1. Syntax check
  try {
    acorn.parse(files['script.js'], { ecmaVersion: 'latest', sourceType: 'module' });
  } catch (err: any) {
    return {
      type: 'syntax_error',
      message: err.message || 'Syntax Error',
      line: err.loc?.line
    };
  }

  const iframe = iframeRef.current;
  if (!iframe) return [];

  const runCheckBatch = (batchChecks: StepCheck[]): Promise<CheckResult[]> => {
    return new Promise((resolve) => {
      const nonce = Math.random().toString(36).substring(2);

      let timeoutId = setTimeout(() => {
        window.removeEventListener('message', listener);
        resolve(batchChecks.map(c => ({ id: c.id, pass: false, message: 'Your page took too long to respond' })));
      }, 3000);

      const listener = (e: MessageEvent) => {
        if (e.source === iframe.contentWindow && e.data?.source === 'checker' && e.data?.nonce === nonce) {
          clearTimeout(timeoutId);
          window.removeEventListener('message', listener);
          resolve(e.data.results);
        }
      };
      window.addEventListener('message', listener);

      const checkerScriptInjected = `
        (function() {
          const checks = ${JSON.stringify(batchChecks)};
          const nonce = "${nonce}";
          
          let uncaughtError = false;
          window.addEventListener('error', () => { uncaughtError = true; });
          
          function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
          
          function textMatches(actual, expected) {
            if (!actual) return false;
            const t = actual.trim();
            const e = expected.trim();
            if (t === e) return true;
            const aliases = {
              '*': ['×', 'x', 'X'],
              '/': ['÷'],
              '-': ['−', '–'],
              'C': ['AC', 'Clear']
            };
            if (aliases[e] && aliases[e].includes(t)) return true;
            for (const [key, vals] of Object.entries(aliases)) {
              if (vals.includes(e) && (t === key || vals.includes(t))) return true;
            }
            return false;
          }
          
          function findButton(text) {
            const btns = Array.from(document.querySelectorAll('button'));
            return btns.find(b => textMatches(b.textContent, text));
          }
          
          function getDisplayText(selector) {
            const el = document.querySelector(selector);
            if (!el) return null;
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return el.value.trim();
            return el.textContent.trim();
          }
          
          async function runCheck(check) {
            try {
              if (check.type === 'exists') {
                return { pass: !!document.querySelector(check.selector) };
              }
              if (check.type === 'count-at-least') {
                return { pass: document.querySelectorAll(check.selector).length >= check.n };
              }
              if (check.type === 'css') {
                const el = document.querySelector(check.selector);
                if (!el) return { pass: false, message: 'Element not found' };
                const style = window.getComputedStyle(el);
                const val = style[check.prop] || style.getPropertyValue(check.prop);
                if (check.equals && !check.equals.includes(val)) return { pass: false, message: 'Value ' + val + ' is not in expected list' };
                if (check.notEquals && check.notEquals.includes(val)) return { pass: false, message: 'Value should not be ' + val };
                if (check.atLeast !== undefined || check.atMost !== undefined) {
                  const numVal = parseFloat(val);
                  if (isNaN(numVal)) return { pass: false, message: 'Value ' + val + ' is not a number' };
                  if (check.atLeast !== undefined && numVal < check.atLeast) return { pass: false, message: 'Value ' + val + ' < ' + check.atLeast };
                  if (check.atMost !== undefined && numVal > check.atMost) return { pass: false, message: 'Value ' + val + ' > ' + check.atMost };
                }
                return { pass: true };
              }
              if (check.type === 'attribute') {
                const els = Array.from(document.querySelectorAll(check.selector));
                if (els.length === 0) return { pass: false, message: 'No elements match ' + check.selector };
                const scope = check.scope || 'all';
                for (const el of els) {
                  const val = el.getAttribute(check.attr);
                  let elPass = true;
                  let msg = '';
                  if (check.present && val === null) { elPass = false; msg = 'missing attribute ' + check.attr; }
                  else if (check.nonEmpty && (!val || val.trim() === '')) { elPass = false; msg = 'empty attribute ' + check.attr; }
                  else if (check.equals !== undefined && val !== check.equals) { elPass = false; msg = 'expected ' + check.equals + ' got ' + val; }
                  else if (check.minLength !== undefined && (!val || val.trim().length < check.minLength)) { elPass = false; msg = 'value too short'; }
                  
                  if (scope === 'any' && elPass) return { pass: true };
                  if (scope === 'all' && !elPass) return { pass: false, message: msg };
                }
                return { pass: scope === 'all', message: scope === 'any' ? 'No elements passed' : '' };
              }
              if (check.type === 'text-length-at-least') {
                const els = Array.from(document.querySelectorAll(check.selector));
                const count = els.filter(el => (el.textContent || '').trim().length >= check.minLength).length;
                return { pass: count >= check.count, message: 'Found ' + count + ' expected ' + check.count };
              }
              if (check.type === 'unique-attribute') {
                const els = Array.from(document.querySelectorAll(check.selector));
                const vals = new Set(els.map(el => el.getAttribute(check.attr)).filter(Boolean));
                return { pass: vals.size >= check.n, message: 'Found ' + vals.size + ' unique values expected ' + check.n };
              }
              if (check.type === 'labels-match-inputs') {
                const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea'));
                let labeledCount = 0;
                for (const input of inputs) {
                  if (input.closest('label')) { labeledCount++; continue; }
                  if (input.id && document.querySelector('label[for="' + input.id + '"]')) { labeledCount++; }
                }
                return { pass: labeledCount >= check.minInputs, message: 'Found ' + labeledCount + ' expected ' + check.minInputs };
              }
              if (check.type === 'images-loaded') {
                const imgs = Array.from(document.querySelectorAll('img'));
                if (imgs.length < check.min) return { pass: false, message: 'Not enough images' };
                let loaded = 0;
                let failed = 0;
                for (const img of imgs) {
                  if (img.complete) {
                    if (img.naturalWidth > 0) loaded++; else failed++;
                  } else {
                    await new Promise(r => {
                      img.onload = () => { loaded++; r(); };
                      img.onerror = () => { failed++; r(); };
                      setTimeout(r, 2000);
                    });
                  }
                }
                return { pass: loaded >= check.min && failed === 0, message: loaded + ' loaded, ' + failed + ' failed' };
              }
              if (check.type === 'click-style') {
                const btn = document.querySelector(check.clickSelector);
                if (!btn) return { pass: false, message: 'Click target not found' };
                const targets = check.targets.map(s => document.querySelector(s)).filter(Boolean);
                if (targets.length === 0) return { pass: false, message: 'No targets found' };
                
                const getVal = (el) => check.prop === 'textContent' ? el.textContent : window.getComputedStyle(el)[check.prop];
                
                const initialVals = targets.map(getVal);
                
                if (check.mode === 'changes') {
                  btn.click();
                  await wait(50);
                  const newVals = targets.map(getVal);
                  if (newVals.some((v, i) => v !== initialVals[i])) return { pass: true };
                  return { pass: false, message: 'Style did not change' };
                } else if (check.mode === 'toggles') {
                  btn.click();
                  await wait(50);
                  const val1 = targets.map(getVal);
                  btn.click();
                  await wait(50);
                  const val2 = targets.map(getVal);
                  if (val1.some((v, i) => v !== initialVals[i]) && val2.some((v, i) => v === initialVals[i])) return { pass: true };
                  return { pass: false, message: 'Style did not toggle' };
                } else if (check.mode === 'cycles') {
                  let prevVals = initialVals;
                  for (let i=0; i<(check.times || 3); i++) {
                    btn.click();
                    await wait(50);
                    const newVals = targets.map(getVal);
                    if (!newVals.some((v, j) => v !== prevVals[j])) return { pass: false, message: 'Did not cycle on click ' + (i+1) };
                    prevVals = newVals;
                  }
                  return { pass: true };
                }
              }
              if (check.type === 'class-changes-style') {
                const target = document.querySelector(check.targets[0]);
                if (!target) return { pass: false, message: 'Target not found' };
                const initialVal = window.getComputedStyle(target)[check.prop];
                target.classList.add(check.addClass);
                const newVal = window.getComputedStyle(target)[check.prop];
                target.classList.remove(check.addClass);
                return { pass: newVal !== initialVal, message: 'Style did not change when class added' };
              }
              if (check.type === 'button-text') {
                const btns = Array.from(document.querySelectorAll('button'));
                for (const expected of check.texts) {
                  if (!btns.some(b => textMatches(b.textContent, expected))) {
                    return { pass: false, message: 'Missing button: ' + expected };
                  }
                }
                return { pass: true };
              }
              if (check.type === 'click-sequence') {
                for (const key of check.keys) {
                  let btn = null;
                  if (check.clickBy === 'selector') {
                    btn = document.querySelector(key);
                  } else {
                    btn = findButton(key);
                  }
                  if (!btn) return { pass: false, message: 'Element not found: ' + key };
                  btn.click();
                  await wait(10);
                }
                const displayVal = getDisplayText(check.displaySelector);
                if (displayVal === null) return { pass: false, message: 'Display not found' };
                
                let passed = false;
                let expecteds = Array.isArray(check.expect) ? check.expect : [check.expect];
                if (expecteds.length === 0) passed = true; // no expectation except no crash
                for (const expected of expecteds) {
                  if (displayVal === expected) passed = true;
                  if (!isNaN(parseFloat(displayVal)) && !isNaN(parseFloat(expected)) && parseFloat(displayVal) === parseFloat(expected)) passed = true;
                }
                
                return { pass: passed, message: passed ? '' : 'Expected ' + expecteds.join(' or ') + ' but got ' + displayVal };
              }
              if (check.type === 'text-contains') {
                const displayVal = getDisplayText(check.displaySelector);
                if (displayVal === null) return { pass: false };
                return { pass: displayVal.includes(check.text) };
              }
              if (check.type === 'not-contains') {
                const displayVal = getDisplayText(check.displaySelector);
                if (displayVal === null) return { pass: true };
                for (const s of check.strings) {
                  if (displayVal.includes(s)) return { pass: false, message: 'Display contains ' + s };
                }
                return { pass: true };
              }
              if (check.type === 'no-uncaught-error') {
                return { pass: !uncaughtError };
              }
            } catch (err) {
              return { pass: false, message: 'Check threw error: ' + (err instanceof Error ? err.message : String(err)) };
            }
            return { pass: false, message: 'Unknown check type' };
          }
          
          window.addEventListener('load', async () => {
            await wait(100);
            
            const results = [];
            for (const check of checks) {
              const res = await runCheck(check);
              const finalMsg = check.message ? check.message + (res.message ? ' (' + res.message + ')' : '') : res.message;
              results.push({ id: check.id, pass: !!res.pass, message: finalMsg });
            }
            
            window.parent.postMessage({ source: 'checker', nonce: "${nonce}", results }, '*');
          });
        })();
      `;

      const htmlContent = `
        ${files['index.html']}
        <style>${files['style.css']}</style>
        <script>${files['script.js']}</script>
        <script>${checkerScriptInjected}</script>
      `;
      
      iframe.srcdoc = htmlContent;
    });
  };

  const finalResults: CheckResult[] = [];
  
  // Separate checks: run non-click checks together, and click sequences individually with reloads
  const nonClickChecks = originalChecks.filter(c => c.type !== 'click-sequence' && c.type !== 'click-repeat');
  const clickChecks = originalChecks.filter(c => c.type === 'click-sequence' || c.type === 'click-repeat');
  
  if (nonClickChecks.length > 0) {
    const res = await runCheckBatch(nonClickChecks);
    finalResults.push(...res);
  }
  
  for (const cCheck of clickChecks) {
    if (cCheck.type === 'click-repeat') {
      let passed = true;
      let message = cCheck.message;
      for (const n of cCheck.times) {
        const singleCheck: StepCheck = {
          ...cCheck,
          type: 'click-sequence',
          clickBy: 'selector',
          keys: Array(n).fill(cCheck.clickSelector),
          displaySelector: cCheck.displaySelector,
          expect: n.toString()
        };
        const res = await runCheckBatch([singleCheck]);
        if (!res[0].pass) {
          passed = false;
          message = `Failed after ${n} clicks: ${res[0].message}`;
          break;
        }
      }
      finalResults.push({ id: cCheck.id, pass: passed, message: message || '' });
    } else {
      const res = await runCheckBatch([cCheck]);
      finalResults.push(...res);
    }
  }

  return finalResults;
}
