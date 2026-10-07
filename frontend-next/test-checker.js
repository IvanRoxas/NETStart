const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = `
<!DOCTYPE html>
<html>
<body>
  <h1>hello, myname is matt</h1>
  <h2>i like gunpla</h2>
  <h2>T am an IT Student</h2>

  <p>llorem ipsum dolor sit amet consectetur adipiscing elit aut tempore s
  
  <p>llorem ipsum dolor sit amet consectetur adipiscing elit aut tempore s
  <!-- Write your HTML here -->
</body>
</html>
`;
const dom = new JSDOM(html);
const document = dom.window.document;

const checks = [
  { type: 'text-length-at-least', selector: 'p', minLength: 20, count: 2, id: 'has-paragraphs', message: 'Missing two paragraphs with at least 20 characters each.', isCore: true }
];

for (const check of checks) {
  if (check.type === 'text-length-at-least') {
    const els = Array.from(document.querySelectorAll(check.selector));
    console.log("Total matched elements:", els.length);
    const count = els.filter(el => (el.textContent || '').trim().length >= check.minLength).length;
    console.log("Elements passing minLength:", count);
    const pass = count >= check.count;
    console.log("Pass:", pass);
  }
}
