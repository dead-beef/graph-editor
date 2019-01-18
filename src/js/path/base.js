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
