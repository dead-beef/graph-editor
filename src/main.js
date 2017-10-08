'use strict';

/* eslint-disable no-unused-vars */

/**
 * Graph editor module.
 * @namespace
 */
var ge = exports;

/**
 * Graph editor constructor.
 * @class
 * @classdesc Graph editor class.
 * @param {(SVGElement|Selector|D3Selection)} svg     SVG element.
 * @param {ImportGraphData}                   data    Graph data.
 * @param {GraphOptions}                      options Graph options.
 */
ge.GraphEditor = function GraphEditor(svg, data, options) {
	if(!svg.select) {
		svg = d3.select(svg);
	}

	this.initOptions(options, svg)
		.initMarkers(svg)
		.initSvg(svg)
		.initData(data)
		.initState();

	this.dispatch = d3.dispatch(
		'node-click', 'link-click',
		'new-link-start', 'new-link-end', 'new-link-cancel',
		'click',
		'simulation-start', 'simulation-stop'
	);

	this.bbox = [[0, 0], [0, 0]];
	this.zoom = this.zoomEvents(d3.zoom())
		.scaleExtent([this.options.scale.min, this.options.scale.max]);
	this.drag = this.dragEvents(d3.drag());
	this.svg.call(this.zoom);

	this.onresize = ge.bind(this, this.resized);
	$(window).on('resize', this.onresize);

	return this.resized()
		.update()
		.simulation(this.options.simulation.start);
};

/* eslint-enable no-unused-vars */
