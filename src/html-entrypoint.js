'use strict';

const { tokenize } = require('simple-html-tokenizer');
const fs = require('fs');
const path = require('path');
const pattern = /<fastboot-script[^>]*><\/fastboot-script>\n*/g;

function htmlEntrypoint(distPath, htmlPath) {
  let html = fs.readFileSync(path.join(distPath, htmlPath), 'utf8');

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

  // we could bring a full html parser & serializer to the party, but the tags
  // we're trying to strip out here aren't even allowed to have any textContext,
  // so they're pretty tame.
  html = html.replace(pattern, '');

  return { html, appFiles, vendorFiles: [] };
}

module.exports = htmlEntrypoint;
