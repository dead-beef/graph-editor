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
'use strict';

/**
 * Get object ID.
 * @param {?(Object|undefined)} obj
 * @returns {?ID}
 */
ge.id = function(obj) {
	return obj && obj.id || null;
};

/**
 * @param {Object} _this
 * @param {function} func
 * @returns {function}
 */
ge.bind = function(_this, func) {
	return function() {
		return func.apply(_this, arguments);
	};
};

/**
 * Get angle sine and cosine.
 * @param {number} angle Angle in degrees.
 * @returns {SinCos}
 */
ge.sincos = function(angle) {
	angle *= Math.PI / 180;
	return [ Math.sin(angle), Math.cos(angle) ];
};

/**
 * Compare numbers or arrays of numbers.
 * @param {(number|Array<number>)} u
 * @param {(number|Array<number>)} v
 * @param {number}                 [eps=1e-5] Precision.
 * @returns {boolean}
 */
ge.equal = function(u, v, eps) {
	eps = eps || 1e-5;
	var eq = function(x, y) { return Math.abs(x - y) < eps; };

	if(u === null || v === null
	   || u === undefined || v === undefined
	   || typeof u === 'number' && Array.isArray(v)
	   || typeof v === 'number' && Array.isArray(u)) {
		return false;
	}

	if(typeof u === 'number' && typeof v === 'number') {
		return eq(u, v);
	}

	if(!Array.isArray(u) || !Array.isArray(v)) {
		throw new Error(
			'ge.equal: invalid argument type: '
				.concat(u.toString(), ' ', v.toString())
		);
	}

	if(u.length !== v.length) {
		return false;
	}

	for(var i = 0; i < u.length; ++i) {
		if(!eq(u[i], v[i])) {
			return false;
		}
	}

	return true;
};

/**
 * Default node export function.
 * @param   {Node}           node
 * @this    {ge.GraphEditor}
 * @returns {ExportNodeData}
 */
ge.defaultExportNode = function(node) {
	return {
		id: node.id,
		x: node.x - this.bbox[0][0],
		y: node.y - this.bbox[0][1],
		size: node.size,
		title: node.title,
		data: node.data
	};
};

/**
 * Default link export function.
 * @param   {Link}           link
 * @this    {ge.GraphEditor}
 * @returns {ExportLinkData}
 */
ge.defaultExportLink = function(link) {
	return {
		source: link.source.id,
		target: link.target.id,
		size: link.size,
		title: link.title,
		data: link.data
	};
};

/**
 * Default link path function.
 * @param   {GraphOptions} options Graph options
 * @this    {ge.GraphEditor}
 * @returns {string}               SVG text path.
 */
ge.defaultLinkPath = function(d) {
	var x0, y0, x1, y1;

	if(d.source === d.target) {
		var arc = this.options.link.arc;
		var r = d.source.size + d.size;

		x0 = d.source.x + arc.start[1] * d.source.size;
		y0 = d.source.y - arc.start[0] * d.source.size;
		x1 = d.source.x + arc.end[1] * r;
		y1 = d.source.y - arc.end[0] * r;

		d.textPath = ''.concat(
			'M', x0, ',', y0,
			'A', d.source.size, ',', d.source.size,
			',0,1,0,', x1, ',', y1
		);
		d.path = d.textPath;
		d.flip = 0;

		return d.textPath;
	}

	x0 = d.source.x;
	y0 = d.source.y;
	x1 = d.target.x - x0;
	y1 = d.target.y - y0;

	var length = Math.sqrt(x1 * x1 + y1 * y1);

	x1 /= length;
	y1 /= length;

	length -= d.source.size + d.target.size + d.size;

	x0 += x1 * d.source.size;
	y0 += y1 * d.source.size;

	x1 = x0 + x1 * length;
	y1 = y0 + y1 * length;

	d.path = ''.concat(
		'M', x0, ',', y0,
		'L', x1, ',', y1
	);

	if((d.flip = +(x0 > x1))) {
		d.textPath = ''.concat(
			'M', x1, ',', y1,
			'L', x0, ',', y0
		);
	}
	else {
		d.textPath = d.path;
	}

	return d.textPath;
};

/**
 * Default simulation start function.
 * @param   {?D3Simulation} simulation  Old simulation object.
 * @param   {GraphOptions}  options     Graph options.
 * @param   {Array<Node>}   nodes       Graph nodes.
 * @param   {Array<Link>}   links       Graph links.
 * @this    {ge.GraphEditor}
 * @returns {D3Simulation}              New/updated simulation object.
 */
ge.defaultSimulation = function(simulation, nodes, links) {
	if(!simulation) {
		simulation = d3.forceSimulation()
			.force('charge', d3.forceManyBody())
			.force('link', d3.forceLink())
			.force('center', d3.forceCenter());
	}

	var dist = 10 * d3.max(nodes, function(d) { return d.size; });

	var cx = d3.mean(nodes, function(d) { return d.x; });
	var cy = d3.mean(nodes, function(d) { return d.y; });

	simulation.nodes(nodes);
	simulation.force('center').x(cx).y(cy);
	simulation.force('link').links(links).distance(dist);

	return simulation;
};

