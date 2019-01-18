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
