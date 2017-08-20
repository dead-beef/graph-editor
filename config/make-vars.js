const path = require('path');
const rootRequire = require('root-require');
const packpath = require('packpath');
const packageJson = rootRequire('package.json');
const mainFiles = require('./main-files');

const root = packpath.parent();

const resolve = (pack) => {
	let main = require.resolve(pack);
	let override = mainFiles[pack];

	if(override === undefined) {
		return main;
	}

	let root = main.substr(0, main.indexOf(pack) + pack.length + 1);
	return root + override;
};

let scripts = [];

for(let script in packageJson.scripts) {
	if(!/^(pre|post)/.test(script)) {
		scripts.push(script.replace(/:/g, '-'));
	}
}

let jsDeps = Object.keys(packageJson.dependencies)
	.map(resolve)
	.filter((dep) => dep.endsWith('.js'))
	.map((dep) => path.relative(root, dep));

console.log('NPM_SCRIPTS :=', scripts.join(' '));
console.log('ifeq "$(LIB_JS_FILES)" ""');
console.log('LIB_JS_FILES :=', jsDeps.join(' '));
console.log('endif');
