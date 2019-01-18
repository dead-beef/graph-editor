/**
 * Text size calculator constructor.
 * @class
 * @classdesc Text size calculator class.
 * @param {SVGElement} el  SVG <text> element.
 */
ge.TextSize = function TextSize(el) {
	el.setAttribute('style', 'stroke:none;fill:none');
	this.el = el;
	return this;
};

/**
 * Compute text width.
 * @param {string} text
 * @returns {number}
 */
ge.TextSize.prototype.width = function length(text) {
	this.el.textContent = text;
	return this.el.getComputedTextLength();
};

/**
 * Compute text width and height.
 * @param {string} text
 * @returns {ge.Point}
 */
ge.TextSize.prototype.size = function size(text) {
	this.el.textContent = text;
	var bbox = this.el.getBBox();
	return new ge.Point(bbox.width, bbox.height);
};

/**
 * Compute text container size.
 * @param {string} text
 * @returns {ge.ContainerSize}
 */
ge.TextSize.prototype.containerSize = function containerSize(text) {
	var size = this.size(text);
	var words = text.split(/\s+/);
	var width;
	if(words.length == 1) {
		width = size.x;
	}
	else {
		width = 0;
		var self = this;
		words.forEach(function(word) {
			width = Math.max(width, self.width(word));
		});
	}
	return new ge.ContainerSize(
		width,
		size.y,
		size.x * size.y
	);
};
