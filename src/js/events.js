'use strict';

/**
 * Add an event handler.
 * @param   {string}         event
 * @param   {?function}      handler
 * @returns {ge.GraphEditor}
 * @see [d3.dispatch.on]{@link https://github.com/d3/d3-dispatch#dispatch_on}
 */
ge.GraphEditor.prototype.on = function(event, handler) {
	this.dispatch.on(event, handler);
	return this;
};

/**
 * Get mouse or touch coordinates relative to container.
 * @private
 * @param {(HTMLElement|SVGElement)} [container=this.container.node()]
 * @returns {Point}
 * @see [d3.mouse]{@link https://github.com/d3/d3-selection/blob/master/README.md#mouse}
 * @see [d3.touch]{@link https://github.com/d3/d3-selection/blob/master/README.md#touch}
 */
ge.GraphEditor.prototype.clickPosition = function(container) {
	container = container || this.container.node();
	return d3.touch(container) || d3.mouse(container);
};

/**
 * Get touched node.
 * @private
 * @returns {?Node}
 * @see [d3.event]{@link https://github.com/d3/d3-selection/blob/master/README.md#event}
 * @see [document.elementFromPoint]{@link https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint}
 */
ge.GraphEditor.prototype.touchedNode = function() {
	var x = d3.event.touches[0].pageX;
	var y = d3.event.touches[0].pageY;
	var el = document.elementFromPoint(x, y);
	var nodeClass = this.options.css.node;
	while(true) {
		if(!el) {
			return null;
		}
		switch(el.tagName.toLowerCase()) {
			case 'svg':
			case 'body':
				return null;
			case 'g':
				if(el.classList.contains(nodeClass)) {
					return d3.select(el).datum();
				}
		}
		el = el.parentNode;
	}
};

/**
 * Set node drag event handlers.
 * @private
 * @param {D3Drag} drag  Node drag behavior.
 * @fires node-click
 * @fires new-link-start
 * @fires new-link-end
 * @fires new-link-cancel
 * @returns {D3Drag}
 */
ge.GraphEditor.prototype.dragEvents = function(drag) {
	var self = this;

	return drag
		.on('start', function(d) {
			self.state.dragged = false;
			self.state.dragPos = null;
			d3.select(this).raise();

			if(self.state.simulationStarted && !self.state.dragToLink) {
				d.fx = d.x;
				d.fy = d.y;
				self.simulation('restart');
			}
		})
		.on('drag', function(d) {
			if(self.state.dragToLink) {
				var mouse = self.clickPosition();
				var path = ''.concat(
					'M', d.x, ',', d.y,
					'L', mouse[0], ',', mouse[1]
				);

				if(!self.state.dragged) {
					self.state.dragged = true;
					self.dragLine
						.classed(self.options.css.hide, false)
						.attr('d', path);
					self.dispatch.call('new-link-start', self, d);
				}
				else {
					self.transition(self.dragLine, 'drag')
						.attr('d', path);
				}
			}
			else {
				self.state.dragged = true;
				d.x += d3.event.dx;
				d.y += d3.event.dy;
				if(self.state.simulationStarted) {
					d.fx = d.x;
					d.fy = d.y;
					self.simulation('restart');
				}
				self.updateNode(this);
			}
		})
		.on('end', function(d) {
			d.fx = null;
			d.fy = null;
			
			self.state.dragPos = self.clickPosition();

			if(self.state.dragged) {
				self.state.dragged = false;
				if(self.state.dragToLink) {
					self.dragLine.classed(self.options.css.hide, true);
					if(self.state.newLinkTarget) {
						var target = self.state.newLinkTarget;
						self.state.newLinkTarget = null;
						self.dispatch.call(
							'new-link-end',
							self, d, target
						);
					}
					else {
						self.dispatch.call('new-link-cancel', self, d);
					}
				}
				else if(self.state.simulationStarted) {
					self.simulation('restart');
				}
			}
			else {
				self.dispatch.call('node-click', self, d);
			}
		});
};

/**
 * Set zoom event handlers.
 * @private
 * @param {D3Zoom} zoom  Graph zoom behavior.
 * @fires click
 * @returns {D3Zoom}
 */
ge.GraphEditor.prototype.zoomEvents = function(zoom) {
	var self = this;
	//var prevScale = 1;

	return zoom
		.duration(self.options.transition.zoom)
		.on('end', function() {
			if(!self.state.zoomed) {
				var pos = self.clickPosition();
				if(!ge.equal(self.state.dragPos, pos)) {
					self.dispatch.call('click', self, pos);
				}
				else {
					self.state.dragPos = null;
				}
			}
			self.state.zoomed = false;
		})
		.on('zoom', function() {
			self.state.zoomed = true;

			/*var scale = d3.event.transform.k;

			if(Math.abs(scale - prevScale) > 0.001)
			{
				prevScale = scale;

				if(scale > graph.options.sizeScaleMax)
				{
					self.state.sizeScale = graph.options.sizeScaleMax / scale;
				}
				else if(scale < graph.options.sizeScaleMin)
				{
					self.state.sizeScale = graph.options.sizeScaleMin / scale;
				}
				else
				{
					self.state.sizeScale = 1;
				}

				self.updateSize();
			}*/

			var type;

			if(ge.equal(d3.event.transform.k, self.state.zoom)) {
				type = 'drag';
			}
			else {
				type = 'zoom';
				self.state.zoom = d3.event.transform.k;
			}

			self.transition(self.container, type, 'zoom')
				.attr(
					'transform',
					d3.event.transform.toString()
				);
		});
};

/**
 * Set link event handlers.
 * @private
 * @param {D3Selection} links
 * @fires link-click
 * @returns {D3Selection}
 */
ge.GraphEditor.prototype.linkEvents = function(links) {
	var self = this;

	return links
		.on('mousedown', function(/*d*/) {
			d3.event.stopPropagation();
			d3.event.preventDefault();
		})
		.on('touchstart', function(/*d*/) {
			self.state.dragPos = self.clickPosition();
		})
		.on('mouseup', function(d) {
			d3.event.stopPropagation();
			d3.event.preventDefault();
			self.dispatch.call('link-click', self, d);
		});
};


/**
 * Set node event handlers.
 * @private
 * @param {D3Selection} nodes
 * @returns {D3Selection}
 */
ge.GraphEditor.prototype.nodeEvents = function(nodes) {
	var self = this;

	return nodes
		.attr(
			'transform',
			function(d) {
				return 'translate('.concat(d.x, ',', d.y, ')');
			}
		)
		.on('mouseover', function(d) {
			if(self.state.dragToLink) {
				self.state.newLinkTarget = d;
				/*d3.select(this).classed(
					self.options.css.connect,
					true
				);*/
			}
		})
		.on('mouseout', function(/*d*/) {
			if(self.state.dragToLink) {
				self.state.newLinkTarget = null;
			}
			/*d3.select(this).classed(
				self.options.css.connect,
				false
			);*/
		})
		.on('touchmove', function() {
			if(self.state.dragToLink) {
				self.state.newLinkTarget = self.touchedNode();
			}
		})
		.call(self.drag);
};
