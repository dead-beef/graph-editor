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
ge.GraphEditor.prototype.transition = function transition(selection, type, name) {
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


/*ge.GraphEditor.prototype.getNodeSize = function getNodeSize(node) {
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
};*/

/**
 * Handle graph SVG element resize.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.resized = function resized() {
	this.updateExtent();
	this.zoom.translateTo(this.container, 0, 0);
	return this;
};

/**
 * Update force simulation.
 * @private
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.updateSimulation = function updateSimulation() {
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
ge.GraphEditor.prototype.updateBBox = function updateBBox(node) {
	var data = this.data.nodes;
	var padding = this.options.bbox.padding;

	if(node === undefined) {
		var left = d3.min(data, function(d) { return d.x; });
		var up = d3.min(data, function(d) { return d.y; });
		var right = d3.max(data, function(d) { return d.x + d.width; });
		var down = d3.max(data, function(d) { return d.y + d.height; });

		this.bbox[0][0] = (left || 0) - padding;
		this.bbox[1][0] = (right || 0) + padding;
		this.bbox[0][1] = (up || 0) - padding;
		this.bbox[1][1] = (down || 0) + padding;
	}
	else {
		console.log(node.x, node.y, node.width, node.height, padding);
		this.bbox[0][0] = Math.min(this.bbox[0][0], node.x - padding);
		this.bbox[0][1] = Math.min(this.bbox[0][1], node.y - padding);
		this.bbox[1][0] = Math.max(
			this.bbox[1][0],
			node.x + node.width + padding
		);
		this.bbox[1][1] = Math.max(
			this.bbox[1][1],
			node.y + node.height + padding
		);
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
ge.GraphEditor.prototype.updateExtent = function updateExtent() {
	var bbox = this.svg.node().getBoundingClientRect();
	var extent = [
		[ 0, 0 ],
		[ bbox.width, bbox.height ]
	];
	this.zoom.extent(extent);
	return this;
};

/**
 * Update a link.
 * @param   {Reference}       link  Changed link.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.updateLink = function updateLink(link) {
	var self = this;
	var transition = function(selection) {
		return self.transition(selection, 'drag', 'update-link');
	};
	link = self.getElement(link);
	var def = d3.select('#' + link.datum().defId);
	ge.Link.updateSelection(link, def, self.options.link, transition);
	return this;
};


/**
 * Update a node. If it was moved or resized, update its links.
 * @param   {Reference}       node  Changed node.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.updateNode = function updateNode(node) {
	var self = this;

	node = this.getElement(node);

	var d = node.datum();
	var prevTransform = node.attr('transform');
	var nextTransform = 'translate('.concat(d.x, ',', d.y, ')');
	var prevWidth = d.width;
	var prevHeight = d.height;

	var transition = function(selection) {
		return self.transition(selection, 'drag', 'update-node');
	};

	ge.Node.updateSelection(node, transition, this.textSize);

	if(nextTransform !== prevTransform
	   || d.width !== prevWidth
	   || d.height !== prevHeight) {
		node = d;

		var updateLink = function(d) {
			return d.source === node || d.target === node;
		};

		var defs = this.defs.filter(updateLink);
		var links = this.links.filter(updateLink);

		ge.Link.updateSelection(links, defs, self.options.link, transition);

		/*transition(defs)
			.attr('d', function() { return d.shape.path(d); });

		transition(links.select('path'))
			.attr('d', function(d) { return d.path; });

		var offset = opt.link.text.offset;
		var anchor = opt.link.text.anchor;

		transition(links.select('textPath'))
			.attr('startOffset', function(d) { return offset[d.flip]; })
			.attr('text-anchor', function(d) { return anchor[d.flip]; });*/

		this.updateBBox(node);
	}

	return this;
};

/*ge.GraphEditor.prototype.updateSize = function updateSize(nodes, links) {
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
ge.GraphEditor.prototype.update = function update(simulation) {
	var self = this;
	var opt = this.options;
	var ttype = simulation ? 'simulation' : 'drag';

	var transition = function(selection) {
		return self.transition(selection, ttype, 'update');
	};

	this.nodes = this.nodes.data(this.data.nodes, ge.id);
	this.nodes.exit().remove();
	var newNodes = this.nodes.enter()
		.append('g')
		.classed(opt.css.node, true);
	ge.Node.initSelection(newNodes);
	this.nodes = newNodes.merge(this.nodes);
	ge.Node.updateSelection(this.nodes, transition, this.textSize);
	this.nodeEvents(newNodes);

	this.defs = this.defs.data(this.data.links, ge.id);
	this.defs.exit().remove();
	var newDefs = this.defs.enter().append('path');

	this.links = this.links.data(this.data.links, ge.id);
	this.links.exit().remove();
	var newLinks = this.links.enter()
		.append('g')
		.classed(opt.css.link, true);

	ge.Link.initSelection(newLinks, newDefs, opt.link);
	this.links = this.links.merge(newLinks);
	this.defs = this.defs.merge(newDefs);
	ge.Link.updateSelection(this.links, this.defs, opt.link, transition);
	this.linkEvents(newLinks);

	//this.updateSize(newNodes, newLinks);
	this.updateBBox();

	if(!simulation) {
		this.updateSimulation();
		this.selectNode(this.state.selectedNode, true);
	}

	return this;
};
