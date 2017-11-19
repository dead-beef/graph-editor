ge.shape.rect = (function() {
	/**
	 * Rectangle shape.
	 * @name ge.shape.rect
	 * @param   {ge.Node} node   Node data.
	 * @returns {string}         SVG path.
	 */
	function rect(node) {
		var w = node.width, h = node.height;
		return 'M'.concat(
			(-w / 2), ',', (-h / 2),
			'l', w, ',0l0,', h, 'l', -w, ',0z'
		);
	}

	/**
	 * Return shape point at angle.
	 * @param   {ge.Node} node   Node data.
	 * @param   {SinCos}  angle  Angle.
	 * @returns {Point}
	 */
	rect.getPoint = function(node, angle) {
		// ...
	};

	/**
	 * Intersect with a line.
	 * @param   {ge.Node} node   Node data.
	 * @param   {Point}   a
	 * @param   {Point}   b
	 * @returns {?Point}         Intersection point.
	 * @see ge.defaultLinkPath
	 */
	rect.intersect = function(node, a, b) {
		// ...
	};

	/**
	 * Resize a node to fit its title inside.
	 * @param {ge.Node} node   Node data.
	 * @see ge.GraphEditor.getNodeSize
	 */
	rect.fitTextInside = function(node) {
		// ...
	};

	return rect;
})();
