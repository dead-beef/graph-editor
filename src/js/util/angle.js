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
