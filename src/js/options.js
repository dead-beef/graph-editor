'use strict';

ge.GraphEditor.prototype.defaults = {
	id: null,
	directed: false,

	node: {
		border: 2,
		size: {
			def: 10,
			min: 10
		},
		text: {
			dx: 0,
			dy: 0,
			inside: true
		}
	},

	link: {
		path: ge.defaultLinkPath,
		size: {
			def: 2
		},
		text: {
			dx: 0,
			dy: '1.1em',
			offset: null,
			anchor: null
		},
		arc: {
			start: 180,
			end: 270
		}
	},

	simulation: {
		create: ge.defaultSimulation,
		start: false,
		stop: true,
		step: 1
	},

	transition: {
		zoom: 250,
		drag: 50,
		simulation: 50
	},

	scale: {
		min: 0.25,
		max: 8.0,
		/*size: {
			min: 0.5,
			max: 2.0
		}*/
	},

	bbox: {
		padding: 80
	},

	'export': {
		node: ge.defaultExportNode,
		link: ge.defaultExportLink
	},

	css: {
		markers: 'ge-markers',
		node: 'ge-node',
		graph: 'ge-graph',
		digraph: 'ge-digraph',
		hide: 'ge-hidden',
		dragline: 'ge-dragline',
		link: 'ge-link',
		connect: 'ge-connect',
		selection: {
			node: 'ge-selection',
			link: 'ge-link-selection'
		}
	}
};

ge.GraphEditor.prototype.typeDefaults = [
	{
		link: {
			id: function(link) {
				return ''.concat(
					Math.min(link.source.id, link.target.id),
					'-',
					Math.max(link.source.id, link.target.id)
				);
			},
			text: {
				offset: '50%',
				anchor: 'middle'
			}
		}
	},
	{
		link: {
			id: function(link) {
				return ''.concat(link.source.id, '-', link.target.id);
			},
			text: {
				offset: '20%',
				anchor: 'start'
			}
		}
	}
];

ge.GraphEditor.prototype.initOptions = function(options, svg) {
	var directed;
	if(options && options.hasOwnProperty('directed')) {
		directed = options.directed;
	}
	else {
		directed = this.defaults.directed;
	}

	var typeDefaults = this.typeDefaults[+directed];

	var opt = $.extend(true, {}, this.defaults, typeDefaults, options || {});

	opt.id = opt.id
		|| svg.attr('id')
		|| 'ge'.concat(Math.floor(Math.random() * 100));

	opt.link.arc = {
		start: ge.sincos(Math.min(opt.link.arc.start, opt.link.arc.end)),
		end: ge.sincos(Math.max(opt.link.arc.start, opt.link.arc.end)),
		center: ge.sincos((opt.link.arc.start + opt.link.arc.end) / 2)
	};

	var flip = (100 - parseInt(opt.link.text.offset)) + '%';
	opt.link.text.offset = [ opt.link.text.offset, flip ];

	switch(opt.link.text.anchor) {
		case 'start':
			flip = 'end';
			break;
		case 'end':
			flip = 'start';
			break;
		default:
			flip = 'middle';
	}
	opt.link.text.anchor = [ opt.link.text.anchor, flip ];

	opt.link.def = opt.link.path(opt);

	this.options = opt;
	return this;
};
