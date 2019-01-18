'use strict';

(function(root, factory) {
	if(typeof define === 'function' && define.amd) {
		define(['d3'], factory);
	}
	else if(typeof module === 'object' && module.exports) {
		module.exports = factory(require('d3'));
	}
	else {
		root.ge = factory(root.d3);
	}
})(this, function(d3) {
	var exports = {};
