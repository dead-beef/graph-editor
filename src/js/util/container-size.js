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