/*ge.debounceD3 = function(func, delay) {
	var timeout = null;

	return function() {
		var context = this;
		var args = arguments;
		var d3ev = d3.event;

		if(timeout !== null) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(
			function() {
				var tmp = d3.event;
				timeout = null;
				d3.event = d3ev;
				try {
					func.apply(context, args);
				}
				finally {
					d3.event = tmp;
				}
			},
			delay
		);
	};
};*/
'use strict';

/**
 * Return true if object is a [link]{@link Link}.
 * @private
 * @param   {Object} data
 * @returns {boolean}
 */
ge.GraphEditor.prototype.isLinkData = function(obj) {
	return obj.source !== undefined;
};

/**
 * Get node/link SVG element.
 * @param   {?Reference}   el
 * @returns {?D3Selection}
 */
ge.GraphEditor.prototype.getElement = function(el) {
	if(el === null) {
		return null;
	}
	if(el.select) {
		return el;
	}
	if(el instanceof SVGElement) {
		return d3.select(el);
	}
	if(typeof el !== 'object') {
		el = this.nodeById[el] || this.linkById[el];
	}
	if(!el) {
		return null;
	}
	return this.svg.select(el.selector);
};

/**
 * Get node/link data.
 * @param   {?Reference}   el
 * @returns {?(Node|Link)}
 */
ge.GraphEditor.prototype.getData = function(el) {
	if(el === null) {
		return null;
	}
	if(el.select) {
		return el.datum();
	}
	if(el instanceof SVGElement) {
		return d3.select(el).datum();
	}
	if(typeof el !== 'object') {
		return this.nodeById[el] || this.linkById[el];
	}
	return el;
};

/**
 * Add a node if it does not exist.
 * @param   {ImportNodeData} node                Node data.
 * @param   {boolean}        [skipUpdate=false]  Skip DOM update.
 * @returns {?Node}                              Added node.
 */
ge.GraphEditor.prototype.addNode = function(node, skipUpdate) {
	if(!this.initNode(node)) {
		return null;
	}
	this.data.nodes.push(node);
	if(!skipUpdate) {
		this.update();
	}
	return node;
};

/**
 * Add a link if it does not exist.
 * @param   {ImportLinkData} link                Link data.
 * @param   {boolean}        [skipUpdate=false]  Skip DOM update.
 * @returns {?Link}                              Added link.
 */
ge.GraphEditor.prototype.addLink = function(link, skipUpdate) {
	if(!this.initLink(link)) {
		return null;
	}
	this.data.links.push(link);
	if(!skipUpdate) {
		this.update();
	}
	return link;
};

/**
 * Add multiple nodes.
 * @param   {Array<ImportNodeData>} nodes               Node data.
 * @param   {boolean}               [skipUpdate=false]  Skip DOM update.
 * @returns {Array<Node>}                               Added nodes.
 */
ge.GraphEditor.prototype.addNodes = function(nodes, skipUpdate) {
	var newNodes = nodes.filter(ge.bind(this, this.initNode));
	this.data.nodes.push.apply(this.data.nodes, newNodes);
	if(!skipUpdate) {
		this.update();
	}
	return newNodes;
};

/**
 * Add multiple links.
 * @param   {Array<ImportLinkData>} links               Link data.
 * @param   {boolean}               [skipUpdate=false]  Skip DOM update.
 * @returns {Array<Link>}                               Added links.
 */
ge.GraphEditor.prototype.addLinks = function(links, skipUpdate) {
	var newLinks = links.filter(ge.bind(this, this.initLink));
	this.data.links.push.apply(this.data.links, newLinks);
	if(!skipUpdate) {
		this.update();
	}
	return newLinks;
};

/**
 * Add one or multiple nodes/links.
 * @param   {ImportNodeData|ImportLinkData|Array<(ImportNodeData|ImportLinkData)>} data  Data.
 * @param   {boolean} [skipUpdate=false]  Skip DOM update.
 * @returns {?(Node|Link|AddedObjects)}   Added objects.
 */
ge.GraphEditor.prototype.add = function(data, skipUpdate) {
	var self = this;

	if(Array.isArray(data)) {
		var newNodes = [], newLinks = [];
		data.forEach(function(d) {
			if(self.isLinkData(d)) {
				if(self.initLink(d)) {
					newLinks.push(d);
				}
			}
			else if(self.initNode(d)) {
				newNodes.push(d);
			}
		});

		self.data.nodes.push.apply(self.data.nodes, newNodes);
		self.data.links.push.apply(self.data.links, newLinks);

		if(!skipUpdate) {
			self.update();
		}

		return [ newNodes, newLinks ];
	}

	data = self.getData(data);
	if(self.isLinkData(data)) {
		return self.addLink(data, skipUpdate);
	}
	return this.addNode(data, skipUpdate);
};

/**
 * Remove a link by index.
 * @private
 * @param {number} idx  Link index.
 */
ge.GraphEditor.prototype._removeLink = function(idx) {
	if(this.state.selectedLink === this.data.links[idx]) {
		this.selectLink(null);
	}
	delete this.linkById[this.data.links[idx].id];
	this.data.links.splice(idx, 1);
};

/**
 * Remove a link.
 * @param   {Reference} data                Link.
 * @param   {boolean}   [skipUpdate=false]  Skip DOM update.
 * @returns {boolean}                       False if link does not exist.
 */
