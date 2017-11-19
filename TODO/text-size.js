/**
 * Text size calculator constructor.
 * @class
 * @classdesc Text size calculator class.
 * @param {SVGElement} el  SVG <text> element.
 */
ge.TextSize = function(el) {
	el.setAttribute('style', 'stroke:none;fill:none');
	this.el = el;
	return this;
};

/**
 * Compute text width.
 * @param {string} text
 * @returns {number}
 */
ge.TextSize.prototype.getLength = function(text) {
	this.el.textContent = text;
	return this.el.getComputedTextLength();
};

/**
 * Compute text width and height.
 * @param {string} text
 * @returns {Point}
 */
ge.TextSize.prototype.getSize = function(text) {
	this.el.textContent = text;
	var bbox = this.el.getBBox();
	return [bbox.width, bbox.height];
};
