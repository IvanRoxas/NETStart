const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = `
<body>
  <h1>hello, myname is matt</h1>
  <h2>i like gunpla</h2>
  <h2>T am an IT Student</h2>

  <p>llorem ipsum dolor sit amet consectetur adipiscing elit aut tempore s
  
  <p>llorem ipsum dolor sit amet consectetur adipiscing elit aut tempore s
  <!-- Write your HTML here -->

</body>
`;
const dom = new JSDOM(html);
const els = Array.from(dom.window.document.querySelectorAll('p'));
console.log('Paragraphs found:', els.length);
for (const el of els) {
  console.log('Length:', (el.textContent || '').trim().length);
}
