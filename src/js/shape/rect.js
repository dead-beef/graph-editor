/**
 * Rectangle.
 * @class
 * @param {?object} [data]           JSON data.
 * @param {?number} [data.aspect=1]  Aspect ratio.
 */
ge.shape.Rect = function Rect(data) {
	data = data || {};
	ge.shape.Shape.call(this, data);
	/**
	 * Aspect ratio.
	 * @member {number}
	 */
	this.aspect = data.aspect || 1;
};

ge.shape.Rect.prototype = Object.create(ge.shape.Shape.prototype);
Object.defineProperty(
	ge.shape.Rect.prototype,
	'constructor',
	{ 
		value: ge.shape.Rect,
		enumerable: false,
		writable: true
	}
);
ge.shape.addClass(ge.shape.Rect);

/**
 * Convert to JSON.
 * @abstract
 * @returns {object}  JSON data.
 */
ge.shape.Rect.prototype.toJson = function toJson() {
	return {
		aspect: this.aspect
	};
};

/**
 * Return SVG path.
 * @param   {ge.Node}   node   Node data.
 * @returns {string}           SVG path.
 */
ge.shape.Rect.prototype.path = function path(node) {
	var w = node.width, h = node.height;
	return 'M'.concat(
		(-w / 2), ',', (-h / 2),
		'l', w, ',0l0,', h, 'l', -w, ',0z'
	);
};

/**
 * Return point at angle.
 * @abstract
 * @param   {ge.Node}   node   Node data.
 * @param   {ge.Angle}  angle  Angle.
 * @returns {ge.Point}
 */
ge.shape.Rect.prototype.getPoint = function getPoint(node, angle) {
	var w = node.width / 2;
	var h = node.height / 2;

	var x, y, t;
	var ret = new ge.Point(node.x, node.y);

	x = null;
	if(angle.cos > 1e-8) {
		x = w;
	}
	else if(angle.cos < -1e-8) {
		x = -w;
	}
	if(x !== null) {
		t = x / angle.cos;
		y = t * angle.sin;
		if(y < h + 1e-8 && y > -h - 1e-8) {
			ret.x += x;
			ret.y += y;
			return ret;
		}
	}

	y = null;
	if(angle.sin > 1e-8) {
		y = h;
	}
	else if(angle.sin < -1e-8) {
		y = -h;
	}
	if(y !== null) {
		t = y / angle.sin;
		x = t * angle.cos;
		if(x < w + 1e-8 && x > -w - 1e-8) {
			ret.x += x;
			ret.y += y;
			return ret;
		}
	}

	// throw new Error()
	return ret;
};

/**
 * Resize a node to fit its title inside.
 * @abstract
 * @param {ge.Node}            node       Node data.
 * @param {ge.ContainerSize}   size       Text container size.
 * @param {ge.TextSize}        textSize   Text size calculator.
 */
ge.shape.Rect.prototype.doFitTitleInside = function doFitTitleInside(
	node,
	size/*,
	textSize*/
) {
	node.width = Math.max(
		Math.ceil(this.aspect * Math.sqrt(size.minArea)),
		size.minWidth
	);
	node.height = Math.max(size.minHeight, node.width / this.aspect);
	node.textWidth = node.width;
	node.textHeight = node.height;
};
