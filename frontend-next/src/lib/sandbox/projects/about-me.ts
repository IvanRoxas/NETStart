import { ProjectBlueprint } from './types';

export const aboutMeBlueprint: ProjectBlueprint = {
  id: 'about-me',
  track: 'web',
  title: 'About Me Page',
  description: 'Create a simple webpage to introduce yourself.',
  difficulty: 'beginner',
  concepts: ['headings', 'paragraphs', 'lists', 'links'],
  planets: ['Mars'],
  files: {
    'index.html': `<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" href="style.css">\n  </head>\n  <body>\n    <!-- Write your HTML here -->\n\n  </body>\n</html>`,
    'style.css': `body {\n  font-family: sans-serif;\n  margin: 20px;\n}`,
    'script.js': `// No JavaScript needed yet!`
  },
  steps: [
    {
      id: 'step-1-name',
      mode: 'guided',
      goal: 'Add a main heading',
      instructions: 'Every webpage needs a title. In HTML, the `<h1>` tag creates the largest, most important heading. Put your name in an `<h1>` tag inside the `<body>`.\n\nExample:\n```html\n<h1>My Name</h1>\n```',
      checks: [
        { type: 'exists', selector: 'h1', id: 'has-h1', message: 'Missing an <h1> tag.', isCore: true },
        { type: 'text-length-at-least', selector: 'h1', minLength: 2, count: 1, id: 'h1-text', message: 'The <h1> tag should have your name inside it.', isCore: true }
      ],
      hints: [
        'An `<h1>` tag looks like this: `<h1>...</h1>`.',
        'Make sure it is inside the `<body>` tags.',
        'Try typing `<h1>Your Name</h1>`.'
      ]
    },
    {
      id: 'step-2-sections',
      mode: 'guided',
      goal: 'Add subheadings for sections',
      instructions: 'You can use `<h2>` tags for section titles, like "About me" and "My hobbies". An `<h2>` is a little smaller than an `<h1>`. Create two `<h2>` headings below your `<h1>`.\n\nExample:\n```html\n<h2>About me</h2>\n```',
      checks: [
        { type: 'count-at-least', selector: 'h2', n: 2, id: 'has-h2s', message: 'Missing at least two <h2> tags.', isCore: true }
      ],
      hints: [
        'You need two separate `<h2>` tags.',
        'Like this: `<h2>About me</h2>` and `<h2>My hobbies</h2>`.',
        'Place them below your `<h1>`.'
      ]
    },
    {
      id: 'step-3-paragraphs',
      mode: 'your-turn',
      goal: 'Write a paragraph under each section.',
      instructions: 'Remember: Use the `<p>` tag to write regular text paragraphs.',
      checks: [
        { type: 'text-length-at-least', selector: 'p', minLength: 20, count: 2, id: 'has-paragraphs', message: 'Missing two paragraphs with at least 20 characters each.', isCore: true }
      ],
      hints: [
        'A paragraph is made with `<p>...</p>`.',
        'You need two paragraphs, one for each section.',
        'Make sure to write a few words (at least 20 letters) inside each paragraph.'
      ]
    },
    {
      id: 'step-4-list',
      mode: 'your-turn',
      goal: 'Create a list of at least 3 hobbies.',
      instructions: 'Remember: Use `<ul>` for a bulleted list, and `<li>` for each list item inside it.',
      checks: [
        { type: 'count-at-least', selector: 'ul li, ol li', n: 3, id: 'has-list', message: 'Missing a list with at least 3 items.', isCore: true }
      ],
      hints: [
        'Start with `<ul>` and then add `<li>` items.',
        'You need at least three `<li>` tags.',
        'Like this:\n<ul>\n  <li>Reading</li>\n...</ul>'
      ]
    },
    {
      id: 'step-5-link',
      mode: 'your-turn',
      goal: 'Stretch Goal: Add a link to a favorite website, and make a word bold or italic.',
      instructions: 'Remember: Use the `<a>` tag with the `href` attribute for links. Use `<strong>` for bold and `<em>` for italics.',
      checks: [
        { type: 'attribute', selector: 'a', attr: 'href', nonEmpty: true, id: 'has-href', message: 'Missing a link with an href attribute.', isCore: false },
        { type: 'text-length-at-least', selector: 'a', minLength: 3, count: 1, id: 'has-link-text', message: 'The link should have text inside it to click on.', isCore: false },
        { type: 'count-at-least', selector: 'strong, em', n: 1, id: 'has-formatting', message: 'Missing a <strong> or <em> tag.', isCore: false }
      ],
      hints: [
        'A link looks like `<a href="https://google.com">Google</a>`.',
        'To make text bold, wrap it in `<strong>...</strong>`.',
        'Put the link inside one of your paragraphs or list items.'
      ]
    }
  ],
  rubric: {
    core: ['has-h1', 'h1-text', 'has-h2s', 'has-paragraphs', 'has-list'],
    stretch: ['has-href', 'has-link-text', 'has-formatting']
  }
};