ge.GraphEditor.prototype.removeLink = function(data, skipUpdate) {
	if(!(data = this.getData(data))) {
		return false;
	}

	var i = this.data.links.indexOf(data);
	if(i < 0) {
		console.error('removeLink', data, 'indexOf() < 0');
		return false;
	}

	this._removeLink(i);

	if(!skipUpdate) {
		this.update();
	}
	return true;
};

/**
 * Remove a node.
 * @param   {Reference} data                Node.
 * @param   {boolean}   [skipUpdate=false]  Skip DOM update.
 * @returns {boolean}                       False if node does not exist.
 */
ge.GraphEditor.prototype.removeNode = function(data, skipUpdate) {
	if(!(data = this.getData(data))) {
		return false;
	}

	var i = this.data.nodes.indexOf(data);
	if(i < 0) {
		console.error('removeNode', data, ' indexOf() < 0');
		return false;
	}

	if(this.state.selectedNode === data) {
		this.selectNode(null);
	}

	this.data.nodes.splice(i, 1);
	delete this.nodeById[data.id];

	i = 0;
	var links = this.data.links;
	while(i < links.length) {
		if(links[i].source === data || links[i].target === data) {
			this._removeLink(i);
		}
		else {
			++i;
		}
	}

	if(!skipUpdate) {
		this.update();
	}
	return true;
};

/**
 * Remove a node or a link.
 * @private
 * @param   {Reference} data                Reference.
 * @param   {boolean}   [skipUpdate=false]  Skip DOM update.
 * @returns {boolean}                       False if object does not exist.
 */
ge.GraphEditor.prototype._remove = function(data, skipUpdate) {
	data = this.getData(data);
	if(this.isLinkData(data)) {
		return this.removeLink(data, skipUpdate);
	}
	return this.removeNode(data, skipUpdate);
};

/**
 * Remove one or multiple nodes/links.
 * @param   {(Reference|Array<Reference>)} data                References.
 * @param   {boolean}                      [skipUpdate=false]  Skip DOM update.
 */
ge.GraphEditor.prototype.remove = function(data, skipUpdate) {
	var self = this;

	if(Array.isArray(data)) {
		data.forEach(function(d) {
			self._remove(d, true);
		});

		if(!skipUpdate) {
			self.update();
		}
		return;
	}

	return self._remove(data, skipUpdate);
};

/**
 * Set or return selected node.
 * @param   {?Reference}   [node]          Node.
 * @param   {boolean}      [update=false]  Update DOM if the node is already selected.
 * @returns {(Node|ge.GraphEditor)}
 */
ge.GraphEditor.prototype.selectNode = function(node, update) {
	if(node === undefined) {
		return this.state.selectedNode;
	}

	node = this.getData(node);

	if(this.state.selectedNode === node && !update) {
		return this;
	}

	var cls = this.options.css.selection.node;

	this.state.selectedNode = node;

	if(!node) {
		this.svg.classed(cls, false);
		this.nodes.classed(cls, false);
		this.links.classed(cls, false);
		return this;
	}

	var selectedNode = function(d) { return d === node; };
	var selectedLink;

	if(this.options.directed) {
		selectedLink = function(d) { return d.source === node; };
	}
	else {
		selectedLink = function(d) {
			return d.source === node || d.target === node;
		};
	}

	this.svg.classed(cls, true);
	this.nodes.classed(cls, selectedNode);
	this.links.classed(cls, selectedLink);

	this.nodes.filter(selectedNode).raise();
	this.links.filter(selectedLink).raise();

	return this;
};

/**
 * Set or return selected link.
 * @param   {?Reference}   [link]          Link.
 * @param   {boolean}      [update=false]  Update DOM if the link is already selected.
 * @returns {(Link|ge.GraphEditor)}
 */
ge.GraphEditor.prototype.selectLink = function(link, update) {
	if(link === undefined) {
		return this.state.selectedLink;
	}

	link = this.getData(link);

	if(this.state.selectedLink === link && !update) {
		return this;
	}

	var cls = this.options.css.selection.link;

	this.state.selectedLink = link;

	if(!link) {
		this.svg.classed(cls, false);
		this.links.classed(cls, false);
		return this;
	}

	var selectedLink = function(d) { return d === link; };

	this.svg.classed(cls, true);
	this.links.classed(cls, selectedLink);
	this.links.filter(selectedLink).raise();

	return this;
};

/**
 * Set or return selected node/link.
 * @param   {?Reference}   [data]          Node or link.
 * @param   {boolean}      [update=false]  Update DOM if the node/link is already selected.
 * @returns {(Node|Link|Selection|ge.GraphEditor)}
 */
ge.GraphEditor.prototype.select = function(data, update) {
	if(data === undefined) {
		return {
			node: this.state.selectedNode,
			link: this.state.selectedLink
		};
	}
	if(data === null) {
		return this.selectNode(null)
			.selectLink(null);
	}
	if(!(data = this.getData(data))) {
		return this;
	}
	if(this.isLinkData(data)) {
		return this.selectLink(data, update);
	}
	return this.selectNode(data, update);
};

