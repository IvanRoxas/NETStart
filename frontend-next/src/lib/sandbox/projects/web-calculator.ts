import { ProjectBlueprint } from './types';

export const webCalculatorBlueprint: ProjectBlueprint = {
  id: 'web-calculator',
  track: 'web',
  title: 'Basic Calculator',
  description: 'Build a fully functional calculator using HTML, CSS, and JavaScript.',
  difficulty: 'medium',
  concepts: ['Layout', 'DOM Manipulation', 'Event Listeners', 'State'],
  planets: ['Mars', 'Venus', 'Mercury'],
  files: {
    'index.html': `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Start building your calculator here -->
  <script src="script.js"></script>
</body>
</html>`,
    'style.css': `/* Add your CSS here */
body {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f0f0f0;
}
`,
    'script.js': `// Add your JavaScript here\n`
  },
  rubric: {
    core: [
      'display-exists',
      'grid-layout',
      'add',
      'subtract',
      'multiply',
      'divide',
      'clear'
    ],
    stretch: [
      'decimal-point',
      'chained-operations',
      'divide-by-zero-safe'
    ]
  },
  steps: [
    {
      id: 's1',
      mode: 'guided',
      goal: 'Create the display and a button',
      instructions: 'Every calculator needs a screen to show numbers and buttons to press. Add an element with the id "display" (like an input or a div) and at least one `<button>` element to your HTML.',
      checks: [
        { type: 'exists', selector: '#display', id: 'display-exists', message: 'Could not find an element with id="display".', isCore: true },
        { type: 'count-at-least', selector: 'button', n: 1, id: 'one-button', message: 'Could not find at least one <button> element.' }
      ],
      hints: [
        "You'll need two new elements inside the <body> tags.",
        "An `<input id=\"display\" readonly>` or `<div id=\"display\"></div>` works great for the screen.",
        "Add `<input id=\"display\" />` and `<button>1</button>` to your index.html."
      ]
    },
    {
      id: 's2',
      mode: 'guided',
      goal: 'Lay out the buttons',
      instructions: 'Calculators usually arrange buttons in a grid. Wrap your button(s) in a `<div class="calculator-keys">` and use CSS Grid or Flexbox to lay them out.',
      starterCode: [
        {
          file: 'index.html',
          code: `  <div class="calculator">
    <input type="text" id="display" readonly>
    <div class="calculator-keys">
      <button>1</button>
      <button>2</button>
      <button>3</button>
      <button>+</button>
    </div>
  </div>`
        },
        {
          file: 'style.css',
          code: `.calculator {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  background-color: white;
}
.calculator-keys {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}`
        }
      ],
      checks: [
        { type: 'css', selector: '.calculator-keys', prop: 'display', equals: ['grid', 'flex'], id: 'grid-layout', message: 'The .calculator-keys container must use display: grid or display: flex.', isCore: true }
      ],
      hints: [
        "Wrap your buttons in a div with a class name like 'calculator-keys'.",
        "In your CSS, target the new class and add 'display: grid;'.",
        "Use 'grid-template-columns: repeat(4, 1fr);' to make a 4-column layout."
      ]
    },
    {
      id: 's3',
      mode: 'your-turn',
      goal: 'Add all the required buttons',
      instructions: 'Expand your HTML so you have buttons for all digits (0-9), operators (+, -, *, /), an equals button (=), and a clear button (C).',
      checks: [
        { type: 'button-text', texts: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '*', '/', '=', 'C'], id: 'all-buttons', message: 'Make sure you have buttons for 0-9, +, -, *, /, =, and C.' }
      ],
      hints: [
        "You need to create a total of 16 buttons.",
        "Just copy and paste the `<button>` tag and change the text inside.",
        "Include digits 0 through 9, and the symbols +, -, *, /, =, C."
      ]
    },
    {
      id: 's4',
      mode: 'guided',
      goal: 'Make addition work',
      instructions: 'Write JavaScript to handle button clicks. When the user clicks a number, it should appear on the display. When they click "+", store the first number. When they click "=", add them together and show the result.',
      starterCode: [
        {
          file: 'script.js',
          code: `const display = document.getElementById('display');
const buttons = document.querySelectorAll('button');

let currentInput = '';
let previousInput = '';
let operator = null;

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const value = button.textContent.trim();
    
    if (value >= '0' && value <= '9') {
      currentInput += value;
      display.value = currentInput; // or display.textContent
    } else if (value === '+') {
      operator = value;
      previousInput = currentInput;
      currentInput = '';
    } else if (value === '=') {
      if (operator === '+') {
        const result = parseFloat(previousInput) + parseFloat(currentInput);
        display.value = result;
        currentInput = result;
      }
    }
  });
});`
        }
      ],
      checks: [
        { type: 'click-sequence', keys: ['2', '+', '3', '='], displaySelector: '#display', expect: '5', id: 'add', message: 'Clicking 2, +, 3, = should show 5 on the display.', isCore: true },
        { type: 'click-sequence', keys: ['7', '+', '5', '='], displaySelector: '#display', expect: '12', id: 'add-test-2', message: 'Clicking 7, +, 5, = should show 12 on the display.' }
      ],
      hints: [
        "You'll need event listeners on your buttons to detect clicks.",
        "Variables like 'currentNumber' and 'previousNumber' help remember what was typed before the operator.",
        "When '=' is clicked, use `parseFloat()` to turn strings into numbers before adding."
      ]
    },
    {
      id: 's5',
      mode: 'your-turn',
      goal: 'Add subtraction, multiplication, and division',
      instructions: 'Extend your JavaScript to support the -, *, and / operators. Ensure that dividing by zero does not crash the page!',
      checks: [
        { type: 'click-sequence', keys: ['8', '-', '3', '='], displaySelector: '#display', expect: '5', id: 'subtract', message: 'Clicking 8, -, 3, = should show 5.', isCore: true },
        { type: 'click-sequence', keys: ['4', '*', '5', '='], displaySelector: '#display', expect: '20', id: 'multiply', message: 'Clicking 4, *, 5, = should show 20.', isCore: true },
        { type: 'click-sequence', keys: ['6', '/', '3', '='], displaySelector: '#display', expect: '2', id: 'divide', message: 'Clicking 6, /, 3, = should show 2.', isCore: true },
        { type: 'no-uncaught-error', id: 'no-crash-div-zero', message: 'The page should not crash when dividing by zero.' },
        { type: 'click-sequence', keys: ['5', '/', '0', '='], displaySelector: '#display', expect: [], id: 'divide-by-zero-safe', message: 'Dividing by zero should be handled gracefully without showing Infinity or NaN.', isCore: false },
        { type: 'not-contains', displaySelector: '#display', strings: ['Infinity', 'NaN', 'undefined', 'null'], id: 'no-infinity-nan', message: 'Display should not show technical errors like Infinity or NaN.' }
      ],
      hints: [
        "Add more 'else if' blocks in your JavaScript for '-', '*', and '/'.",
        "Make sure you perform the right mathematical operation based on the stored operator.",
        "Before dividing, check `if (currentInput === '0')` to handle the divide-by-zero error gracefully (e.g. by showing 'Error')."
      ]
    },
    {
      id: 's6',
      mode: 'your-turn',
      goal: 'Make the Clear button work',
      instructions: 'When the "C" button is clicked, reset the calculator so it is ready for a new calculation.',
      checks: [
        { type: 'click-sequence', keys: ['9', 'C'], displaySelector: '#display', expect: ['', '0'], id: 'clear', message: 'Clicking a number then C should clear the display.', isCore: true },
        { type: 'click-sequence', keys: ['2', '+', '3', '*', '4', '='], displaySelector: '#display', expect: ['20', '14'], id: 'chained-operations', message: 'Support chained operations (e.g. 2 + 3 * 4). Evaluating left-to-right (20) or with precedence (14) are both fine.', isCore: false },
        { type: 'click-sequence', keys: ['1', '.', '5', '+', '1', '.', '2', '='], displaySelector: '#display', expect: '2.7', id: 'decimal-point', message: 'Support decimal numbers.', isCore: false }
      ],
      hints: [
        "Detect when the clicked button is 'C'.",
        "You'll need to reset your stored variables (like currentInput, previousInput, operator) to empty strings or null.",
        "Don't forget to update the display itself to be empty or '0'!"
      ]
    }
  ]
};
