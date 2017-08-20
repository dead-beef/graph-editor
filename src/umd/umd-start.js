'use strict';

(function(root, factory) {
	if(typeof define === 'function' && define.amd) {
		define(['jquery', 'd3'], factory);
	}
	else if(typeof module === 'object' && module.exports) {
		module.exports = factory(require('jquery'), require('d3'));
	}
	else {
		root.ge = factory(root.jQuery, root.d3);
	}
})(this, function($, d3) {
	var exports = {};
