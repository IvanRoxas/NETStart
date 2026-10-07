const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>hello, myname is matt</h1>
    <h2>i like gunpla</h2>
    <h2>T am an IT Student</h2>

    <p>llorem ipsum dolor sit amet consectetur adipiscing elit aut tempore sed atque officia qui in quo dolor corrupti in praesentium adipiscing excepturi laborum minim rerum dolore harum vel iusto illum et esse adipiscing qui expedita eligendi accusamus fugiat laboris commodo incididunt exercitation pariatur irure incididunt sint facilis in dolores deleniti
    
    <p>llorem ipsum dolor sit amet consectetur adipiscing elit aut tempore sed atque officia qui in quo dolor corrupti in praesentium adipiscing excepturi laborum minim rerum dolore harum vel iusto illum et esse adipiscing qui expedita eligendi accusamus fugiat laboris commodo incididunt exercitation pariatur irure incididunt sint facilis in dolores deleniti
    <!-- Write your HTML here -->

  </body>
</html>
        <style>body { margin: 20px; }</style>
        <script></script>
        <script>
          (function() {
            const checks = [{"type":"text-length-at-least","selector":"p","minLength":20,"count":2,"id":"has-paragraphs","message":"Missing two paragraphs with at least 20 characters each.","isCore":true}];
            const nonce = "123";
            
            let uncaughtError = false;
            
            async function runCheck(check) {
              try {
                if (check.type === 'text-length-at-least') {
                  const els = Array.from(document.querySelectorAll(check.selector));
                  const count = els.filter(el => (el.textContent || '').trim().length >= check.minLength).length;
                  return { pass: count >= check.count, message: 'Found ' + count + ' expected ' + check.count };
                }
              } catch (err) {
                return { pass: false, message: 'Check threw error: ' + (err instanceof Error ? err.message : String(err)) };
              }
            }
            
            async function run() {
              for(const check of checks) {
                const res = await runCheck(check);
                console.log(res);
              }
            }
            run();
          })();
        </script>
`;

const dom = new JSDOM(htmlContent, { runScripts: "dangerously" });
