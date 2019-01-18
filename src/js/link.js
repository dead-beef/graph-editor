/**
 * Graph link constructor.
 * @class
 * @classdesc Graph link class.
 * @param {ge.GraphEditor}  graph  Link container.
 * @param {ImportLinkData}  data   Link data.
 */
ge.Link = function Link(graph, data) {
	/**
	 * Source node.
	 * @member {ge.Node}
	 */
	this.source = graph.getData(data.source);
	if(!this.source) {
		throw new Error('invalid link source');
	}
	/**
	 * Target node.
	 * @member {ge.Node}
	 */
	this.target = graph.getData(data.target);
	if(!this.target) {
		throw new Error('invalid link target');
	}
	/**
	 * ID.
	 * @readonly
	 * @member {ID}
	 */
	this.id = /*data.id || */graph.linkId(this.source, this.target);
	/**
	 * Path generator.
	 * @member {ge.path.Path}
	 */
	this.shape = data.shape
		? ge.path.fromJson(data.shape)
		: graph.options.link.shape;
	/**
	 * Title.
	 * @member {string}
	 */
	this.title = data.title === undefined ? this.id : data.title;
	/**
	 * User data.
	 * @member {*}
	 */
	this.data = data.data;
	/**
	 * SVG path.
	 * @readonly
	 * @member {string}
	 */
	this.path = '';
	/**
	 * True if text path is reversed.
	 * @readonly
	 * @member {boolean}
	 */
	this.reversed = false;
	/**
	 * SVG element ID.
	 * @readonly
	 * @member {string}
	 */
	this.elementId = graph.options.id.concat('l', this.id);
	/**
	 * SVG element selector.
	 * @readonly
	 * @member {string}
	 */
	this.selector = '#' + this.elementId;
	/**
	 * SVG <path> element ID.
	 * @readonly
	 * @member {string}
	 */
	this.pathId = graph.options.id.concat('p', this.id);
	/**
	 * SVG <path> element selector.
	 * @readonly
	 * @member {Selector}
	 */
	this.pathSelector = '#' + this.pathId;
	/**
	 * SVG text path element ID.
	 * @readonly
	 * @member {string}
	 */
	this.defId = graph.options.id.concat('d', this.id);
	/**
	 * SVG text path element selector.
	 * @readonly
	 * @member {Selector}
	 */
	this.defSelector = '#' + this.defId;

	return this;
};

/**
 * Initialize SVG elements.
 * @static
 * @param {D3Selection} links          SVG element enter selection.
 * @param {D3Selection} defs           SVG element enter selection.
 * @param {object}      opts           Link options.
 * @param {number}      opts.text.dx   Link title X offset.
 * @param {number}      opts.text.dy   Link title Y offset.
 * @param {string}      cls            CSS class.
 */
ge.Link.initSelection = function initSelection(links, defs, opts) {
	defs.attr('id', function(d) { return d.defId; });

	links.attr('id', function(d) { return d.pathId; });
	links.append('path');
	links.append('text')
		.attr('dx', opts.text.dx)
		.attr('dy', opts.text.dy)
		.append('textPath')
		.attr('xlink:href', function(d) { return d.defSelector; });
};

/**
 * Update SVG elements.
 * @static
 * @param {D3Selection} links       SVG element selection.
 * @param {D3Selection} defs        SVG element selection.
 * @param {object}      opts        Link options.
 * @param {function}    transition  Transition generator.
 * @see ge.GraphEditor.updateLink
 */
ge.Link.updateSelection = function updateSelection(
	links, defs,
	opts, transition
) {
	transition(defs)
		.attr('d', function(d) { return d.shape.path(d); });

	transition(links.select('path'))
		.style('stroke-width', function(d) { return d.size + 'px'; })
		.attr('d', function(d) { return d.path; });

	var offset = opts.text.offset;
	var anchor = opts.text.anchor;

	transition(links.select('textPath'))
		.text(function(d) { return d.title; })
		.attr('startOffset', function(d) { return offset[+d.reversed]; })
		.attr('text-anchor', function(d) { return anchor[+d.reversed]; });
};

/**
 * Initialize SVG elements.
 * @param {D3Selection} links  SVG element enter selection.
 * @see ge.GraphEditor.update
 * @see ge.GraphEditor.linkEvents
 */
ge.Link.prototype.initSelection = ge.Link.initSelection;

/**
 * Update SVG elements.
 * @param {D3Selection} links  SVG element selection.
 * @see ge.GraphEditor.updateLink
 */
ge.Link.prototype.updateSelection = ge.Link.updateSelection;

/**
 * Update link data.
 */
ge.Link.prototype.update = function update() {
	this.shape(this);
};

/**
 * Convert to JSON.
 * @param   {ge.GraphEditor} graph      Graph.
 * @returns {ExportLinkData}            JSON data.
 */
ge.Link.prototype.toJson = function toJson(graph) {
	return {
		id: this.id,
		source: this.source.id,
		target: this.target.id,
		size: this.size,
		title: this.title,
		data: this.data,
		shape: this.shape === graph.options.link.shape
			? null
			: ge.path.toJson(this.shape)
	};
};
