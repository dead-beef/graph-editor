'use strict';

/**
 * Create SVG markers.
 * @private
 * @param   {D3Selection}    svg
 * @this    ge.GraphEditor
 * @returns {ge.GraphEditor}
 * @see ge.GraphEditor.initMarkers
 */
ge.GraphEditor.prototype.createMarkers = function() {
	// ...
	return this;
};

/**
 * Initialize SVG.
 * @private
 * @param   {D3Selection}    svg
 * @this    ge.GraphEditor
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.initSvg = function(svg) {
	svg.attr('id', this.options.id)
		.classed(this.options.css.graph, true)
		.classed(this.options.css.digraph, this.options.directed);

	var g = svg.append('g');
	var linkContainer = g.append('g');
	var nodeContainer = g.append('g');

	/**
	 * Graph container element.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.container = g;
	/**
	 * Link elements.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.links = linkContainer.selectAll('g');
	/**
	 * Node elements.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.nodes = nodeContainer.selectAll('g');
	/**
	 * 'Drag to link nodes' line.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.dragLine = g.append('path')
		.classed(this.options.css.dragline, true)
		.classed(this.options.css.hide, true)
		.attr('d', 'M0,0L0,0');
	/**
	 * Text size calculator.
	 * @readonly
	 * @member {ge.TextSize}
	 */
	this.textSize = ge.TextSize(
		svg.append('text')
			.classed(this.options.css.node, true)
			.node()
	);

	/**
	 * Graph SVG element.
	 * @readonly
	 * @member {D3Selection}
	 */
	this.svg = svg;

	return this.createMarkers();
};
