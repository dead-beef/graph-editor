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
