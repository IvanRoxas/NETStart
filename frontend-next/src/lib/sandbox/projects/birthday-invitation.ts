import { ProjectBlueprint } from './types';

export const birthdayInvitationBlueprint: ProjectBlueprint = {
  id: 'birthday-invitation',
  track: 'web',
  title: 'Birthday Invitation',
  description: 'Design a digital birthday invitation card using HTML and CSS.',
  difficulty: 'beginner',
  concepts: ['css classes', 'borders', 'colors', 'padding'],
  planets: ['Mars', 'Venus'],
  files: {
    'index.html': `<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" href="style.css">\n  </head>\n  <body>\n    <!-- Write your HTML here -->\n\n  </body>\n</html>`,
    'style.css': `body {\n  font-family: sans-serif;\n  background-color: white;\n}\n\nh1 {\n  color: black;\n}\n\n.card {\n  /* add card styles here */\n}`,
    'script.js': `// No JavaScript needed yet!`
  },
  steps: [
    {
      id: 'step-1-content',
      mode: 'guided',
      goal: 'Add the invitation text',
      instructions: 'Add an `<h1>` heading that says "You\'re invited!". Below that, add two `<p>` paragraphs. One for the date, and one for the place.',
      checks: [
        { type: 'exists', selector: 'h1', id: 'has-h1', message: 'Missing an <h1> tag.', isCore: true },
        { type: 'count-at-least', selector: 'p', n: 2, id: 'has-paragraphs', message: 'Missing two <p> tags.', isCore: true }
      ],
      hints: [
        'An `<h1>` is a big heading: `<h1>You\'re invited!</h1>`.',
        'Use `<p>...</p>` for the date and place paragraphs.',
        'Put all of them inside the `<body>`.'
      ]
    },
    {
      id: 'step-2-card',
      mode: 'guided',
      goal: 'Create the card box',
      instructions: 'Wrap all your text inside a `<div>` tag with the class "card". A `<div>` is a container. The "class" attribute lets us style it with CSS.\n\nExample:\n```html\n<div class="card">\n  ...\n</div>\n```\nThen in `style.css`, give `.card` a solid border.\n\nExample:\n```css\n.card {\n  border: 2px solid black;\n}\n```',
      checks: [
        { type: 'exists', selector: 'div.card h1', id: 'card-wraps-h1', message: 'The <h1> must be inside <div class="card">.', isCore: true },
        { type: 'css', selector: '.card', prop: 'border-top-style', notEquals: ['none'], id: 'card-border-style', message: 'The card needs a border.', isCore: true },
        { type: 'css', selector: '.card', prop: 'border-top-width', atLeast: 1, id: 'card-border-width', message: 'The card border should be visible.', isCore: true }
      ],
      hints: [
        'Start with `<div class="card">` right below `<body>`.',
        'Put the `<h1>` and `<p>` tags inside, then close it with `</div>`.',
        'In `style.css`, write `border: 2px solid black;` inside the `.card { ... }` block.'
      ]
    },
    {
      id: 'step-3-colors',
      mode: 'your-turn',
      goal: 'Change the background color of the page and the color of the heading.',
      instructions: 'Remember: In `style.css`, modify the `background-color` for `body` and the `color` for `h1`.',
      checks: [
        { type: 'css', selector: 'body', prop: 'background-color', notEquals: ['rgba(0, 0, 0, 0)', 'rgb(255, 255, 255)'], id: 'body-bg-color', message: 'Change the body background-color.', isCore: true },
        { type: 'css', selector: 'h1', prop: 'color', notEquals: ['rgb(0, 0, 0)'], id: 'h1-color', message: 'Change the h1 text color.', isCore: true }
      ],
      hints: [
        'In CSS, `background-color: lightblue;` sets the background color.',
        'In CSS, `color: purple;` sets the text color.',
        'Change the values that are already in `style.css`.'
      ]
    },
    {
      id: 'step-4-center',
      mode: 'your-turn',
      goal: 'Center the text inside the card.',
      instructions: 'Remember: Use the `text-align` CSS property on the `.card` class.',
      checks: [
        { type: 'css', selector: '.card', prop: 'text-align', equals: ['center'], id: 'card-center', message: 'The text inside the card should be centered.', isCore: true }
      ],
      hints: [
        'Go to the `.card { ... }` block in `style.css`.',
        'Add `text-align: center;` to it.',
        'Make sure to include the semicolon `;` at the end.'
      ]
    },
    {
      id: 'step-5-polish',
      mode: 'your-turn',
      goal: 'Stretch Goal: Make the heading bigger, and add padding and rounded corners to the card.',
      instructions: 'Remember: Use `font-size` for the heading. Use `padding` and `border-radius` for the card.',
      checks: [
        { type: 'css', selector: 'h1', prop: 'font-size', atLeast: 28, id: 'h1-font-size', message: 'Increase the font-size of the h1.', isCore: false },
        { type: 'css', selector: '.card', prop: 'padding-top', atLeast: 16, id: 'card-padding', message: 'Add padding to the card.', isCore: false },
        { type: 'css', selector: '.card', prop: 'border-top-left-radius', atLeast: 1, id: 'card-radius', message: 'Add border-radius to the card.', isCore: false }
      ],
      hints: [
        'For `h1`, add `font-size: 32px;`.',
        'For `.card`, add `padding: 20px;`.',
        'For `.card`, add `border-radius: 10px;` to round the corners.'
      ]
    }
  ],
  rubric: {
    core: ['has-h1', 'has-paragraphs', 'card-wraps-h1', 'card-border-style', 'card-border-width', 'body-bg-color', 'h1-color', 'card-center'],
    stretch: ['h1-font-size', 'card-padding', 'card-radius']
  }
};
