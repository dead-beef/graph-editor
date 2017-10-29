module.exports = (config) => {
	const fs = require('fs');
	const rootRequire = require('root-require');
	const packageJson = rootRequire('package.json');

	let vendor = './dist/js/vendor.js';
	if(!fs.existsSync(vendor)) {
		vendor = './build/vendor.js';
	}

	let files = [ vendor ];

	if(packageJson.dependencies.jquery !== undefined) {
		files.push({
			pattern: require.resolve('jasmine-jquery'),
			watched: false,
			served: true
		});
	}

	if(process.env.TEST_MIN_BUNDLE) {
		files.push('./dist/js/graph-editor.min.js');
	}
	else if(process.env.TEST_BUNDLE) {
		files.push('./dist/js/graph-editor.js');
	}
	else {
		files.push.apply(files, [
			'./tests/test-start.js',
			'./src/main.js',
			'./src/js/**/*.js'
		]);
	}

	files.push('./tests/**/*.test.js');

	let browsers = process.env.TEST_BROWSERS;
	if(browsers) {
		browsers = browsers.split(/\s+/);
	}
	if(!(browsers && browsers[0])) {
		browsers = ['Chromium'];
	}

	config.set({
		basePath: '../',

		files: files,

		frameworks: ['jasmine'],

		reporters: ['spec'],
		specReporter: {
			maxLogLines: 5,
			suppressErrorSummary: true,
			suppressFailed: false,
			suppressPassed: false,
			suppressSkipped: true,
			showSpecTiming: false,
			failFast: false
		},

		port: 9876,

		colors: true,
		logLevel: config.LOG_INFO,

		autoWatch: true,
		singleRun: false,

		browsers: browsers
	});
};
