/**
 * Graph node constructor.
 * @class
 * @classdesc Graph node class.
 * @param {ge.GraphEditor}  graph
 * @param {ImportNodeData}  data
 * @see ge.GraphEditor.initNode
 */
ge.Node = function Node(graph, data) {
	/**
	 * ID.
	 * @readonly
	 * @member {ID}
	 */
	this.id = data.id || graph.newNodeId();
	/**
	 * X coordinate.
	 * @member {number}
	 */
	this.x = +data.x;
	/**
	 * Y coordinate.
	 * @member {number}
	 */
	this.y = +data.y;
	/**
	 * Width.
	 * @member {number}
	 */
	this.width = +data.width;
	/**
	 * Height.
	 * @member {number}
	 */
	this.height = +data.height;
	/**
	 * Shape.
	 * @member {Shape}
	 */
	this.shape = data.shape || graph.options.node.shape;
	if(typeof this.shape === 'string') {
		this.shape = ge.shape[this.shape];
	}
	/**
	 * Title.
	 * @member {string}
	 */
	this.title = data.title === undefined ? this.id : data.title;
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
	 * Text width.
	 * @readonly
	 * @member {?number}
	 */
	this.textWidth = null;
	/**
	 * Text height.
	 * @readonly
	 * @member {?number}
	 */
	this.textHeight = null;
	/**
	 * True if node title is inside node shape.
	 * @readonly
	 * @member {ge.GraphEditor}
	 */
	this.textInside = graph.options.text.inside;
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
	this.elementId = graph.id.concat('n', this.id);
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
 * @see ge.GraphEditor.update
 * @see ge.GraphEditor.nodeEvents
 */
ge.Node.prototype.initSelection = ge.Node.initSelection = function initSelection(nodes) {
	// ...
};

/**
 * Update SVG elements.
 * @static
 * @param {D3Selection} nodes  SVG element selection.
 * @see ge.GraphEditor.updateNode
 */
ge.Node.prototype.updateSelection = ge.Node.updateSelection = function updateSelection(nodes) {
	// ...
};

/**
 * Update node data.
 * @returns {boolean}  True if node position changed.
 */
ge.Node.prototype.update = function update() {
	var moved = false;

	if(this.textInside && this.title !== this.prevTitle) {
		this.shape.fitTextInside(this);
		this.prevTitle = this.title;
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
 * @param {number} [ox=0]
 * @param {number} [oy=0]
 * @returns {ExportNodeData}  JSON data.
 */
ge.Node.prototype.toJson = function toJson(ox, oy) {
	return {
		id: this.id,
		x: this.x - ox,
		y: this.y - oy,
		width: this.width,
		height: this.height,
		shape: this.shape.name,
		title: this.title,
		data: this.data
	};
};
