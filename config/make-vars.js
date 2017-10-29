const path = require('path');
const rootRequire = require('root-require');
const packpath = require('packpath');
const packageJson = rootRequire('package.json');
const overridePackageJson = require('./override');

const root = packpath.parent();

const getPackageJson = (pack) => {
	let override = overridePackageJson[pack];
	pack = require(path.join(pack, 'package.json'));
	if(override === undefined) {
		return pack;
	}
	return Object.assign({}, pack, override);
};

const resolve = (pack) => {
	let main = require.resolve(pack);
	let override = overridePackageJson[pack];
	override = override && override.main;

	if(override !== undefined) {
		let packRoot = main.substr(0, main.indexOf(pack) + pack.length);
		main = path.join(packRoot, override);
	}

	return path.relative(root, main);
};

const _getDeps = (pack, res, used) => {
	for(let dep in pack.dependencies) {
		if(!used[dep]) {
			_getDeps(getPackageJson(dep), res, used);
			res.push(resolve(dep));
			used[dep] = true;
		}
	}
	return res;
};

const getDeps = (pack) => _getDeps(pack, [], {});

let scripts = [];

for(let script in packageJson.scripts) {
	if(!/^(pre|post)/.test(script)) {
		scripts.push(script.replace(/:/g, '-'));
	}
}

let jsDeps = getDeps(packageJson)
	.filter((dep) => dep.endsWith('.js'));

console.log('NPM_SCRIPTS :=', scripts.join(' '));
console.log('ifeq "$(strip $(LIB_JS_FILES))" ""');
console.log('LIB_JS_FILES :=', jsDeps.join(' '));
console.log('endif');
