export const BUILT_IN_ASSETS: Record<string, string> = {
  'assets/mars.svg': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23d14924"/><ellipse cx="30" cy="40" rx="15" ry="10" fill="%23a83215" opacity="0.6"/><ellipse cx="70" cy="60" rx="10" ry="6" fill="%23a83215" opacity="0.6"/></svg>',
  
  'assets/venus.svg': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23e8a356"/><path d="M 10 50 Q 50 30 90 50 Q 50 70 10 50" fill="%23d38734" opacity="0.4"/></svg>',
  
  'assets/earth.svg': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%234b9fd9"/><path d="M 20 40 Q 40 20 60 40 T 70 70 Q 50 80 30 60 Z" fill="%2356c968"/></svg>',
  
  'assets/moon.svg': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23dcdcdc"/><circle cx="35" cy="35" r="8" fill="%23adadad"/><circle cx="70" cy="45" r="12" fill="%23adadad"/><circle cx="45" cy="70" r="10" fill="%23adadad"/></svg>'
};

export function injectBuiltInAssets(html: string, css: string, js: string): { html: string; css: string; js: string } {
  let newHtml = html;
  let newCss = css;
  let newJs = js;
  
  for (const [assetPath, dataUri] of Object.entries(BUILT_IN_ASSETS)) {
    const escapedPath = assetPath.replaceAll('/', '\\\\/');
    
    // Replace in HTML (e.g., src="assets/mars.svg")
    const htmlRegex = new RegExp(`(["'])${escapedPath}\\1`, 'g');
    newHtml = newHtml.replace(htmlRegex, `"$dataUri"`);
    
    // Replace in CSS (e.g., url(assets/mars.svg) or url('assets/mars.svg'))
    const cssRegex = new RegExp(`url\\\\([\\"']?${escapedPath}[\\"']?\\\\)`, 'g');
    newCss = newCss.replace(cssRegex, `url("${dataUri}")`);
    
    // Replace in JS strings
    const jsRegex = new RegExp(`(["'])${escapedPath}\\1`, 'g');
    newJs = newJs.replace(jsRegex, `"$dataUri"`);
  }
  
  return { html: newHtml, css: newCss, js: newJs };
}
