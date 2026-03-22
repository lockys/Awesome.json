'use strict';
const fs = require('fs');
const path = require('path');

class AwesomeSearcher {
  constructor(awesomeName) {
    this.name = awesomeName;
  }

  async save(awesomeJson) {
    Object.keys(awesomeJson).forEach((e) => {
      if (!awesomeJson[e].length) {
        delete awesomeJson[e];
      }
    });

    const outDir = path.resolve(__dirname, '..', 'test-output');
    await fs.promises.mkdir(outDir, { recursive: true });

    const outPath = path.join(outDir, this.name + '.json');
    await fs.promises.writeFile(outPath, JSON.stringify(awesomeJson, null, 2));
    console.log(`Saved ${outPath}`);
  }
}

module.exports = AwesomeSearcher;
