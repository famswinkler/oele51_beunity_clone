/* Builds prototype/index.html: the whole app in one file, running on example data in the browser.
   Run: node scripts/build-demo.js */
const fs = require('fs'), path = require('path');
const pub = f => fs.readFileSync(path.join(__dirname, '..', 'public', f), 'utf8');
const out = [
  '<title>Oele51 Hausverein App</title>',
  '<meta name="claude:viewport-fit-sides" content="cover">',
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap">',
  '<style>\n' + pub('styles.css') + '</style>',
  '<div id="app" lang="de-CH"></div>',
  '<div id="toast" role="status" aria-live="polite" hidden></div>',
  '<script>window.OELE_DEMO = true;</script>',
  '<script>\n' + pub('core.js') + '</script>',
  '<script>\n' + pub('app.js') + '</script>', ''
].join('\n');
fs.writeFileSync(path.join(__dirname, '..', 'prototype', 'index.html'), out);
console.log('prototype/index.html written (' + out.length + ' characters)');
