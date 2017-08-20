'use strict';

ge.id = function(data) {
	return data && data.id;
};

ge.bind = function(_this, f) {
	return function() {
		return f.apply(_this, arguments);
	};
};

ge.sincos = function(angle) {
	angle *= Math.PI / 180;
	return [ Math.sin(angle), Math.cos(angle) ];
}; 

ge.equal = function(u, v, eps) {
	eps = eps || 1e-5;
	var eq = function(x, y) { return Math.abs(x - y) < eps; };

	if(u === null || v === null || u === undefined || v === undefined) {
		return false;
	}

	if(typeof u === 'number') {
		if(typeof v !== 'number') {
			return false;
		}
		return eq(u, v);
	}

	if(!Array.isArray(u) || !Array.isArray(v)) {
		throw new Error(
			'ge.equal: invalid argument type: '
				.concat(u.toString(), ' ', v.toString())
		);
	}

	if(u.length !== v.length) {
		return false;
	}

	for(var i = 0; i < u.length; ++i) {
		if(!eq(u[i], v[i])) {
			return false;
		}
	}

	return true;
};

ge.defaultExportNode = function(node) {
	return {
		id: node.id,
		x: node.x - this.bbox[0][0],
		y: node.y - this.bbox[0][1],
		size: node.size,
		title: node.title,
		data: node.data
	};
};

ge.defaultExportLink = function(link) {
	return {
		source: link.source.id,
		target: link.target.id,
		size: link.size,
		title: link.title,
		data: link.data
	};
};

ge.defaultLinkPath = function(options) {
	return function(d) {
		var x0, y0, x1, y1;

		if(d.source === d.target) {
			var arc = options.link.arc;
			var r = d.source.size + d.size;

			x0 = d.source.x + arc.start[1] * d.source.size;
			y0 = d.source.y - arc.start[0] * d.source.size;
			x1 = d.source.x + arc.end[1] * r;
			y1 = d.source.y - arc.end[0] * r;

			d.textPath = ''.concat(
				'M', x0, ',', y0,
				'A', d.source.size, ',', d.source.size,
				',0,1,0,', x1, ',', y1
			);
			d.path = d.textPath;
			d.flip = 0;

			return d.textPath;
		}

		x0 = d.source.x;
		y0 = d.source.y;
		x1 = d.target.x - x0;
		y1 = d.target.y - y0;

		var length = Math.sqrt(x1 * x1 + y1 * y1);

		x1 /= length;
		y1 /= length;

		length -= d.source.size + d.target.size + d.size;

		x0 += x1 * d.source.size;
		y0 += y1 * d.source.size;

		x1 = x0 + x1 * length;
		y1 = y0 + y1 * length;

		d.path = ''.concat(
			'M', x0, ',', y0,
			'L', x1, ',', y1
		);

		if((d.flip = +(x0 > x1))) {
			d.textPath = ''.concat(
				'M', x1, ',', y1,
				'L', x0, ',', y0
			);
		}
		else {
			d.textPath = d.path;
		}

		return d.textPath;
	};
};

ge.defaultSimulation = function(simulation, options, nodes, links) {
	if(!simulation) {
		simulation = d3.forceSimulation()
			.force('charge', d3.forceManyBody())
			.force('link', d3.forceLink())
			.force('center', d3.forceCenter());
	}

	var dist = 10 * d3.max(nodes, function(d) { return d.size; });

	var cx = d3.mean(nodes, function(d) { return d.x; });
	var cy = d3.mean(nodes, function(d) { return d.y; });

	simulation.nodes(nodes);
	simulation.force('center').x(cx).y(cy);
	simulation.force('link').links(links).distance(dist);

	return simulation;
};

/*ge.debounceD3 = function(func, delay) {
	var timeout = null;

	return function() {
		var context = this;
		var args = arguments;
		var d3ev = d3.event;

		if(timeout !== null) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(
			function() {
				var tmp = d3.event;
				timeout = null;
				d3.event = d3ev;
				try {
					func.apply(context, args);
				}
				finally {
					d3.event = tmp;
				}
			},
			delay
		);
	};
};*/
