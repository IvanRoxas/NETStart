export interface LanguageConfig {
  id: string;
  label: string;
  mode: 'web' | 'js' | 'python';
  files: {
    name: string;
    language: 'html' | 'css' | 'javascript' | 'python';
    defaultCode: string;
  }[];
}

export const LANGUAGES: LanguageConfig[] = [
  {
    id: 'html-css-js',
    label: 'HTML/CSS/JS (Web)',
    mode: 'web',
    files: [
      {
        name: 'index.html',
        language: 'html',
        defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NETStart Sandbox</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello, NETStart!</h1>
  <p>Start coding to see the preview here.</p>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        name: 'style.css',
        language: 'css',
        defaultCode: `body {
  background-color: #1a082c;
  color: white;
  font-family: sans-serif;
  text-align: center;
  padding-top: 50px;
}

h1 {
  color: #ff912d;
}`
      },
      {
        name: 'script.js',
        language: 'javascript',
        defaultCode: `console.log("Web mode initialized.");`
      }
    ]
  },
  {
    id: 'javascript',
    label: 'JavaScript (Console)',
    mode: 'js',
    files: [
      {
        name: 'main.js',
        language: 'javascript',
        defaultCode: `// Hello NETStart!
console.log("Operator initialized.");
console.warn("This is a warning.");
console.error("This is an error.");

for (let i = 1; i <= 3; i++) {
  console.log("Count:", i);
}
`
      }
    ]
  },
  {
    id: 'python',
    label: 'Python',
    mode: 'python',
    files: [
      {
        name: 'main.py',
        language: 'python',
        defaultCode: `print("Hello, NETStart!")\n\nfor i in range(3):\n    print(f"Count: {i + 1}")\n`
      }
    ]
  }
];
