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
 * Initialize SVG.
 * @private
 * @param   {D3Selection}    svg
 * @this    ge.GraphEditor
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.initSvg = function initSvg(svg) {
	svg
		.attr('id', this.options.id)
		.classed(this.options.css.graph, true)
		.classed(this.options.css.digraph, this.options.directed);

	var g = svg.append('g');
	var defsContainer = svg.select('defs'); //g.append('defs');
	var linksContainer = g.append('g');
	var nodesContainer = g.append('g');

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
	this.defs = defsContainer.selectAll('.ge-text-path');
	/**
	 * Link elements.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.links = linksContainer.selectAll('g');
	/**
	 * Node elements.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.nodes = nodesContainer.selectAll('g');
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
	 * Hidden element for text size calculation.
	 * @private
	 * @member {D3Selection}
	 */
	this.tmpText = svg.append('text')
		.style('stroke', 'none')
		.style('fill', 'none');
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
	 * Node data dictionary.
	 * @readonly
	 * @member {Object<ID,Node>}
	 */
	this.nodeById = {};
	/**
	 * Link data dictionary.
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

/**
 * Initialize node data.
 * @private
 * @param   {ImportNodeData} node  Node data.
 * @returns {boolean}              False if node exists.
 */
ge.GraphEditor.prototype.initNode = function initNode(node) {
	if(node.id === undefined) {
		node.id = 1 + d3.max(this.data.nodes, function(d) { return d.id; });
		if(isNaN(node.id)) {
			node.id = 0;
		}
	}

	if(this.nodeById[node.id]) {
		return false;
	}

	node.elementId = this.options.id.concat('n', node.id);
	node.selector = '#' + node.elementId;
	node.size = node.size || this.options.node.size.def;

	if(node.x === undefined) {
		node.x = node.size + Math.random() * 512;
	}
	if(node.y === undefined) {
		node.y = node.size + Math.random() * 512;
	}
	if(node.title === undefined) {
		node.title = node.id.toString();
	}

	this.nodeById[node.id] = node;
	return true;
};

/**
 * Initialize link data.
 * @private
 * @param   {ImportLinkData} link  Link data.
 * @returns {boolean}              False if data is invalid or link exists.
 */
ge.GraphEditor.prototype.initLink = function initLink(link) {
	var source = link.source, target = link.target;

	if(typeof source !== 'object') {
		source = this.nodeById[source];
	}
	if(typeof target !== 'object') {
		target = this.nodeById[target];
	}

	if(source === undefined || target === undefined) {
		console.error(link, source, target);
		return false;
	}

	link.source = source;
	link.target = target;

	var id = this.options.link.id(link);

	if(this.linkById[id]) {
		return false;
	}

	link.id = id;
	link.size = link.size || this.options.link.size.def;
	link.defId = this.options.id.concat('d', link.id);
	link.pathId = this.options.id.concat('p', link.id);
	link.selector = '#' + link.pathId;

	if(link.title === undefined) {
		link.title = link.id;
	}

	this.linkById[link.id] = link;
	return true;
};
