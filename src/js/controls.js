'use strict';

ge.GraphEditor.prototype.isLinkData = function(d) {
	return d.source !== undefined;
};

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

ge.GraphEditor.prototype.addNodes = function(nodes, skipUpdate) {
	var newNodes = nodes.filter(ge.bind(this, this.initNode));
	this.data.nodes.push.apply(this.data.nodes, newNodes);
	if(!skipUpdate) {
		this.update();
	}
	return newNodes;
};

ge.GraphEditor.prototype.addLinks = function(links, skipUpdate) {
	var newLinks = links.filter(ge.bind(this, this.initLink));
	this.data.links.push.apply(this.data.links, newLinks);
	if(!skipUpdate) {
		this.update();
	}
	return newLinks;
};

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

ge.GraphEditor.prototype._removeLink = function(idx) {
	if(this.state.selectedLink === this.data.links[idx]) {
		this.selectLink(null);
	}
	delete this.linkById[this.data.links[idx].id];
	this.data.links.splice(idx, 1);
};

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

ge.GraphEditor.prototype._remove = function(data, skipUpdate) {
	data = this.getData(data);
	if(this.isLinkData(data)) {
		return this.removeLink(data, skipUpdate);
	}
	return this.removeNode(data, skipUpdate);
};

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

ge.GraphEditor.prototype.startSimulation = function(stopOnEnd) {
	var self = this;

	if(stopOnEnd === undefined) {
		stopOnEnd = this.options.simulation.stop;
	}

	if(this.state.simulationStarted) {
		if(stopOnEnd) {
			this.state.simulation.on(
				'end',
				function() { self.simulation(false); }
			);
		}
		else {
			this.state.simulation.on('end', null);
		}
		return this;
	}

	this.state.simulationStarted = true;

	this.state.simulation = this.options.simulation.create(
		this.state.simulation,
		this.options,
		this.data.nodes,
		this.data.links
	);

	var step = 0;

	this.state.simulation.on(
		'tick',
		function() {
			++step;
			if(step >= self.options.simulation.step) {
				step = 0;
				self.update(true);
			}
		}
	);

	if(stopOnEnd) {
		this.state.simulation.on(
			'end',
			function() { self.simulation(false); }
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

ge.GraphEditor.prototype.stopSimulation = function() {
	if(!this.state.simulationStarted) {
		return this;
	}

	this.state.simulation.stop();
	this.state.simulationStarted = false;
	this.dispatch.call('simulation-stop', this);

	return this;
};

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

ge.GraphEditor.prototype.redraw = function() {
	return this.clear(false).update();
};

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

ge.GraphEditor.prototype.exportData = function() {
	var exp = this.options['export'];
	return {
		nodes: this.data.nodes.map(ge.bind(this, exp.node)),
		links: this.data.links.map(ge.bind(this, exp.link))
	};
};