/**
 * Start force simulation.
 * @param   {boolean} [stopOnEnd=this.options.simulation.stop]  Stop the simulation when it converges.
 * @fires   simulation-start
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.startSimulation = function(stopOnEnd) {
	var self = this;

	if(stopOnEnd === undefined) {
		stopOnEnd = this.options.simulation.stop;
	}

	if(this.state.simulationStarted) {
		if(stopOnEnd) {
			this.state.simulation.on(
				'end',
				function() { self.stopSimulation(); }
			);
		}
		else {
			this.state.simulation.on('end', null);
		}
		return this;
	}

	this.state.simulationStarted = true;

	this.state.simulation = this.options.simulation.create.call(
		this,
		this.state.simulation,
		this.data.nodes,
		this.data.links
	);

	var step = 0;

	this.state.simulation.on(
		'tick',
		function() {
			if(++step >= self.options.simulation.step) {
				step = 0;
				self.update(true);
			}
		}
	);

	if(stopOnEnd) {
		this.state.simulation.on(
			'end',
			function() { self.stopSimulation(); }
		);
	}
	else {
		this.state.simulation.on('end', null);
	}

	//this.data.nodes.forEach(function(d) { d.fx = d.fy = null; });
	this.state.simulation.alpha(1).restart();
	this.dispatch.call('simulation-start', this);

	return this;
};

/**
 * Stop force simulation.
 * @fires   simulation-stop
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.stopSimulation = function() {
	if(!this.state.simulationStarted) {
		return this;
	}

	this.state.simulation.stop();
	this.state.simulationStarted = false;
	this.dispatch.call('simulation-stop', this);

	return this;
};

/**
 * Set or return force simulation state.
 * @param   {boolean|string} [on]  state | 'start' | 'stop' | 'restart' | 'toggle'
 * @fires   simulation-start
 * @fires   simulation-stop
 * @returns {(boolean|ge.GraphEditor)}
 */
ge.GraphEditor.prototype.simulation = function(on) {
	if(on === undefined) {
		return this.state.simulationStarted;
	}
	if(on === 'restart') {
		if(!this.state.simulationStarted) {
			return this.startSimulation();
		}
		this.state.simulation.alpha(1).restart();
		return this;
	}
	if(on === 'toggle') {
		on = !this.state.simulationStarted;
	}
	if(on && on !== 'stop') {
		return this.startSimulation();
	}
	return this.stopSimulation();
};

/**
 * Set or return 'drag to link nodes' state.
 * @param   {boolean|string}           [on]  state | 'toggle'
 * @returns {(boolean|ge.GraphEditor)}
 */
ge.GraphEditor.prototype.dragToLink = function(on) {
	if(on === undefined) {
		return this.state.dragToLink;
	}
	if(on === 'toggle') {
		on = !this.state.dragToLink;
	}
	this.state.dragToLink = on;
	return this;
};


/**
 * Clear graph DOM.
 * @param   {boolean}        [clearData=true]  Clear graph data.
 * @fires   simulation-stop
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.clear = function(clearData) {
	clearData = clearData || (clearData === undefined);

	this.simulation(false);

	this.nodes = this.nodes.data([], ge.id);
	this.nodes.exit().remove();

	this.links = this.links.data([], ge.id);
	this.links.exit().remove();

	this.defs = this.defs.data([], ge.id);
	this.defs.exit().remove();

	if(clearData) {
		this.nodeById = {};
		this.linkById = {};
		this.data = {
			nodes: [],
			links: []
		};
		this.initState();
	}

	return this;
};


/**
 * Regenerate graph DOM.
 * @fires   simulation-stop
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.redraw = function() {
	return this.clear(false).update();
};

/**
 * Destroy the graph.
 * @fires   simulation-stop
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.destroy = function() {
	var cls = this.options.css;

	$(window).off('resize', this.onresize);

	this.clear();

	this.svg
		.classed(cls.graph, false)
		.classed(cls.digraph, false)
		.classed(cls.selection.node, false)
		.classed(cls.selection.link, false)
		.on('.zoom', null)
		.html('');

	return this;
};

/**
 * Export graph data.
 * @returns {ExportGraphData}
 */
ge.GraphEditor.prototype.exportData = function() {
	var exp = this.options['export'];
	return {
		nodes: this.data.nodes.map(ge.bind(this, exp.node)),
		links: this.data.links.map(ge.bind(this, exp.link))
	};
};
'use strict';

/**
 * Add an event handler.
 * @param   {string}         event
 * @param   {?function}      handler
 * @returns {ge.GraphEditor}
 * @see [d3.dispatch.on]{@link https://github.com/d3/d3-dispatch#dispatch_on}
 */
ge.GraphEditor.prototype.on = function(event, handler) {
	this.dispatch.on(event, handler);
	return this;
};


/**
 * Get mouse or touch position.
 * @private
 * @returns {Point}
 * @see [d3.mouse]{@link https://github.com/d3/d3-selection/blob/master/README.md#mouse}
 * @see [d3.touch]{@link https://github.com/d3/d3-selection/blob/master/README.md#touch}
 */
ge.GraphEditor.prototype.clickPosition = function() {
	var node = this.container.node();
	return d3.touch(node) || d3.mouse(node);
};

/**
 * Get touched node.
 * @private
 * @returns {?Node}
 * @see [d3.event]{@link https://github.com/d3/d3-selection/blob/master/README.md#event}
 * @see [document.elementFromPoint]{@link https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint}
 */
