'use strict';

ge.GraphEditor.prototype.on = function(event, handler) {
	this.dispatch.on(event, handler);
	return this;
};

ge.GraphEditor.prototype.clickPosition = function() {
	var node = this.container.node();
	return d3.touch(node) || d3.mouse(node);
};

ge.GraphEditor.prototype.touchedNode = function() {
	var x = d3.event.touches[0].pageX;
	var y = d3.event.touches[0].pageY;

	var el = document.elementFromPoint(x, y);
	var tag, cls;

	var node = this.options.css.node;

	while(true) {
		if(!el) {
			return null;
		}

		tag = el.tagName.toLowerCase();
		if(tag === 'svg' || tag === 'body') {
			return null;
		}

		cls = el.getAttribute('class');
		if(el.tagName === 'g' && cls && cls.indexOf(node) >= 0) {
			return d3.select(el).datum();
		}

		el = el.parentNode;
	}
};

ge.GraphEditor.prototype.dragEvents = function(drag) {
	var self = this;

	return drag
		.on('start', function(d) {
			self.state.dragged = false;
			self.state.dragPos = null;
			d3.select(this).raise();

			if(self.simulation() && !self.dragToLink()) {
				d.fx = d.x;
				d.fy = d.y;
				self.simulation('restart');
			}
		})
		.on('drag', function(d) {
			if(self.dragToLink()) {
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
				if(self.simulation()) {
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
				if(self.dragToLink()) {
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
				else if(self.simulation()) {
					self.simulation('restart');
				}
			}
			else {
				self.dispatch.call('node-click', self, d);
			}
		});
};

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

ge.GraphEditor.prototype.nodeEvents = function(nodes) {
	var self = this;

	nodes
		.attr(
			'transform',
			function(d) {
				return 'translate('.concat(d.x, ',', d.y, ')');
			}
		)
		.on('mouseover', function(d) {
			if(self.dragToLink()) {
				self.state.newLinkTarget = d;
				/*d3.select(this).classed(
					self.options.css.connect,
					true
				);*/
			}
		})
		.on('mouseout', function(/*d*/) {
			if(self.dragToLink()) {
				self.state.newLinkTarget = null;
			}
			/*d3.select(this).classed(
				self.options.css.connect,
				false
			);*/
		})
		.on('touchmove', function() {
			if(self.dragToLink()) {
				self.state.newLinkTarget = self.touchedNode();
			}
		})
		.call(self.drag);
};
