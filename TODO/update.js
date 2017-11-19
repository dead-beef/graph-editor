/**
 * Update bounding box.
 * @private
 * @param   {Node}           [node]  Moved node.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.updateBBox = function(node) {
	var data = this.data.nodes;
	var padding = this.options.bbox.padding;

	if(node === undefined) {
		var left = d3.min(data, function(d) { return d.x; });
		var up = d3.min(data, function(d) { return d.y; });
		var right = d3.min(data, function(d) { return d.x + d.width; });
		var down = d3.min(data, function(d) { return d.y + d.height; });

		this.bbox[0][0] = (left || 0) - padding;
		this.bbox[1][0] = (right || 0) + padding;
		this.bbox[0][1] = (up || 0) - padding;
		this.bbox[1][1] = (down || 0) + padding;
	}
	else {
		this.bbox[0][0] = Math.min(this.bbox[0][0], node.x - padding);
		this.bbox[0][1] = Math.min(this.bbox[0][1], node.y - padding);
		this.bbox[1][0] = Math.max(
			this.bbox[1][0],
			node.x + node.width + padding
		);
		this.bbox[1][1] = Math.max(
			this.bbox[1][1],
			data.y + node.height + padding
		);
	}

	this.updateExtent();
	this.zoom.translateExtent(this.bbox);
	return this;
};

/**
 * Update link element.
 * @param   {Reference}       link  Changed link.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.updateLink = function(link) {
	// ...
};

/**
 * Update node element. If it was moved or resized, update its links.
 * @param   {Reference}       node  Changed node.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.updateNode = function(node) {
	// ...
};

/**
 * Update everything.
 * @param   {boolean}        [simulation=false]  True if called from the simulation tick handler.
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.update = function(simulation) {
	// ...
};