ge.GraphEditor.prototype.touchedNode = function() {
	var x = d3.event.touches[0].pageX;
	var y = d3.event.touches[0].pageY;

	var el = document.elementFromPoint(x, y);
	var tag, cls;

	var node = this.options.css.node;

	while(true) {
		if(!el) {
			return null;
		}

		tag = el.tagName.toLowerCase();
		if(tag === 'svg' || tag === 'body') {
			return null;
		}

		cls = el.getAttribute('class');
		if(el.tagName === 'g' && cls && cls.indexOf(node) >= 0) {
			return d3.select(el).datum();
		}

		el = el.parentNode;
	}
};

/**
 * Set node drag event handlers.
 * @private
 * @param {D3Drag} drag  Node drag behavior.
 * @fires node-click
 * @fires new-link-start
 * @fires new-link-end
 * @fires new-link-cancel
 * @returns {D3Drag}
 */
ge.GraphEditor.prototype.dragEvents = function(drag) {
	var self = this;

	return drag
		.on('start', function(d) {
			self.state.dragged = false;
			self.state.dragPos = null;
			d3.select(this).raise();

			if(self.state.simulationStarted && !self.state.dragToLink) {
				d.fx = d.x;
				d.fy = d.y;
				self.simulation('restart');
			}
		})
		.on('drag', function(d) {
			if(self.state.dragToLink) {
				var mouse = self.clickPosition();
				var path = ''.concat(
					'M', d.x, ',', d.y,
					'L', mouse[0], ',', mouse[1]
				);

				if(!self.state.dragged) {
					self.state.dragged = true;
					self.dragLine
						.classed(self.options.css.hide, false)
						.attr('d', path);
					self.dispatch.call('new-link-start', self, d);
				}
				else {
					self.transition(self.dragLine, 'drag')
						.attr('d', path);
				}
			}
			else {
				self.state.dragged = true;
				d.x += d3.event.dx;
				d.y += d3.event.dy;
				if(self.state.simulationStarted) {
					d.fx = d.x;
					d.fy = d.y;
					self.simulation('restart');
				}
				self.updateNode(this);
			}
		})
		.on('end', function(d) {
			d.fx = null;
			d.fy = null;
			
			self.state.dragPos = self.clickPosition();

			if(self.state.dragged) {
				self.state.dragged = false;
				if(self.state.dragToLink) {
					self.dragLine.classed(self.options.css.hide, true);
					if(self.state.newLinkTarget) {
						var target = self.state.newLinkTarget;
						self.state.newLinkTarget = null;
						self.dispatch.call(
							'new-link-end',
							self, d, target
						);
					}
					else {
						self.dispatch.call('new-link-cancel', self, d);
					}
				}
				else if(self.state.simulationStarted) {
					self.simulation('restart');
				}
			}
			else {
				self.dispatch.call('node-click', self, d);
			}
		});
};

/**
 * Set zoom event handlers.
 * @private
 * @param {D3Zoom} zoom  Graph zoom behavior.
 * @fires click
 * @returns {D3Zoom}
 */
ge.GraphEditor.prototype.zoomEvents = function(zoom) {
	var self = this;
	//var prevScale = 1;

	return zoom
		.duration(self.options.transition.zoom)
		.on('end', function() {
			if(!self.state.zoomed) {
				var pos = self.clickPosition();
				if(!ge.equal(self.state.dragPos, pos)) {
					self.dispatch.call('click', self, pos);
				}
				else {
					self.state.dragPos = null;
				}
			}
			self.state.zoomed = false;
		})
		.on('zoom', function() {
			self.state.zoomed = true;

			/*var scale = d3.event.transform.k;

			if(Math.abs(scale - prevScale) > 0.001)
			{
				prevScale = scale;

				if(scale > graph.options.sizeScaleMax)
				{
					self.state.sizeScale = graph.options.sizeScaleMax / scale;
				}
				else if(scale < graph.options.sizeScaleMin)
				{
					self.state.sizeScale = graph.options.sizeScaleMin / scale;
				}
				else
				{
					self.state.sizeScale = 1;
				}

				self.updateSize();
			}*/

			var type;

			if(ge.equal(d3.event.transform.k, self.state.zoom)) {
				type = 'drag';
			}
			else {
				type = 'zoom';
				self.state.zoom = d3.event.transform.k;
			}

			self.transition(self.container, type, 'zoom')
				.attr(
					'transform',
					d3.event.transform.toString()
				);
		});
};

/**
 * Set link event handlers.
 * @private
 * @param {D3Selection} links
 * @fires link-click
 * @returns {D3Selection}
 */
ge.GraphEditor.prototype.linkEvents = function(links) {
	var self = this;

	return links
		.on('mousedown', function(/*d*/) {
			d3.event.stopPropagation();
			d3.event.preventDefault();
		})
		.on('touchstart', function(/*d*/) {
			self.state.dragPos = self.clickPosition();
		})
		.on('mouseup', function(d) {
			d3.event.stopPropagation();
			d3.event.preventDefault();
			self.dispatch.call('link-click', self, d);
		});
};


/**
 * Set node event handlers.
 * @private
 * @param {D3Selection} nodes
 * @returns {D3Selection}
 */
