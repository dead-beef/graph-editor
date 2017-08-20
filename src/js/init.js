'use strict';

ge.GraphEditor.prototype.initMarkers = function(svg) {
	/*var defs = d3.select('#' + this.options.css.markers).node();
	if(defs !== null) {
		return this;
	}*/

	/*defs = d3.select('head')
		.append('svg')
		.attr('id', this.options.css.markers)
		.append('svg:defs');*/

	var defs = svg.append('svg:defs');

	var arrows = [
		'ge-arrow-default', 'ge-arrow-hover',
		'ge-arrow-selected', 'ge-arrow-selected-hover',
		'ge-arrow-unselected', 'ge-arrow-unselected-hover',
		'ge-arrow-selected-node', 'ge-arrow-selected-node-hover',
		'ge-dragline-end'
	];

	defs.selectAll('marker')
		.data(arrows)
		.enter()
		.append('marker')
		.attr('id', function(d) { return d; })
		.attr('viewBox', '0 -7 12 14')
		.attr('refX', '7')
		.attr('refY', '0')
		.attr('markerWidth', 3.5)
		.attr('markerHeight', 3.5)
		.attr('orient', 'auto')
		.append('path')
		.attr('d', 'M0,-5L10,0L0,5Z');

	defs.append('marker')
		.attr('id', 'ge-dragline-start')
		.attr('viewBox', '-5 -5 5 5')
		.attr('refX', -2)
		.attr('refY', -2)
		.attr('markerWidth', 4)
		.attr('markerHeight', 4)
		.append('circle')
		.attr('r', 2)
		.attr('cx', -2)
		.attr('cy', -2);

	return this;
};

ge.GraphEditor.prototype.initSvg = function(svg) {
	svg
		.attr('id', this.options.id)
		.classed(this.options.css.graph, true)
		.classed(this.options.css.digraph, this.options.directed);

	var g = svg.append('g');
	var defsContainer = svg.select('defs'); //g.append('defs');
	var linksContainer = g.append('g');
	var nodesContainer = g.append('g');

	this.container = g;
	this.defs = defsContainer.selectAll('.ge-text-path');
	this.links = linksContainer.selectAll('g');
	this.nodes = nodesContainer.selectAll('g');

	this.dragLine = g.append('path')
		.classed(this.options.css.dragline, true)
		.classed(this.options.css.hide, true)
		.attr('d', 'M0,0L0,0');

	this.tmpText = svg.append('text')
		.style('stroke', 'none')
		.style('fill', 'none');

	this.svg = svg;
	return this;
};

ge.GraphEditor.prototype.initData = function(data) {
	this.nodeById = {};
	this.linkById = {};
	this.data = {
		nodes: [],
		links: []
	};
	this.addNodes(data.nodes, true);
	this.addLinks(data.links, true);
	return this;
};

ge.GraphEditor.prototype.initState = function() {
	this.state = {
		zoomed: false,
		dragged: false,
		simulation: null,
		simulationStarted: false,
		dragToLink: false,
		newLinkTarget: null,
		selectedNode: null,
		selectedLink: null,
		dragPos: null,
		zoom: 1
		//sizeScale: 1
	};
	return this;
};

ge.GraphEditor.prototype.constructor = function(svg, data, options) {
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
