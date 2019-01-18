'use strict';

/**
 * Create SVG markers.
 * @private
 * @param   {D3Selection}    svg
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.initMarkers = function initMarkers(svg) {
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

/**
 * Initialize SVG element.
 * @private
 * @param   {D3Selection}    svg
 * @this    ge.GraphEditor
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.initSvg = function initSvg(svg) {
	svg.attr('id', this.options.id)
		.classed(this.options.css.graph, true)
		.classed(this.options.css.digraph, this.options.directed);

	this.initMarkers(svg);

	var g = svg.append('g');
	var defsContainer = svg.select('defs'); //g.append('defs');
	var linkContainer = g.append('g');
	var nodeContainer = g.append('g');

	/**
	 * Graph container element.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.container = g;
	/**
	 * Link text path elements.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.defs = defsContainer.selectAll('.' + this.options.css.textpath);
	/**
	 * Link elements.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.links = linkContainer.selectAll('g');
	/**
	 * Node elements.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.nodes = nodeContainer.selectAll('g');
	/**
	 * 'Drag to link nodes' line.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.dragLine = g.append('path')
		.classed(this.options.css.dragline, true)
		.classed(this.options.css.hide, true)
		.attr('d', 'M0,0L0,0');
	/**
	 * Text size calculator.
	 * @readonly
	 * @member {ge.TextSize}
	 */
	this.textSize = new ge.TextSize(
		svg.append('text')
			.classed(this.options.css.node, true)
			.node()
	);

	/**
	 * Graph SVG element.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.svg = svg;

	return this;
};


/**
 * Initialize graph data.
 * @private
 * @param   {ImportGraphData} data
 * @this    ge.GraphEditor
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.initData = function initData(data) {
	/**
	 * Nodes by ID.
	 * @readonly
	 * @member {Object<ID,Node>}
	 */
	this.nodeById = {};
	/**
	 * Links by ID.
	 * @readonly
	 * @member {Object<ID,Link>}
	 */
	this.linkById = {};
	/**
	 * Graph data.
	 * @readonly
	 * @member {GraphData}
	 */
	this.data = {
		nodes: [],
		links: []
	};
	this.addNodes(data.nodes, true);
	this.addLinks(data.links, true);
	return this;
};

/**
 * Initialize graph state.
 * @private
 * @this    ge.GraphEditor
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.initState = function initState() {
	/**
	 * Graph editor state.
     * @readonly
	 * @member {Object}
	 * @property {boolean}       zoomed             False if the graph is clicked.
	 * @property {boolean}       dragged            False if a node is clicked.
	 * @property {?D3Simulation} simulation         Current simulation object.
	 * @property {boolean}       simulationStarted  True if a simulation is started.
	 * @property {boolean}       dragToLink         True in 'drag to link nodes' mode.
	 * @property {?Node}         newLinkTarget      New link target in 'drag to link nodes' mode.
	 * @property {?Node}         selectedNode       Selected node.
	 * @property {?Link}         selectedLink       Selected link.
	 * @property {?Point}        dragPos            Last drag end position.
	 * @property {number}        zoom               Zoom level.
	 */
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