ge.GraphEditor.prototype.nodeEvents = function(nodes) {
	var self = this;

	return nodes
		.attr(
			'transform',
			function(d) {
				return 'translate('.concat(d.x, ',', d.y, ')');
			}
		)
		.on('mouseover', function(d) {
			if(self.state.dragToLink) {
				self.state.newLinkTarget = d;
				/*d3.select(this).classed(
					self.options.css.connect,
					true
				);*/
			}
		})
		.on('mouseout', function(/*d*/) {
			if(self.state.dragToLink) {
				self.state.newLinkTarget = null;
			}
			/*d3.select(this).classed(
				self.options.css.connect,
				false
			);*/
		})
		.on('touchmove', function() {
			if(self.state.dragToLink) {
				self.state.newLinkTarget = self.touchedNode();
			}
		})
		.call(self.drag);
};
'use strict';

/**
 * Create SVG markers.
 * @private
 * @param   {D3Selection}    svg
 * @returns {ge.GraphEditor}
 */
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

/**
 * Initialize SVG.
 * @private
 * @param   {D3Selection}    svg
 * @this    ge.GraphEditor
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.initSvg = function(svg) {
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
ge.GraphEditor.prototype.initData = function(data) {
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
ge.GraphEditor.prototype.initState = function() {
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
ge.GraphEditor.prototype.initNode = function(node) {
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
ge.GraphEditor.prototype.initLink = function(link) {
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
'use strict';

/**
 * Default options for all graph types.
 * @type GraphOptions
 */
ge.GraphEditor.prototype.defaults = {
	id: null,
	directed: false,

	node: {
		border: 2,
		size: {
			def: 10,
			min: 10
		},
		text: {
			dx: 0,
			dy: 0,
			inside: true
		}
	},

	link: {
		path: ge.defaultLinkPath,
		size: {
			def: 2
		},
		text: {
			dx: 0,
			dy: '1.1em',
			offset: null,
			anchor: null
		},
		arc: {
			start: 180,
			end: 270
		}
	},

	simulation: {
		create: ge.defaultSimulation,
		start: false,
		stop: true,
		step: 1
	},

	transition: {
		zoom: 250,
		drag: 50,
		simulation: 50
	},

	scale: {
		min: 0.25,
		max: 8.0,
		/*size: {
			min: 0.5,
			max: 2.0
		}*/
	},

	bbox: {
		padding: 80
	},

	'export': {
		node: ge.defaultExportNode,
		link: ge.defaultExportLink
	},

	css: {
		//markers: 'ge-markers',
		node: 'ge-node',
		graph: 'ge-graph',
		digraph: 'ge-digraph',
		hide: 'ge-hidden',
		dragline: 'ge-dragline',
		link: 'ge-link',
		//connect: 'ge-connect',
		selection: {
			node: 'ge-selection',
			link: 'ge-link-selection'
		}
	}
};

/**
 * Default options by graph type.
 * @type Array<GraphOptions>
 */
ge.GraphEditor.prototype.typeDefaults = [
	{
		link: {
			id: function(link) {
				return ''.concat(
					Math.min(link.source.id, link.target.id),
					'-',
					Math.max(link.source.id, link.target.id)
				);
			},
			text: {
				offset: '50%',
				anchor: 'middle'
			}
		}
	},
	{
		link: {
			id: function(link) {
				return ''.concat(link.source.id, '-', link.target.id);
			},
			text: {
				offset: '20%',
				anchor: 'start'
			}
		}
	}
];

/**
 * Initialize graph options.
 * @private
 * @param   {GraphOptions}    options
 * @param   {D3Selection}     svg
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.initOptions = function(options, svg) {
	var directed;
	if(options && options.hasOwnProperty('directed')) {
		directed = options.directed;
	}
	else {
		directed = this.defaults.directed;
	}

	var typeDefaults = this.typeDefaults[+directed];

	var opt = $.extend(true, {}, this.defaults, typeDefaults, options || {});

	opt.id = opt.id
		|| svg.attr('id')
		|| 'ge'.concat(Math.floor(Math.random() * 100));

	opt.link.arc = {
		start: ge.sincos(Math.min(opt.link.arc.start, opt.link.arc.end)),
		end: ge.sincos(Math.max(opt.link.arc.start, opt.link.arc.end)),
		center: ge.sincos((opt.link.arc.start + opt.link.arc.end) / 2)
	};

	var flip = (100 - parseInt(opt.link.text.offset)) + '%';
	opt.link.text.offset = [ opt.link.text.offset, flip ];

	switch(opt.link.text.anchor) {
		case 'start':
			flip = 'end';
			break;
		case 'end':
			flip = 'start';
			break;
		default:
			flip = 'middle';
	}
	opt.link.text.anchor = [ opt.link.text.anchor, flip ];

	this.options = opt;
	return this;
};
'use strict';

/**
 * Create a transition if necessary.
 * @private
 * @param   {D3Selection}    selection
 * @param   {string}         type       duration = options.transition[type]
 * @param   {string}         name
 * @returns {ge.GraphEditor}
 * @see [d3.transition]{@link https://github.com/d3/d3-transition/blob/master/README.md#api-reference}
 */
ge.GraphEditor.prototype.transition = function(selection, type, name) {
	var duration = this.options.transition[type];
	if(!duration) {
		return selection;
	}
	/*if(this.state.simulation) {
		return selection;
	}*/
	return selection
		.transition(name)
		.duration(duration);
};

/**
 * Resize node to fit text inside.
 * @private
 * @param   {Node}     node
 * @returns {boolean}        False if node text did not change.
 */
