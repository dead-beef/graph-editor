/**
 * Graph link constructor.
 * @class
 * @classdesc Graph link class.
 * @param {ge.GraphEditor}  graph  Link container.
 * @param {ImportLinkData}  data   Link data.
 */
ge.Link = function(graph, data) {
	/**
	 * ID.
	 * @readonly
	 * @member {ID}
	 */
	this.id = data.id || graph.newLinkId();
	/**
	 * Source node.
	 * @member {ge.Node}
	 */
	this.source = data.source;
	/**
	 * Target node.
	 * @member {ge.Node}
	 */
	this.target = data.target;
	/**
	 * Path generator.
	 * @member {ge.Path}
	 */
	this.shape = graph.options.link.path;
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
	 * True if SVG path is reversed.
	 * @readonly
	 * @member {boolean}
	 */
	this.reversed = false;
	/**
	 * SVG element ID.
	 * @readonly
	 * @member {string}
	 */
	this.elementId = graph.id.concat('l', this.id);
	/**
	 * SVG element ID.
	 * @readonly
	 * @member {string}
	 */
	this.selector = '#' + this.elementId;
	/**
	 * SVG <path> element ID.
	 * @readonly
	 * @member {string}
	 */
	this.pathId = graph.id.concat('p', this.id);
	/**
	 * SVG element selector.
	 * @readonly
	 * @member {Selector}
	 */
	this.pathSelector = '#' + this.pathId;

	return this;
};

/**
 * Initialize SVG elements.
 * @static
 * @param {D3Selection} links  SVG element enter selection.
 * @see ge.GraphEditor.update
 * @see ge.GraphEditor.linkEvents
 */
ge.Link.prototype.initSelection = ge.Link.initSelection = function(links) {
	// ...
};

/**
 * Update SVG elements.
 * @static
 * @param {D3Selection} links  SVG element selection.
 * @see ge.GraphEditor.updateLink
 */
ge.Link.prototype.updateSelection = ge.Link.updateSelection = function(links) {
	// ...
};

/**
 * Update link data.
 */
ge.Link.prototype.update = function() {
	this.shape(this);
};

/**
 * Convert to JSON.
 * @returns {ExportLinkData}  JSON data.
 */
ge.Link.prototype.toJson = function() {
	return {
		id: this.id,
		source: this.source.id,
		target: this.target.id,
		size: this.size,
		title: this.title,
		data: this.data
	};
};
