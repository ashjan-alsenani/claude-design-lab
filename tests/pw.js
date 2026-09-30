/* Resolve Playwright from the project or from the global install. */
try { module.exports = require('playwright'); }
catch (e) { module.exports = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); }