ge.GraphEditor.prototype.getNodeSize = function(node) {
	if(node.title === node.prevTitle) {
		return false;
	}

	node.prevTitle = node.title;

	this.tmpText.text(node.title);
	var bbox = this.tmpText.node().getBBox();
	var width;

	var words = node.title.split(/\s+/);

	if(words.length <= 1) {
		width = bbox.width;
	}
	else {
		width = Math.sqrt(bbox.width * bbox.height);

		var line = '';
		var lineWidth, prevLineWidth = 0, maxLineWidth = 0;
		var lines = 0;
		var i = 0;

		while(i < words.length) {
			if(line === '') {
				line = words[i];
				this.tmpText.text(line);
				prevLineWidth = this.tmpText.node().getComputedTextLength();
				++i;
			}
			else {
				line = line.concat(' ', words[i]);
				this.tmpText.text(line);
				lineWidth = this.tmpText.node().getComputedTextLength();
				if(lineWidth > width) {
					maxLineWidth = Math.max(maxLineWidth, prevLineWidth);
					++lines;
					line = '';
				}
				else {
					prevLineWidth = lineWidth;
					++i;
				}
			}
		}

		width = Math.max(
			maxLineWidth,
			prevLineWidth,
			bbox.height * lines * 1.5
		);
	}

	width = Math.max(width, this.options.node.size.min);

	node.textSize = width;
	node.textSize += 2 * (node.textSize % 2) + this.options.node.border;
	node.textOffset = Math.floor(-node.textSize / 2);
	node.size = node.textSize / 1.4142;

	return true;
};

/**
 * Handle graph SVG element resize.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.resized = function() {
	this.updateExtent();
	this.zoom.translateTo(this.container, 0, 0);
	return this;
};

/**
 * Update force simulation.
 * @private
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.updateSimulation = function() {
	if(this.state.simulation) {
		this.state.simulation = this.options.simulation
			.create.call(
				this,
				this.state.simulation,
				this.data.nodes,
				this.data.links
			)
			.alpha(1);
	}
	return this;
};

/**
 * Update bounding box.
 * @private
 * @param   {Node}           [node]  Moved node.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.updateBBox = function(node) {
	var data = this.data.nodes;
	var padding = this.options.bbox.padding;

	if(node === undefined) {
		var extent = d3.extent(data, function(d) { return d.x; });
		if(extent[0] === undefined) {
			extent[0] = extent[1] = 0;
		}

		this.bbox[0][0] = extent[0] - padding;
		this.bbox[1][0] = extent[1] + padding;

		extent = d3.extent(data, function(d) { return d.y; });
		if(extent[0] === undefined) {
			extent[0] = extent[1] = 0;
		}

		this.bbox[0][1] = extent[0] - padding;
		this.bbox[1][1] = extent[1] + padding;
	}
	else {
		this.bbox[0][0] = Math.min(this.bbox[0][0], data.x - padding);
		this.bbox[1][0] = Math.max(this.bbox[1][0], data.x + padding);
		this.bbox[0][1] = Math.min(this.bbox[0][1], data.y - padding);
		this.bbox[1][1] = Math.max(this.bbox[1][1], data.y + padding);
	}

	this.updateExtent();
	this.zoom.translateExtent(this.bbox);
	return this;
};

/**
 * Update zoom behavior extent.
 * @private
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.updateExtent = function() {
	var bbox = this.svg.node().getBoundingClientRect();
	var extent = [
		[ 0, 0 ],
		[ bbox.width, bbox.height ]
	];
	this.zoom.extent(extent);
	return this;
};

/**
 * Update link element.
 * @param   {Reference}       link  Changed link.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.updateLink = function(link) {
	var self = this;
	var transition = function(selection) {
		return self.transition(selection, 'drag', 'update-link');
	};

	link = self.getElement(link);
	var def = d3.select('#' + link.datum().defId);

	transition(def)
		.attr('d', ge.bind(self, self.options.link.path));

	transition(link.select('path'))
		.attr('d', function(d) { return d.path; })
		.style('stroke-width', function(d) { return d.size + 'px'; });

	link.select('textPath')
		.text(function(d) { return d.title; });

	return this;
};


/**
 * Update node element. If it was moved or resized, update its links.
 * @param   {Reference}       node  Changed node.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.updateNode = function(node) {
	var self = this;
	var opt = this.options;

	node = this.getElement(node);

	var circle = node.select('circle');

	var prevTransform = node.attr('transform');
	var prevSize = circle.attr('r');
	var transform;
	var size;

	var transition = function(selection) {
		return self.transition(selection, 'drag', 'update-node');
	};

	transition(node)
		.attr(
			'transform',
			function(d) {
				transform = 'translate('.concat(d.x, ',', d.y, ')');
				return transform;
			}
		);

	if(opt.node.text.inside) {
		if(this.getNodeSize(node.datum())) {
			node.select('foreignObject')
				.attr('x', function(d) { return d.textOffset; })
				.attr('y', function(d) { return d.textOffset; })
				.attr('width', function(d) { return d.textSize; })
				.attr('height', function(d) { return d.textSize; })
				.select('span')
				.text(function(d) { return d.title; });
		}
	}
	else {
		node.select('text')
			.attr('dx', function(d) {
				return d.size + opt.node.text.dx;
			})
			.text(function(d) {
				return d.title;
			});
	}

	transition(circle)
		.attr('r', function(d) { size = d.size; return size; });

	if(transform !== prevTransform || size !== prevSize) {
		node = node.datum();

		var updateLink = function(d) {
			return d.source === node || d.target === node;
		};

		var defs = this.defs.filter(updateLink);
		var links = this.links.filter(updateLink);

		transition(defs)
			.attr('d', ge.bind(this, opt.link.path));

		transition(links.select('path'))
			.attr('d', function(d) { return d.path; });

		var offset = opt.link.text.offset;
		var anchor = opt.link.text.anchor;

		transition(links.select('textPath'))
			.attr('startOffset', function(d) { return offset[d.flip]; })
			.attr('text-anchor', function(d) { return anchor[d.flip]; });

		this.updateBBox();
	}

	return this;
};

/*ge.GraphEditor.prototype.updateSize = function(nodes, links) {
	nodes = nodes || this.nodes;
	links = links || this.links;
	var opt = this.options;
	var sizeScale = this.state.sizeScale;

	links.style('stroke-width', function(d) {
		return d.size * sizeScale + 'px';
	});

	links.select('text')
		.style(
			'stroke-width',
			opt.textStrokeWidth * sizeScale + 'px'
		)
		.style(
			'font-size',
			opt.linkFontSize * sizeScale + 'px'
		);

	nodes.select('circle')
		.attr('r', function(d) { return d.size * sizeScale; })
		.style(
			'stroke-width',
			opt.nodeStrokeWidth * sizeScale + 'px'
		);

	nodes.select('text')
		.style(
			'font-size',
			opt.fontSize * sizeScale + 'px'
		)
		.style(
			'stroke-width',
			opt.textStrokeWidth * sizeScale + 'px'
		);

	return this;
};*/

