'use strict';

module.exports = {
	plugins: [],
	recurseDepth: 10,
	source: {
		include: './src/',
		exclude: ['./src/umd/umd-start.js', './src/umd/umd-end.js'],
		includePattern: '.+\\.js(doc|x)?$',
		excludePattern: '(^|\\/|\\\\)_'
	},
	sourceType: 'module',
	tags: {
		allowUnknownTags: true,
		dictionaries: ['jsdoc', 'closure']
	},
	templates: {
		cleverLinks: true,
		//monospaceLinks: false,
	},
	opts: {
		template: 'templates/default',
		encoding: 'utf8',
		destination: './docs/',
		recurse: true,
		'private': true,
		'package': './package.json',
		verbose: true,
		readme: './README.md',
		//tutorials: 'path/to/tutorials',
	}
};
