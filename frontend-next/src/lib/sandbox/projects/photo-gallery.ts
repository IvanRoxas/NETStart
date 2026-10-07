import { ProjectBlueprint } from './types';

export const photoGalleryBlueprint: ProjectBlueprint = {
  id: 'photo-gallery',
  track: 'web',
  title: 'Photo Gallery with Captions',
  description: 'Create a picture gallery using images and figures.',
  difficulty: 'beginner',
  concepts: ['images', 'alt text', 'figure', 'figcaption'],
  planets: ['Mars'],
  files: {
    'index.html': `<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" href="style.css">\n  </head>\n  <body>\n    <div id="gallery">\n      <!-- Write your HTML here -->\n\n    </div>\n  </body>\n</html>`,
    'style.css': `body {\n  font-family: sans-serif;\n}\n\n#gallery {\n  gap: 20px;\n}\n\nfigure {\n  margin: 0;\n  text-align: center;\n}`,
    'script.js': `// No JavaScript needed yet!`
  },
  steps: [
    {
      id: 'step-1-image',
      mode: 'guided',
      goal: 'Add an image',
      instructions: 'The `<img>` tag is used to display pictures. It needs a `src` attribute (the image file) and an `alt` attribute (a text description for screen readers). Add an image using one of our built-in pictures.\nAvailable images: `assets/mars.svg`, `assets/venus.svg`, `assets/earth.svg`, `assets/moon.svg`.\n\nExample:\n```html\n<img src="assets/mars.svg" alt="A red planet">\n```',
      checks: [
        { type: 'images-loaded', min: 1, id: 'image-loads', message: 'The image failed to load or is missing.', isCore: true },
        { type: 'attribute', selector: 'img', attr: 'alt', nonEmpty: true, id: 'has-alt', message: 'The image is missing an alt attribute.', isCore: true }
      ],
      hints: [
        'An `<img>` tag doesn\'t have a closing tag.',
        'Make sure you typed the `src` exactly as `assets/mars.svg`.',
        'Include `alt="description"` in your `<img>` tag.'
      ]
    },
    {
      id: 'step-2-figure',
      mode: 'guided',
      goal: 'Add a caption to the image',
      instructions: 'A `<figure>` tag groups an image with a `<figcaption>` tag that labels it. Wrap your image in a `<figure>` and add a `<figcaption>` below it.\n\nExample:\n```html\n<figure>\n  <img src="assets/mars.svg" alt="Mars">\n  <figcaption>Planet Mars</figcaption>\n</figure>\n```',
      checks: [
        { type: 'count-at-least', selector: 'figure img', n: 1, id: 'figure-has-img', message: 'Missing an image inside a <figure> tag.', isCore: true },
        { type: 'count-at-least', selector: 'figure figcaption', n: 1, id: 'figure-has-caption', message: 'Missing a <figcaption> inside a <figure> tag.', isCore: true }
      ],
      hints: [
        'Put `<figure>` before the `<img>` and `</figure>` after.',
        'Add `<figcaption>Your text here</figcaption>` right below the `<img>`.',
        'Both should be inside the `<figure>` block.'
      ]
    },
    {
      id: 'step-3-more',
      mode: 'your-turn',
      goal: 'Add 3 figures with 3 different images.',
      instructions: 'Remember: You can copy your first figure and change the `src` and `alt` to make more.',
      checks: [
        { type: 'count-at-least', selector: 'figure', n: 3, id: 'three-figures', message: 'Missing at least 3 <figure> tags.', isCore: true },
        { type: 'unique-attribute', selector: 'img', attr: 'src', n: 3, id: 'three-images', message: 'Make sure all 3 images use different src files.', isCore: true }
      ],
      hints: [
        'Copy and paste the entire `<figure>...</figure>` block two more times.',
        'Change the `src` to `assets/venus.svg` and `assets/earth.svg`.',
        'Change the `<figcaption>` text for each one.'
      ]
    },
    {
      id: 'step-4-alt',
      mode: 'your-turn',
      goal: 'Ensure every image has good alt text and a smaller width.',
      instructions: 'Remember: Every `<img>` needs an `alt` of at least 3 characters. Set the `width` to `300px` or less (using CSS or the width attribute).',
      checks: [
        { type: 'attribute', selector: 'img', attr: 'alt', minLength: 3, scope: 'all', id: 'all-alt-text', message: 'Every image must have alt text of at least 3 characters.', isCore: true },
        { type: 'css', selector: 'img', prop: 'width', atMost: 300, id: 'img-width', message: 'Images should have a width of 300px or less.', isCore: true }
      ],
      hints: [
        'Check that all three `<img>` tags have `alt="..."`.',
        'Make sure the alt text is longer than a few letters.',
        'In `style.css`, add `img { width: 300px; }`.'
      ]
    },
    {
      id: 'step-5-layout',
      mode: 'your-turn',
      goal: 'Stretch Goal: Put the figures in a row using Flexbox or CSS Grid.',
      instructions: 'Remember: Apply `display: flex;` or `display: grid;` to the `#gallery` container in CSS.',
      checks: [
        { type: 'css', selector: '#gallery', prop: 'display', equals: ['flex', 'grid'], id: 'gallery-layout', message: 'The #gallery needs display: flex or display: grid.', isCore: false }
      ],
      hints: [
        'Go to `style.css` and find `#gallery { ... }`.',
        'Add `display: flex;` inside it.',
        'Flexbox makes the children line up in a row.'
      ]
    }
  ],
  rubric: {
    core: ['image-loads', 'has-alt', 'figure-has-img', 'figure-has-caption', 'three-figures', 'three-images', 'all-alt-text', 'img-width'],
    stretch: ['gallery-layout']
  }
};
