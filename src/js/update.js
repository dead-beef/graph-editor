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

/**
 * Resize node to fit text inside.
 * @private
 * @param   {Node}     node
 * @returns {boolean}        False if node text did not change.
 */
ge.GraphEditor.prototype.getNodeSize = function getNodeSize(node) {
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
 * Update link element.
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
ge.GraphEditor.prototype.updateNode = function updateNode(node) {
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
