const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const files = {
  'index.html': `<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>hello, myname is matt</h1>
    <h2>i like gunpla</h2>
    <h2>T am an IT Student</h2>

    <p>llorem ipsum dolor sit amet consectetur adipiscing elit aut tempore s
    
    <p>llorem ipsum dolor sit amet consectetur adipiscing elit aut tempore s
    <!-- Write your HTML here -->

  </body>
</html>`,
  'style.css': `body { margin: 20px; }`,
  'script.js': `// no js`,
};

const htmlContent = `
  ${files['index.html']}
  <style>${files['style.css']}</style>
  <script>${files['script.js']}</script>
`;

const dom = new JSDOM(htmlContent);
const document = dom.window.document;

const els = Array.from(document.querySelectorAll('p'));
console.log("Total matched elements:", els.length);
for (const el of els) {
  console.log("Paragraph text:", el.textContent.trim());
}
