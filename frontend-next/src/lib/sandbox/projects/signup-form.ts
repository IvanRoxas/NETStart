import { ProjectBlueprint } from './types';

export const signupFormBlueprint: ProjectBlueprint = {
  id: 'signup-form',
  track: 'web',
  title: 'Sign-Up Form',
  description: 'Create a registration form for users.',
  difficulty: 'beginner',
  concepts: ['forms', 'labels', 'input types', 'required'],
  planets: ['Mars'],
  files: {
    'index.html': `<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" href="style.css">\n  </head>\n  <body>\n    <!-- Write your HTML here -->\n\n  </body>\n</html>`,
    'style.css': `body {\n  font-family: sans-serif;\n}\n\nform {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  max-width: 300px;\n}`,
    'script.js': `// Form submission is turned off in the sandbox.`
  },
  steps: [
    {
      id: 'step-1-form',
      mode: 'guided',
      goal: 'Create a form with a text input',
      instructions: 'The `<form>` tag holds inputs. A `<label>` describes an input. Link them by putting the input inside the label, or using `for="id"`.\nNote: Form submission is turned off in this sandbox, so pressing submit won\'t do anything.\n\nExample:\n```html\n<form>\n  <label>\n    Name:\n    <input type="text">\n  </label>\n</form>\n```',
      checks: [
        { type: 'exists', selector: 'form', id: 'has-form', message: 'Missing a <form> tag.', isCore: true },
        { type: 'exists', selector: 'input[type="text"]', id: 'has-text-input', message: 'Missing a text <input>.', isCore: true },
        { type: 'labels-match-inputs', minInputs: 1, id: 'has-label', message: 'The input must have a matching label.', isCore: true }
      ],
      hints: [
        'Start by typing `<form>` and `</form>`.',
        'Inside it, add `<label>Name: <input type="text"></label>`.',
        'Wrapping the input inside the label is the easiest way to match them.'
      ]
    },
    {
      id: 'step-2-email',
      mode: 'guided',
      goal: 'Add an email input',
      instructions: 'Different `type` attributes change how inputs behave. Use `<input type="email">` so the browser knows it should look like an email address.\n\nExample:\n```html\n<label>\n  Email:\n  <input type="email">\n</label>\n```',
      checks: [
        { type: 'exists', selector: 'input[type="email"]', id: 'has-email-input', message: 'Missing an email <input>.', isCore: true },
        { type: 'labels-match-inputs', minInputs: 2, id: 'has-two-labels', message: 'Both inputs need labels.', isCore: true }
      ],
      hints: [
        'Add another `<label>` inside the `<form>`.',
        'Inside this label, put `<input type="email">`.',
        'Make sure it is separate from the Name label.'
      ]
    },
    {
      id: 'step-3-password',
      mode: 'your-turn',
      goal: 'Add a password input and a submit button.',
      instructions: 'Remember: Use `type="password"` to hide typed characters. Use `<button>` or `<input type="submit">` inside the form to create a button.',
      checks: [
        { type: 'exists', selector: 'input[type="password"]', id: 'has-password', message: 'Missing a password input.', isCore: true },
        { type: 'labels-match-inputs', minInputs: 3, id: 'has-three-labels', message: 'All three inputs need labels.', isCore: true },
        { type: 'exists', selector: 'form button, form input[type="submit"]', id: 'has-submit', message: 'Missing a submit button inside the form.', isCore: true }
      ],
      hints: [
        'Create a third label containing `<input type="password">`.',
        'Add a `<button>Sign Up</button>` at the very end, before `</form>`.',
        'The button does not need a label.'
      ]
    },
    {
      id: 'step-4-required',
      mode: 'your-turn',
      goal: 'Make the name and email inputs required.',
      instructions: 'Remember: Add the `required` attribute to an `<input>` to stop the form from submitting if it is empty.',
      checks: [
        { type: 'attribute', selector: 'input[type="text"], input[type="email"]', attr: 'required', present: true, scope: 'all', id: 'inputs-required', message: 'Both text and email inputs must be required.', isCore: true }
      ],
      hints: [
        'Change `<input type="text">` to `<input type="text" required>`.',
        'Do the same for the email input.',
        'You just write the word `required`.'
      ]
    },
    {
      id: 'step-5-stretch',
      mode: 'your-turn',
      goal: 'Stretch Goal: Add a dropdown or radio group, and use a placeholder.',
      instructions: 'Remember: `<select>` creates a dropdown with `<option>` choices. The `placeholder` attribute shows gray text inside an input before typing.',
      checks: [
        { type: 'count-at-least', selector: 'select option, input[type="radio"]', n: 2, id: 'has-choices', message: 'Add a select dropdown or radio buttons.', isCore: false },
        { type: 'attribute', selector: 'input', attr: 'placeholder', nonEmpty: true, scope: 'any', id: 'has-placeholder', message: 'At least one input needs a placeholder attribute.', isCore: false }
      ],
      hints: [
        'Add `placeholder="Enter your name"` to your text input.',
        'To add a dropdown, use `<select><option>...</option></select>`.',
        'Make sure to put the dropdown inside a new label.'
      ]
    }
  ],
  rubric: {
    core: ['has-form', 'has-text-input', 'has-label', 'has-email-input', 'has-two-labels', 'has-password', 'has-three-labels', 'has-submit', 'inputs-required'],
    stretch: ['has-choices', 'has-placeholder']
  }
};
