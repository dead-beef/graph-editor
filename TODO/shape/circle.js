ge.shape.circle = (function() {
	/**
	 * Circle/ellipse shape.
	 * @name ge.shape.circle
	 * @param   {ge.Node} node   Node data.
	 * @returns {string}         SVG path.
	 */
	function circle(node) {
		var dx = node.width, rx = dx / 2, ry = node.height / 2;
		var arc = 'a'.concat(rx, ',', ry, ',0,1,0,');
		return 'M'.concat(-rx, ',0', arc, dx, ',0', arc, -dx, ',0');
	}

	/**
	 * Return shape point at angle.
	 * @param   {ge.Node} node   Node data.
	 * @param   {SinCos}  angle  Angle.
	 * @returns {Point}
	 */
	circle.getPoint = function getPoint(node, angle) {
		return [
			node.x + node.width * angle[1] * 0.5,
			node.y + node.height * angle[0] * 0.5
		];
	};

	/**
	 * Intersect with a line.
	 * @param   {ge.Node} node   Node data.
	 * @param   {Point}   a
	 * @param   {Point}   b
	 * @returns {?Point}         Intersection point.
	 * @see ge.defaultLinkPath
	 */
	circle.intersect = function intersect(node, a, b) {
		// ...
	};

	/**
	 * Resize a node to fit its title inside.
	 * @param {ge.Node} node   Node data.
	 * @see ge.GraphEditor.getNodeSize
	 */
	circle.fitTextInside = function fitTextInside(node) {
		// ...
	};

	return circle;
})();
