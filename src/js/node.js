/**
 * Graph node constructor.
 * @class
 * @classdesc Graph node class.
 * @param {ge.GraphEditor} graph  Graph
 * @param {ImportNodeData} data   Node JSON data
 * @see ge.GraphEditor.initNode
 */
ge.Node = function Node(graph, data) {
	var opts = graph.options.node;
	/**
	 * ID.
	 * @readonly
	 * @member {ID}
	 */
	this.id = data.id || graph.nodeId();
	/**
	 * X coordinate.
	 * @member {number}
	 */
	this.x = +data.x || 0;
	/**
	 * Y coordinate.
	 * @member {number}
	 */
	this.y = +data.y || 0;
	/**
	 * Width.
	 * @member {number}
	 */
	this.width = Math.max(+data.width || opts.size.def, opts.size.min);
	/**
	 * Height.
	 * @member {number}
	 */
	this.height = Math.max(+data.height || opts.size.def, opts.size.min);
	/**
	 * Shape.
	 * @member {Shape}
	 */
	this.shape = data.shape
		? ge.shape.fromJson(data.shape)
		: opts.shape;
	/**
	 * Title.
	 * @member {string}
	 */
	this.title = data.title == null ? this.id.toString() : data.title;
	/**
	 * Text X offset.
	 * @readonly
	 * @member {?number}
	 */
	this.textX = null;
	/**
	 * Text Y offset.
	 * @readonly
	 * @member {?number}
	 */
	this.textY = null;
	/**
	 * Text container width.
	 * @readonly
	 * @member {?number}
	 */
	this.textWidth = null;
	/**
	 * Text container height.
	 * @readonly
	 * @member {?number}
	 */
	this.textHeight = null;
	/**
	 * True if node title is inside its shape.
	 * @readonly
	 * @member {ge.GraphEditor}
	 */
	this.textInside = opts.text.inside;
	/**
	 * Text size calculator.
	 * @readonly
	 * @member {ge.TextSize}
	 */
	this.textSize = graph.textSize;
	/**
	 * User data.
	 * @member {*}
	 */
	this.data = data.data;
	/**
	 * SVG element ID.
	 * @readonly
	 * @member {string}
	 */
	this.elementId = graph.options.id.concat('n', this.id);
	/**
	 * SVG element selector.
	 * @readonly
	 * @member {Selector}
	 */
	this.selector = '#' + this.elementId;
	/**
	 * SVG group transform.
	 * @readonly
	 * @member {?string}
	 */
	this.transform = null;
	/**
	 * Previous title.
	 * @private
	 * @member {?string}
	 */
	this.prevTitle = null;

	return this;
};

/**
 * Initialize SVG elements.
 * @static
 * @param {D3Selection} nodes  SVG element enter selection.
 * @param {string}      cls    CSS class.
 */
ge.Node.initSelection = function initSelection(nodes) {
	nodes.attr('id', function(d) { return d.elementId; });
	nodes.append('path');
	nodes.append('foreignObject')
		.append('xhtml:div')
		.append('xhtml:span');
};

/**
 * Update SVG elements.
 * @static
 * @param {D3Selection} nodes               SVG element selection.
 * @param {function}    transition          Transition generator.
 * @param {ge.TextSize} textSize            Text size calculator.
 */
ge.Node.updateSelection = function updateSelection(
	nodes,
	transition,
	textSize
) {
	console.log(nodes);
	transition(nodes)
		.attr(
			'transform',
			function(d) {
				return 'translate('.concat(d.x, ',', d.y, ')');
			}
		);

	nodes.each(function(d) {
		//if(d.textInside) {
		d.shape.fitTitleInside(d, textSize);
		//}
		/*else {
			d.shape.fitTitleOutside(d, textSize);
		}*/
	});

	transition(nodes.select('foreignObject'))
		.attr('x', function(d) { return -d.textWidth / 2; })
		.attr('y', function(d) { return -d.textHeight / 2; })
		.attr('width', function(d) { return d.textWidth; })
		.attr('height', function(d) { return d.textHeight; })
		.select('span')
		.text(function(d) { return d.title; });

	transition(nodes.select('path'))
		.attr('d', function(d) { return d.shape.path(d); });
};

/**
 * Initialize SVG elements.
 * @param {D3Selection} nodes  SVG element enter selection.
 */
ge.Node.prototype.initSelection = ge.Node.initSelection;

/**
 * Update SVG elements.
 * @param {D3Selection} nodes       SVG element selection.
 * @param {function}    transition  Transition generator.
 */
ge.Node.prototype.updateSelection = ge.Node.updateSelection;

/**
 * Update node data.
 * @returns {boolean}  True if node position changed.
 */
ge.Node.prototype.update = function update() {
	var moved = false;

	if(this.textInside) {
		this.shape.fitTextInside(this);
	}

	var transform = 'translate('.concat(this.x, ',', this.y, ')');
	if(transform !== this.transform) {
		this.transform = transform;
		moved = true;
	}

	return moved;
};

/**
 * Convert to JSON.
 * @param   {ge.GraphEditor} graph      Graph.
 * @param   {number}         [ox=0]     Origin X coordinate.
 * @param   {number}         [oy=0]     Origin Y coordinate.
 * @returns {ExportNodeData}            JSON data.
 */
ge.Node.prototype.toJson = function toJson(graph, ox, oy) {
	return {
		id: this.id,
		x: this.x - ox,
		y: this.y - oy,
		width: this.width,
		height: this.height,
		shape: this.shape === graph.options.node.shape
			? null
			: ge.shape.toJson(this.shape),
		title: this.title,
		data: this.data
	};
};
