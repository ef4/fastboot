'use strict';

const tmp = require('tmp');
const expect = require('chai').expect;
const fixturify = require('fixturify');
const htmlEntrypoint = require('../src/html-entrypoint.js');

tmp.setGracefulCleanup();

describe('htmlEntrypoint', function() {
  it('correctly works with no scripts', function() {
    let tmpobj = tmp.dirSync();
    let tmpLocation = tmpobj.name;

    let project = {
      'index.html': `
        <html>
          <body>
          </body>
        </html>`,
    };

    fixturify.writeSync(tmpLocation, project);

    let { html, appFiles, vendorFiles } = htmlEntrypoint(tmpLocation, 'index.html');

    expect(html.replace(/\s/g, '')).to.be.equal('<html><body></body></html>');
    expect(appFiles).to.deep.equal([]);
    expect(vendorFiles).to.deep.equal([]);
  });

  it('correctly works with scripts', function() {
    let tmpobj = tmp.dirSync();
    let tmpLocation = tmpobj.name;

    let project = {
      'index.html': `
        <html>
          <body>
            <script src="foo.js"></script>
            <script src="bar.js"></script>
            <script src="baz.js"></script>
          </body>
        </html>`,
    };

    fixturify.writeSync(tmpLocation, project);

    let { html, appFiles, vendorFiles } = htmlEntrypoint(tmpLocation, 'index.html');

    expect(html).to.be.equal(`
        <html>
          <body>
            <script src="foo.js"></script>
            <script src="bar.js"></script>
            <script src="baz.js"></script>
          </body>
        </html>`);
    expect(appFiles).to.deep.equal([
      `${tmpLocation}/foo.js`,
      `${tmpLocation}/bar.js`,
      `${tmpLocation}/baz.js`,
    ]);
    expect(vendorFiles).to.deep.equal([]);
  });

  it('correctly works with fastboot-scripts', function() {
    let tmpobj = tmp.dirSync();
    let tmpLocation = tmpobj.name;

    let project = {
      'index.html': `
        <html>
          <body>
            <fastboot-script src="foo.js"></fastboot-script>
            <fastboot-script src="bar.js"></fastboot-script>
            <fastboot-script src="baz.js"></fastboot-script>
          </body>
        </html>
      `,
    };

    fixturify.writeSync(tmpLocation, project);

    let { html, appFiles, vendorFiles } = htmlEntrypoint(tmpLocation, 'index.html');

    expect(html.replace(/\s/g, '')).to.be.equal('<html><body></body></html>');
    expect(appFiles).to.deep.equal([
      `${tmpLocation}/foo.js`,
      `${tmpLocation}/bar.js`,
      `${tmpLocation}/baz.js`,
    ]);
    expect(vendorFiles).to.deep.equal([]);
  });

  it('correctly works with scripts and fastboot-scripts', function() {
    let tmpobj = tmp.dirSync();
    let tmpLocation = tmpobj.name;

    let project = {
      'index.html': `
        <html>
          <body>
            <fastboot-script src="foo.js"></fastboot-script>
            <script src="bar.js"></script>
            <fastboot-script src="baz.js"></fastboot-script>
          </body>
        </html>
      `,
    };

    fixturify.writeSync(tmpLocation, project);

    let { html, appFiles, vendorFiles } = htmlEntrypoint(tmpLocation, 'index.html');

    expect(html).to.not.match(/fastboot-script src="foo.js"/);
    expect(html).to.match(/script src="bar.js"/);
    expect(html).to.not.match(/fastboot-script src="baz.js"/);
    expect(appFiles).to.deep.equal([
      `${tmpLocation}/foo.js`,
      `${tmpLocation}/bar.js`,
      `${tmpLocation}/baz.js`,
    ]);
    expect(vendorFiles).to.deep.equal([]);
  });
});
