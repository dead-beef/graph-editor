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
 * Add.
 * @param {ge.Point} p
 * @returns {ge.Point}
 */
ge.Point.prototype.add = function add(p) {
	this.x += p.x;
	this.y += p.y;
	return this;
};

/**
 * Subtract.
 * @param {ge.Point} p
 * @returns {ge.Point}
 */
ge.Point.prototype.sub = function sub(p) {
	this.x -= p.x;
	this.y -= p.y;
	return this;
};

/**
 * Multiply.
 * @param {number} k
 * @returns {ge.Point}
 */
ge.Point.prototype.mul = function mul(k) {
	this.x *= k;
	this.y *= k;
	return this;
};

/**
 * Return vector length.
 * @returns {number}
 */
ge.Point.prototype.length = function length() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
};

/**
 * Normalize.
 * @returns {ge.Point}
 */
ge.Point.prototype.normalize = function normalize() {
	var l = this.length();
	if(l > 1e-8) {
		this.x /= l;
		this.y /= l;
	}
	return this;
};

/**
 * Rotate.
 * @param {ge.Angle} a
 * @returns {ge.Point}
 */
ge.Point.prototype.rotate = function rotate(a) {
	var x = this.x, y = this.y;
	this.x = x * a.cos - y * a.sin;
	this.y = x * a.sin + y * a.cos;
	return this;
};

/**
 * Clone.
 * @returns {ge.Point}
 */
ge.Point.prototype.clone = function clone() {
	return new ge.Point(this.x, this.y);
};
