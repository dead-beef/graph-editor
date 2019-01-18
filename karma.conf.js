module.exports = (config) => {
	const packageJson = require('./package.json');
	const path = require('path');

	let files = [
		require.resolve('jquery'),
		path.join(path.dirname(require.resolve('d3')), 'd3.js')
	];

	if(packageJson.dependencies.jquery !== undefined) {
		files.push({
			pattern: require.resolve('jasmine-jquery'),
			watched: false,
			served: true
		});
	}

	if(process.env.TEST_MIN_BUNDLE) {
		files.push(path.join(__dirname, 'dist/js/graph-editor.min.js'));
	}
	else if(process.env.TEST_BUNDLE) {
		files.push(path.join(__dirname, './dist/js/graph-editor.js'));
	}
	else {
		files.push.apply(files, [
			path.join(__dirname, 'tests/test-start.js'),
			path.join(__dirname, 'src/main.js'),
			path.join(__dirname, 'src/js/**/*.js')
		]);
	}

	files.push(path.join(__dirname, 'tests/**/*.test.js'));

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
