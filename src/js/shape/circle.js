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
