'use strict';

/**
 * Return true if object is a [link]{@link Link}.
 * @private
 * @param   {Object} data
 * @returns {boolean}
 */
ge.GraphEditor.prototype.isLinkData = function isLinkData(obj) {
	return obj.source !== undefined;
};

/**
 * Get node/link SVG element.
 * @param   {?Reference}   el
 * @returns {?D3Selection}
 */
ge.GraphEditor.prototype.getElement = function getElement(el) {
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
ge.GraphEditor.prototype.getData = function getData(el) {
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
 * Get unused node ID.
 * @private
 * @returns {ID}
 */
ge.GraphEditor.prototype.nodeId = function nodeId() {
	var id = 1 + d3.max(this.data.nodes, function(d) { return d.id; });
	if(isNaN(id)) {
		id = 0;
	}
	return id;
};

/**
 * Get link ID.
 * @private
 * @param {ge.Node} source  Link source.
 * @param {ge.Node} target  Link target.
 * @returns {ID}
 */
ge.GraphEditor.prototype.linkId = function linkId(source, target) {
	var s = source.id;
	var t = target.id;
	if(!this.options.directed && s > t) {
		var tmp = s;
		s = t;
		t = tmp;
	}
	var id = s + '-' + t;
	return id;
};

/**
 * Add a node if it does not exist.
 * @param   {ImportNodeData} node                Node data.
 * @param   {boolean}        [skipUpdate=false]  Skip DOM update.
 * @returns {?ge.Node}                           Added node.
 */
ge.GraphEditor.prototype.addNode = function addNode(node, skipUpdate) {
	node = new ge.Node(this, node);
	if(this.nodeById[node.id]) {
		return null;
	}
	this.nodeById[node.id] = node;
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
 * @returns {?ge.Link}                           Added link.
 */
ge.GraphEditor.prototype.addLink = function addLink(link, skipUpdate) {
	link = new ge.Link(this, link);
	if(this.linkById[link.id]) {
		return null;
	}
	this.linkById[link.id] = link;
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
 */
ge.GraphEditor.prototype.addNodes = function addNodes(nodes, skipUpdate) {
	for(var i = 0; i < nodes.length; ++i) {
		this.addNode(nodes[i], true);
	}
	if(!skipUpdate) {
		this.update();
	}
};

/**
 * Add multiple links.
 * @param   {Array<ImportLinkData>} links               Link data.
 * @param   {boolean}               [skipUpdate=false]  Skip DOM update.
 * @returns {Array<Link>}                               Added links.
 */
ge.GraphEditor.prototype.addLinks = function addLinks(links, skipUpdate) {
	for(var i = 0; i < links.length; ++i) {
		this.addLink(links[i], true);
	}
	if(!skipUpdate) {
		this.update();
	}
};

/**
 * Add one or multiple nodes/links.
 * @param   {ImportNodeData|ImportLinkData|Array<(ImportNodeData|ImportLinkData)>} data  Data.
 * @param   {boolean} [skipUpdate=false]  Skip DOM update.
 */
ge.GraphEditor.prototype.add = function add(data, skipUpdate) {
	var self = this;
	if(Array.isArray(data)) {
		data.forEach(function(d) {
			if(self.isLinkData(d)) {
				self.addLink(d, true);
			}
			else {
				self.addNode(d, true);
			}
		});
		if(!skipUpdate) {
			self.update();
		}
	}
	else {
		data = self.getData(data);
		if(self.isLinkData(data)) {
			self.addLink(data, skipUpdate);
		}
		else {
			self.addNode(data, skipUpdate);
		}
	}
};

/**
 * Remove a link by index.
 * @private
 * @param {number} idx  Link index.
 */
ge.GraphEditor.prototype._removeLink = function _removeLink(idx) {
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
ge.GraphEditor.prototype.removeLink = function removeLink(data, skipUpdate) {
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
ge.GraphEditor.prototype.removeNode = function removeNode(data, skipUpdate) {
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
ge.GraphEditor.prototype._remove = function _remove(data, skipUpdate) {
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
ge.GraphEditor.prototype.remove = function remove(data, skipUpdate) {
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
 * Return selected node.
 * @returns {?Node}
 *//**
 * Select a node.
 * @param   {?Reference}   [node]          Node to select.
 * @param   {boolean}      [update=false]  Update DOM if the node is already selected.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.selectNode = function selectNode(node, update) {
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
 * Return selected link.
 * @returns {?Link}
 *//**
 * Selected a link.
 * @param   {?Reference}   [link]          Link to select.
 * @param   {boolean}      [update=false]  Update DOM if the link is already selected.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.selectLink = function selectLink(link, update) {
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
 * Return selected node/link.
 * @returns {Selection}
 *//**
 * Select a node or a link.
 * @param   {?Reference}   [data]          Node or link to select.
 * @param   {boolean}      [update=false]  Update DOM if the node/link is already selected.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.select = function select(data, update) {
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
ge.GraphEditor.prototype.startSimulation = function startSimulation(stopOnEnd) {
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
ge.GraphEditor.prototype.stopSimulation = function stopSimulation() {
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
ge.GraphEditor.prototype.simulation = function simulation(on) {
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
 * Return true if 'drag to link nodes' is enabled.
 * @returns {boolean}
 *//**
 * Set 'drag to link nodes' state.
 * @param   {boolean|string}           [on]  state | 'toggle'
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.dragToLink = function dragToLink(on) {
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
ge.GraphEditor.prototype.clear = function clear(clearData) {
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
ge.GraphEditor.prototype.redraw = function redraw() {
	return this.clear(false).update();
};

/**
 * Destroy the graph.
 * @fires   simulation-stop
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.destroy = function destroy() {
	var cls = this.options.css;

	this.clear();

	this.svg
		.classed(cls.graph, false)
		.classed(cls.digraph, false)
		.classed(cls.selection.node, false)
		.classed(cls.selection.link, false)
		.on('.zoom', null)
		.html('');

	window.removeEventListener('resize', this.onresize);

	return this;
};

/**
 * Convert to JSON.
 * @returns {ExportGraphData}
 */
ge.GraphEditor.prototype.toJson = function toJson() {
	var self = this;
	return {
		nodes: this.data.nodes.map(function(node) {
			return node.toJson(self, self.bbox[0][0], self.bbox[0][1]);
		}),
		links: this.data.links.map(function(link) {
			return link.toJson(self);
		})
	};
};
