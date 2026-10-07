const { JSDOM } = require("jsdom");
const html = `
<body>
  <h1>hello, myname is matt</h1>
  <h2>i like gunpla</h2>
  <h2>T am an IT Student</h2>

  <p>llorem ipsum dolor sit amet consectetur adipiscing elit aut tempore sed atque officia qui in quo dolor corrupti in praesentium adipiscing excepturi laborum minim rerum dolore harum vel iusto illum et esse adipiscing qui expedita eligendi accusamus fugiat laboris commodo incididunt exercitation pariatur irure incididunt sint facilis in dolores deleniti

  <p>llorem ipsum dolor sit amet consectetur adipiscing elit aut tempore sed atque officia qui in quo dolor corrupti in praesentium adipiscing excepturi laborum minim rerum dolore harum vel iusto illum et esse adipiscing qui expedita eligendi accusamus fugiat laboris commodo incididunt exercitation pariatur irure incididunt sint facilis in dolores deleniti
  <!-- Write your HTML here -->

</body>
`;
const dom = new JSDOM(html);
const document = dom.window.document;
const els = Array.from(document.querySelectorAll('p'));
console.log('Found p:', els.length);
for (const el of els) {
  console.log('length:', (el.textContent || '').trim().length);
}
