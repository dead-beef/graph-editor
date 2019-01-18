'use strict';

(function(root, factory) {
	if(typeof define === 'function' && define.amd) {
		define(['d3'], factory);
	}
	else if(typeof module === 'object' && module.exports) {
		module.exports = factory(require('d3'));
	}
	else {
		root.ge = factory(root.d3);
	}
})(this, function(d3) {
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
		.initSvg(svg)
		.initData(data)
		.initState();

	/**
	 * @readonly
	 * @member {D3Dispatch}
	 */
	this.dispatch = d3.dispatch(
		'node-click', 'link-click',
		'new-link-start', 'new-link-end', 'new-link-cancel',
		'click',
		'simulation-start', 'simulation-stop'
	);

	/**
	 * Graph bounding box.
	 * @readonly
	 * @member {BBox}
	 */
	this.bbox = [[0, 0], [0, 0]];
	/**
	 * Graph zoom behavior.
	 * @readonly
	 * @member {D3Zoom}
	 */
	this.zoom = this.zoomEvents(d3.zoom())
		.scaleExtent([this.options.scale.min, this.options.scale.max]);
	/**
	 * Node drag behavior.
	 * @readonly
	 * @member {D3Drag}
	 */
	this.drag = this.dragEvents(d3.drag());
	this.svg.call(this.zoom);

	/**
	 * Window resize event handler.
	 * @readonly
	 * @member {function}
	 */
	this.onresize = ge.bind(this, this.resized);
	window.addEventListener('resize', this.onresize);

	this.updateBBox();

	setTimeout(ge.bind(this, function() {
		this.update()
			.resized()
			.simulation(this.options.simulation.start);
	}), 10);

	return this;
};

/* eslint-enable no-unused-vars */
'use strict';

/**
 * Point constructor.
 * @class
 * @classdesc Point class.
 * @param {?number}  x  X coordinate.
 * @param {?number}  y  Y coordinate.
 */
ge.Point = function Point(x, y) {
	/**
	 * X coordinate.
	 * @member {number}
	 */
	this.x = +x || 0;
	/**
	 * Y coordinate.
	 * @member {number}
	 */
	this.y = +y || 0;
};

/**
 * Bounding box constructor.
 * @class
 * @classdesc Bounding box class.
 * @param {?number}  left   Left X coordinate.
 * @param {?number}  top    Top Y coordinate.
 * @param {?number}  right  Right X coordinate.
 * @param {?number}  bottom Bottom Y coordinate.
 */
ge.BBox = function BBox(left, top, right, bottom) {
	/**
	 * Left X coordinate.
	 * @member {number}
	 */
	this.left = +left || 0;
	/**
	 * Top Y coordinate.
	 * @member {number}
	 */
	this.top = +top || 0;
	/**
	 * Right X coordinate.
	 * @member {number}
	 */
	this.right = +right || 0;
	/**
	 * Bottom Y coordinate.
	 * @member {number}
	 */
	this.bottom = +bottom || 0;
};

/**
 * Angle constructor.
 * @class
 * @classdesc Angle class.
 * @param {?number}   value   Angle value.
 * @param {?boolean}  rad     true if value is in radians, false if in degrees.
 */
ge.Angle = function Angle(value, rad) {
	/**
	 * Angle in degrees.
	 * @member {number}
	 */
	this.deg = 0;
	/**
	 * Angle in radians.
	 * @member {number}
	 */
	this.rad = 0;

	if(rad) {
		this.rad = +value || 0;
		this.deg = this.rad * 180.0 / Math.PI;
	}
	else {
		this.deg = +value || 0;
		this.rad = this.deg * Math.PI / 180.0;
	}

	/**
	 * Sine.
	 * @member {number}
	 */
	this.sin = Math.sin(this.rad);
	/**
	 * Cosine.
	 * @member {number}
	 */
	this.cos = Math.cos(this.rad);
};

/**
 * Container size constructor.
 * @class
 * @classdesc Point class.
 * @param {?number}  [minWidth=1]                   Minimum width.
 * @param {?number}  [minHeight=1]                  Minimum height.
 * @param {?number}  [minArea=minWidth*minHeight]   Minimum area.
 */
ge.ContainerSize = function ContainerSize(minWidth, minHeight, minArea) {
	/**
	 * Minimum width.
	 * @member {number}
	 */
	this.minWidth = +minWidth || 1;
	/**
	 * Minimum height.
	 * @member {number}
	 */
	this.minHeight = +minHeight || 1;
	/**
	 * Minimum area.
	 * @member {number}
	 */
	this.minArea = +minArea || this.minWidth * this.minHeight;
};


/**
 * Class for saving/loading JSON.
 * @class
 * @param {?number}  x  X coordinate.
 * @param {?number}  y  Y coordinate.
 */
ge.SaveLoad = function SaveLoad() {
	/**
	 * Class constructors by name.
	 * @member {object}
	 */
	this.classes = {};
};

/**
 * Add a class.
 * @param {function} constructor              Class constructor.
 * @param {string}   [name=constructor.name]  Class name.
 * @param {boolean}  [overwrite=false]        Overwrite if class exists.
 */
ge.SaveLoad.prototype.addClass = function addClass(
	constructor,
	name,
	overwrite
) {
	name = name || constructor.name;
	if(this.classes[name] && !overwrite) {
		throw new Error('class "' + name +'" exists');
	}
	this.classes[name] = constructor;
};

/**
 * Get class by name.
 * @param   {string}   name  Class name.
 * @returns {function}       Class constructor.
 */
ge.SaveLoad.prototype.getClass = function getClass(name) {
	var ret = this.classes[name];
	if(!ret) {
		throw new Error('class "' + name +'" not found');
	}
	return ret;
};

/**
 * Load from JSON.
 * @param   {object}  data     JSON data.
 * @returns {object}
 */
ge.SaveLoad.prototype.fromJson = function fromJson(data) {
	var cls = this.getClass(data['class']);
	return new cls(data);
};

/**
 * Save to JSON.
 * @param   {object}  obj                          Object to save.
 * @param   {string}  [name=obj.constructor.name]  Class name.
 * @returns {object}
 */
ge.SaveLoad.prototype.toJson = function toJson(obj, name) {
	var ret = obj.toJson();
	ret['class'] = name || obj.constructor.name;
	return ret;
};


/**
 * Get object ID.
 * @param {?(Object|undefined)} obj
 * @returns {?ID}
 */
ge.id = function id(obj) {
	return obj && obj.id || null;
};

/**
 * @param {Object} _this
 * @param {function} func
 * @returns {function}
 */
ge.bind = function bind(_this, func) {
	return function bound() {
		return func.apply(_this, arguments);
	};
};

/**
 * Compare numbers or arrays of numbers.
 * @param {(number|Array<number>)} u
 * @param {(number|Array<number>)} v
 * @param {number}                 [eps=1e-5] Precision.
 * @returns {boolean}
 */
ge.equal = function equal(u, v, eps) {
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
 * Default simulation update function.
 * @param   {?D3Simulation} simulation  Old simulation object.
 * @param   {Array<ge.Node>}   nodes    Graph nodes.
 * @param   {Array<ge.Link>}   links    Graph links.
 * @this    ge.GraphEditor
 * @returns {D3Simulation}              New/updated simulation object.
 */
ge.defaultSimulation = function defaultSimulation(simulation, nodes, links) {
	if(!simulation) {
		simulation = d3.forceSimulation()
			.force('charge', d3.forceManyBody())
			.force('link', d3.forceLink())
			.force('center', d3.forceCenter());
	}

	var dist = 10 * d3.max(nodes, function(d) {
		return Math.max(d.width, d.height);
	});

	var cx = d3.mean(nodes, function(d) { return d.x; });
	var cy = d3.mean(nodes, function(d) { return d.y; });

	simulation.nodes(nodes);
	simulation.force('center').x(cx).y(cy);
	simulation.force('link').links(links).distance(dist);

	return simulation;
};

/**
 * Extend an object.
 * @param   {object}  dst  Object to extend.
 * @param   {object}  src  Source object.
 * @returns {object}       Extended object.
 */
ge._extend = function _extend(dst, src) {
	if(!src) {
		return dst;
	}
	if(typeof src !== 'object') {
		throw new Error('src is not an object: ' + src.toString());
	}

	if(!dst) {
		dst = {};
	}
	else if(typeof dst !== 'object') {
		throw new Error('dst is not an object: ' + dst.toString());
	}

	for(var key in src) {
		var value = src[key];
		if(typeof value === 'object' && value !== null) {
			if(Array.isArray(value)) {
				dst[key] = value.slice();
			}
			else {
				var dstValue = dst[key];
				if(!dstValue
				   || typeof dstValue !== 'object'
				   || Array.isArray(dstValue)) {
					dst[key] = dstValue = {};
				}
				ge._extend(dstValue, value);
			}
		}
		else {
			dst[key] = value;
		}
	}
	return dst;
};

/**
 * Extend an object.
 * @param   {object}     dst  Object to extend.
 * @param   {...object}  src  Source objects.
 * @returns {object}          Extended object.
 */
ge.extend = function extend(dst, src) { // eslint-disable-line no-unused-vars
	for(var i = 1; i < arguments.length; ++i) {
		dst = ge._extend(dst, arguments[i]);
	}
	return dst;
};

/*ge.debounceD3 = function debounceD3(func, delay) {
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
/**
 * Link shapes.
 * @namespace
 */
ge.path = new ge.SaveLoad();

/**
 * Abstract base path class.
 * @class
 * @abstract
 * @param {?object} [data]                JSON data.
 * @param {?number} [data.loopStart=180]  Loop start angle in degrees.
 * @param {?number} [data.loopEnd=270]    Loop end angle in degrees.
 */
ge.path.Path = function Path(data) { // eslint-disable-line no-unused-vars
	if(this.constructor === Path) {
		throw new Error('abstract class');
	}
	data = data || {};
	this.loopStart = new ge.Angle(+data.loopStart || 180);
	this.loopEnd = new ge.Angle(+data.loopEnd || 270);
};

/* eslint-disable no-unused-vars */

/**
 * Return text path and set link path.
 * @abstract
 * @param   {ge.Link}   link   Link data.
 * @returns {string}           SVG path.
 */
ge.path.Path.prototype.path = function path(link) {
	throw new Error('abstract method');
};

/* eslint-enable no-unused-vars */

/**
 * Convert to JSON.
 * @returns {object}  JSON data.
 */
ge.path.Path.prototype.toJson = function toJson() {
	return {
		loopStart: this.loopStart.deg,
		loopEnd: this.loopEnd.deg
	};
};
/**
 * Line.
 * @class
 * @param {?object} [data]                JSON data.
 * @param {?number} [data.loopStart=180]  Loop start angle in degrees.
 * @param {?number} [data.loopEnd=270]    Loop end angle in degrees.
 */
ge.path.Line = function Line(data) {
	ge.path.Path.call(this, data);
};

ge.path.Line.prototype = Object.create(ge.path.Line);
Object.defineProperty(
	ge.path.Line.prototype,
	'constructor',
	{ 
		value: ge.path.Line,
		enumerable: false,
		writable: true
	}
);
ge.path.addClass(ge.path.Line);

/**
 * Return text path and set link path.
 * @param   {ge.Link}   link   Link data.
 * @returns {string}           SVG path.
 */
ge.path.Line.prototype.path = function path(link) {
	var src, dst;

	if(link.source === link.target) {
		src = link.source.shape.getPoint(link.source, this.loopStart);
		dst = link.source.shape.getPoint(link.source, this.loopEnd);
		var rx = link.source.width / 2;
		var ry = link.source.height / 2;

		link.reversed = false;
		link.path = 'M'.concat(
			src.x, ',', src.y,
			'A', rx, ',', ry, ',0,1,0,', dst.x, ',', dst.y
		);

		return link.path;
	}

	src = new ge.Point(link.source.x, link.source.y);
	dst = new ge.Point(link.target.x, link.target.y);
	var src2 = link.source.shape.intersect(link.source, link.target);
	var dst2 = link.target.shape.intersect(link.target, link.source);
	src = src2 || src;
	dst = dst2 || dst;

	link.path = 'M'.concat(src.x, ',', src.y, 'L', dst.x, ',', dst.y);

	if((link.reversed = src.x > dst.x)) {
		src2 = src;
		src = dst;
		dst = src2;
	}

	return 'M'.concat(src.x, ',', src.y, 'L', dst.x, ',', dst.y);
};
/**
 * Node shapes.
 * @namespace
 */

ge.shape = new ge.SaveLoad();

/**
 * Abstract base shape class.
 * @class
 * @abstract
 * @param {?object} [data]           JSON data.
 */
ge.shape.Shape = function Shape(data) { // eslint-disable-line no-unused-vars
	if(this.constructor === Shape) {
		throw new Error('abstract class');
	}
};

/* eslint-disable no-unused-vars */

/**
 * Return SVG path.
 * @abstract
 * @param   {ge.Node}   node   Node data.
 * @returns {string}           SVG path.
 */
ge.shape.Shape.prototype.path = function path(node) {
	throw new Error('abstract method');
};

/**
 * Return point at angle.
 * @abstract
 * @param   {ge.Node}   node   Node data.
 * @param   {ge.Angle}  angle  Angle.
 * @returns {ge.Point}
 */
ge.shape.Shape.prototype.getPoint = function getPoint(node, angle) {
	throw new Error('abstract method');
};

/**
 * Resize a node to fit its title inside.
 * @abstract
 * @param {ge.Node}            node       Node data.
 * @param {ge.ContainerSize}   size       Text container size.
 * @param {ge.TextSize}        textSize   Text size calculator.
 */
ge.shape.Shape.prototype.doFitTitleInside = function doFitTitleInside(
	node,
	size,
	textSize
) {
	throw new Error('abstract method');
};


/* eslint-enable no-unused-vars */

/**
 * Convert to JSON.
 * @returns {object}  JSON data.
 */
ge.shape.Shape.prototype.toJson = function toJson() {
	return {};
};

/**
 * Intersect with a link.
 * @param   {ge.Node}   node   Node data.
 * @param   {ge.Node}   node2  Node data.
 * @returns {?ge.Point}        Intersection point.
 */
ge.shape.Shape.prototype.intersect = function intersect(node, node2) {
	var a = Math.atan2(node2.y - node.y, node2.x - node.x);
	return this.getPoint(node, new ge.Angle(a, true));
};

/**
 * Resize a node to fit its title inside if necessary.
 * @param {ge.Node}     node       Node data.
 * @param {ge.TextSize} textSize   Text size calculator.
 */
ge.shape.Shape.prototype.fitTitleInside = function fitTitleInside(
	node,
	textSize
) {
	if(node.title === node.prevTitle) {
		return;
	}
	var size = textSize.containerSize(node.title);
	this.doFitTitleInside(node, size, textSize);
	node.prevTitle = node.title;
};
/**
 * Circle.
 * @class
 * @param {?object} [data]           JSON data.
 */
ge.shape.Circle = function Circle(data) {
	ge.shape.Shape.call(this, data);
};

ge.shape.Circle.prototype = Object.create(ge.shape.Shape.prototype);
Object.defineProperty(
	ge.shape.Circle.prototype,
	'constructor',
	{ 
		value: ge.shape.Circle,
		enumerable: false,
		writable: true
	}
);
ge.shape.addClass(ge.shape.Circle);

/**
 * Return SVG path.
 * @param   {ge.Node}   node   Node data.
 * @returns {string}           SVG path.
 */
ge.shape.Circle.prototype.path = function path(node) {
	var dx = node.width, rx = dx / 2, ry = node.height / 2;
	var arc = 'a'.concat(rx, ',', ry, ',0,1,0,');
	return 'M'.concat(-rx, ',0', arc, dx, ',0', arc, -dx, ',0');
};

/**
 * Return point at angle.
 * @abstract
 * @param   {ge.Node}   node   Node data.
 * @param   {ge.Angle}  angle  Angle.
 * @returns {ge.Point}
 */
ge.shape.Circle.prototype.getPoint = function getPoint(node, angle) {
	return new ge.Point(
		node.x + node.width * angle.cos * 0.5,
		node.y + node.height * angle.sin * 0.5
	);
};

/**
 * Resize a node to fit its title inside.
 * @abstract
 * @param {ge.Node}            node       Node data.
 * @param {ge.ContainerSize}   size       Text container size.
 * @param {ge.TextSize}        textSize   Text size calculator.
 */
ge.shape.Circle.prototype.doFitTitleInside = function doFitTitleInside(
	node,
	size/*,
	textSize*/
) {
	node.width = node.height = Math.max(
		Math.ceil(Math.sqrt(size.minArea * 2)),
		size.minWidth,
		size.minHeight
	);
	node.textWidth = node.textHeight = Math.ceil(node.width / 1.414213);
};
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
'use strict';

/**
 * Add an event handler.
 * @param   {string}         event
 * @param   {?function}      handler
 * @returns {ge.GraphEditor}
 * @see [d3.dispatch.on]{@link https://github.com/d3/d3-dispatch#dispatch_on}
 */
ge.GraphEditor.prototype.on = function on(event, handler) {
	this.dispatch.on(event, handler);
	return this;
};

/**
 * Get mouse or touch coordinates relative to container.
 * @private
 * @param {(HTMLElement|SVGElement)} [container=this.container.node()]
 * @returns {Point}
 * @see [d3.mouse]{@link https://github.com/d3/d3-selection/blob/master/README.md#mouse}
 * @see [d3.touch]{@link https://github.com/d3/d3-selection/blob/master/README.md#touch}
 */
ge.GraphEditor.prototype.clickPosition = function clickPosition(container) {
	container = container || this.container.node();
	return d3.touch(container) || d3.mouse(container);
};

/**
 * Get touched node.
 * @private
 * @returns {?Node}
 * @see [d3.event]{@link https://github.com/d3/d3-selection/blob/master/README.md#event}
 * @see [document.elementFromPoint]{@link https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint}
 */
ge.GraphEditor.prototype.touchedNode = function touchedNode() {
	var x = d3.event.touches[0].pageX;
	var y = d3.event.touches[0].pageY;
	var el = document.elementFromPoint(x, y);
	var nodeClass = this.options.css.node;
	while(true) {
		if(!el) {
			return null;
		}
		switch(el.tagName.toLowerCase()) {
			case 'svg':
			case 'body':
				return null;
			case 'g':
				if(el.classList.contains(nodeClass)) {
					return d3.select(el).datum();
				}
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
ge.GraphEditor.prototype.dragEvents = function dragEvents(drag) {
	var self = this;

	return drag
		.on('start', function dragStart(d) {
			self.state.dragged = false;
			self.state.dragPos = null;
			d3.select(this).raise();

			if(self.state.simulationStarted && !self.state.dragToLink) {
				d.fx = d.x;
				d.fy = d.y;
				self.simulation('restart');
			}
		})
		.on('drag', function drag(d) {
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
		.on('end', function dragEnd(d) {
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
ge.GraphEditor.prototype.zoomEvents = function zoomEvents(zoom) {
	var self = this;
	//var prevScale = 1;

	return zoom
		.duration(self.options.transition.zoom)
		.on('end', function zoomEnd() {
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
		.on('zoom', function zoom() {
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
ge.GraphEditor.prototype.linkEvents = function linkEvents(links) {
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
ge.GraphEditor.prototype.nodeEvents = function nodeEvents(nodes) {
	var self = this;

	return nodes
		/*.attr(
			'transform',
			function(d) {
				return 'translate('.concat(d.x, ',', d.y, ')');
			}
		)*/
		.on('mouseover', function mouseOver(d) {
			if(self.state.dragToLink) {
				self.state.newLinkTarget = d;
				/*d3.select(this).classed(
					self.options.css.connect,
					true
				);*/
			}
		})
		.on('mouseout', function mouseOut(/*d*/) {
			if(self.state.dragToLink) {
				self.state.newLinkTarget = null;
			}
			/*d3.select(this).classed(
				self.options.css.connect,
				false
			);*/
		})
		.on('touchmove', function touchMove() {
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
ge.GraphEditor.prototype.initMarkers = function initMarkers(svg) {
	/*var defs = d3.select('#' + this.options.css.markers).node();
	if(defs !== null) {
		return this;
	}*/

	/*defs = d3.select('head')
		.append('svg')
		.attr('id', this.options.css.markers)
		.append('svg:defs');*/

	var defs = svg.append('svg:defs');

	defs.append('marker')
		.attr('id', 'ge-dragline-end')
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
 * Initialize SVG element.
 * @private
 * @param   {D3Selection}    svg
 * @this    ge.GraphEditor
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.initSvg = function initSvg(svg) {
	svg.attr('id', this.options.id)
		.classed(this.options.css.graph, true)
		.classed(this.options.css.digraph, this.options.directed);

	this.initMarkers(svg);

	var g = svg.append('g');
	var defsContainer = svg.select('defs'); //g.append('defs');
	var linkContainer = g.append('g');
	var nodeContainer = g.append('g');

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
	this.defs = defsContainer.selectAll('.' + this.options.css.textpath);
	/**
	 * Link elements.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.links = linkContainer.selectAll('g');
	/**
	 * Node elements.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.nodes = nodeContainer.selectAll('g');
	/**
	 * 'Drag to link nodes' line.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.dragLine = g.append('path')
		.classed(this.options.css.dragline, true)
		.classed(this.options.css.hide, true)
		.attr('marker-start', 'url(#ge-dragline-start)')
		.attr('marker-end', 'url(#ge-dragline-end)')
		.attr('d', 'M0,0L0,0');
	/**
	 * Text size calculator.
	 * @readonly
	 * @member {ge.TextSize}
	 */
	this.textSize = new ge.TextSize(
		svg.append('text')
			.classed(this.options.css.node, true)
			.node()
	);

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
ge.GraphEditor.prototype.initData = function initData(data) {
	/**
	 * Nodes by ID.
	 * @readonly
	 * @member {Object<ID,Node>}
	 */
	this.nodeById = {};
	/**
	 * Links by ID.
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
ge.GraphEditor.prototype.initState = function initState() {
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
'use strict';

/**
 * Default options for all graph types.
 * @type GraphOptions
 */
ge.GraphEditor.prototype.defaults = {
	id: null,
	directed: false,

	node: {
		shape: new ge.shape.Circle(),
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
		shape: new ge.path.Line({
			loopStart: 0,
			loopEnd: 90
		}),
		size: {
			def: 2
		},
		text: {
			dx: 0,
			dy: '1.1em',
			offset: null,
			anchor: null
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
		drag: 0,
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

	css: {
		//markers: 'ge-markers',
		node: 'ge-node',
		graph: 'ge-graph',
		digraph: 'ge-digraph',
		hide: 'ge-hidden',
		dragline: 'ge-dragline',
		link: 'ge-link',
		textpath: 'ge-text-path',
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
			id: function linkId(link) {
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
			id: function linkId(link) {
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
 * @param	{GraphOptions}	  options
 * @param	{D3Selection}	  svg
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.initOptions = function initOptions(options, svg) {
	var directed;
	if(options && options.hasOwnProperty('directed')) {
		directed = options.directed;
	}
	else {
		directed = this.defaults.directed;
	}

	var typeDefaults = this.typeDefaults[+directed];

	var opt = ge.extend({}, this.defaults, typeDefaults, options);

	opt.id = opt.id
		|| svg.attr('id')
		|| 'ge'.concat(Math.floor(Math.random() * 100));

	var reversed = (100 - parseInt(opt.link.text.offset)) + '%';
	opt.link.text.offset = [ opt.link.text.offset, reversed ];

	switch(opt.link.text.anchor) {
		case 'start':
			reversed = 'end';
			break;
		case 'end':
			reversed = 'start';
			break;
		default:
			reversed = 'middle';
	}
	opt.link.text.anchor = [ opt.link.text.anchor, reversed ];

	this.options = opt;
	return this;
};
/**
 * Text size calculator constructor.
 * @class
 * @classdesc Text size calculator class.
 * @param {SVGElement} el  SVG <text> element.
 */
ge.TextSize = function TextSize(el) {
	el.setAttribute('style', 'stroke:none;fill:none');
	this.el = el;
	return this;
};

/**
 * Compute text width.
 * @param {string} text
 * @returns {number}
 */
ge.TextSize.prototype.width = function length(text) {
	this.el.textContent = text;
	return this.el.getComputedTextLength();
};

/**
 * Compute text width and height.
 * @param {string} text
 * @returns {ge.Point}
 */
ge.TextSize.prototype.size = function size(text) {
	this.el.textContent = text;
	var bbox = this.el.getBBox();
	return new ge.Point(bbox.width, bbox.height);
};

/**
 * Compute text container size.
 * @param {string} text
 * @returns {ge.ContainerSize}
 */
ge.TextSize.prototype.containerSize = function containerSize(text) {
	var size = this.size(text);
	var words = text.split(/\s+/);
	var width;
	if(words.length == 1) {
		width = size.x;
	}
	else {
		width = 0;
		var self = this;
		words.forEach(function(word) {
			width = Math.max(width, self.width(word));
		});
	}
	return new ge.ContainerSize(
		width,
		size.y,
		size.x * size.y
	);
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
return exports;});
