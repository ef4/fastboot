'use strict';

const { tokenize } = require('simple-html-tokenizer');
const fs = require('fs');
const path = require('path');

function htmlEntrypoint(distPath, htmlPath) {
  let htmlFile = path.join(distPath, htmlPath);
  let html = fs.readFileSync(htmlFile, 'utf8');

  // all the scripts we want to run go into appFiles. We don't use vendorFiles.
  // The distinction doesn't matter here, as long as the scripts all stay in the
  // right relative order.
  let appFiles = [];

  for (let token of tokenize(html)) {
    if (token.type === 'StartTag' && ['script', 'fastboot-script'].includes(token.tagName)) {
      for (let [name, value] of token.attributes) {
        if (name === 'src') {
          appFiles.push(path.join(distPath, value));
        }
      }
    }
  }
  return { htmlFile, appFiles, vendorFiles: [] };
}

module.exports = htmlEntrypoint;