/**
 * Update everything.
 * @param   {boolean}        [simulation=false]  True if called from the simulation tick handler.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.update = function(simulation) {
	var self = this;
	var opt = this.options;
	var ttype = simulation ? 'simulation' : 'drag';

	var transition = function(selection) {
		return self.transition(selection, ttype, 'update');
	};

	if(opt.node.text.inside) {
		this.data.nodes.forEach(ge.bind(this, this.getNodeSize));
	}

	this.defs = this.defs.data(this.data.links, ge.id);
	this.defs.exit().remove();
	this.defs = this.defs.enter()
		.append('path')
		.attr('id', function(d) { return d.defId; })
		.merge(this.defs);

	transition(this.defs).attr('d', ge.bind(this, opt.link.path));

	this.links = this.links.data(this.data.links, ge.id);
	this.links.exit().remove();

	var newLinks = this.links.enter()
		.append('g')
		.attr('id', function(d) { return d.pathId; })
		.classed(opt.css.link, true);

	newLinks.append('path');

	newLinks.append('text')
		.attr('dx', opt.link.text.dx)
		.attr('dy', opt.link.text.dy)
		.append('textPath')
		.attr('xlink:href', function(d) { return '#' + d.defId; });

	this.links = newLinks.merge(this.links);

	transition(this.links.select('path'))
		.style('stroke-width', function(d) { return d.size + 'px'; })
		.attr('d', function(d) { return d.path; });

	var offset = opt.link.text.offset;
	var anchor = opt.link.text.anchor;

	transition(this.links.select('textPath'))
		.text(function(d) { return d.title; })
		.attr('startOffset', function(d) { return offset[d.flip]; })
		.attr('text-anchor', function(d) { return anchor[d.flip]; });

	this.nodes = this.nodes.data(this.data.nodes, ge.id);
	this.nodes.exit().remove();
	var newNodes = this.nodes.enter()
		.append('g')
		.attr('id', function(d) { return d.elementId; })
		.classed(opt.css.node, true);

	newNodes.append('circle');

	if(opt.node.text.inside) {
		newNodes.append('foreignObject')
			.append('xhtml:div')
			.append('xhtml:span');
	}
	else {
		newNodes.append('text');
	}

	this.nodes = newNodes.merge(this.nodes);

	transition(this.nodes)
		.attr(
			'transform',
			function(d) {
				return 'translate('.concat(d.x, ',', d.y, ')');
			}
		);

	if(opt.node.text.inside) {
		var obj = this.nodes.select('foreignObject');

		transition(obj)
			.attr('x', function(d) { return d.textOffset; })
			.attr('y', function(d) { return d.textOffset; })
			.attr('width', function(d) { return d.textSize; })
			.attr('height', function(d) { return d.textSize; });

		transition(obj.selectAll('span'))
			.text(function(d) { return d.title; });
	}
	else {
		transition(this.nodes.select('text'))
			.text(function(d) { return d.title; })
			.attr('dx', function(d) {
				return d.size + opt.node.text.dx;
			})
			.attr('dy', opt.node.text.dy);
	}

	transition(this.nodes.select('circle'))
		.attr('r', function(d) { return d.size; });

	this.nodeEvents(newNodes);
	this.linkEvents(newLinks);

	//this.updateSize(newNodes, newLinks);
	this.updateBBox();

	if(!simulation) {
		this.updateSimulation();
		this.selectNode(this.state.selectedNode, true);
	}

	return this;
};
return exports;});
