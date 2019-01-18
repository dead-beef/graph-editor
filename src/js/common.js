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
