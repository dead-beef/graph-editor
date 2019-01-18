'use strict';

/**
 * Default options for all graph types.
 * @type GraphOptions
 */
ge.GraphEditor.prototype.defaults = {
	id: null,
	directed: false,

	node: {
		shape: new ge.shape.Circle(),
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
		size: {
			def: 2
		},
		text: {
			dx: 0,
			dy: '1.1em',
			offset: null,
			anchor: null
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
		drag: 0,
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

	css: {
		//markers: 'ge-markers',
		node: 'ge-node',
		graph: 'ge-graph',
		digraph: 'ge-digraph',
		hide: 'ge-hidden',
		dragline: 'ge-dragline',
		link: 'ge-link',
		textpath: 'ge-text-path',
		//connect: 'ge-connect',
		selection: {
			node: 'ge-selection',
			link: 'ge-link-selection'
		}
	}
};

/**
 * Default options by graph type.
 * @type Array<GraphOptions>
 */
ge.GraphEditor.prototype.typeDefaults = [
	{
		link: {
			shape: new ge.path.Line({
				loopStart: 0,
				loopEnd: 90
			}),
			text: {
				offset: '50%',
				anchor: 'middle'
			}
		}
	},
	{
		link: {
			shape: new ge.path.Line({
				arrow: true,
				loopStart: 0,
				loopEnd: 90
			}),
			text: {
				offset: '20%',
				anchor: 'start'
			}
		}
	}
];

/**
 * Initialize graph options.
 * @private
 * @param	{GraphOptions}	  options
 * @param	{D3Selection}	  svg
 * @returns {ge.GraphEditor}
 */
ge.GraphEditor.prototype.initOptions = function initOptions(options, svg) {
	var directed;
	if(options && options.hasOwnProperty('directed')) {
		directed = options.directed;
	}
	else {
		directed = this.defaults.directed;
	}

	var typeDefaults = this.typeDefaults[+directed];

	var opt = ge.extend({}, this.defaults, typeDefaults, options);

	opt.id = opt.id
		|| svg.attr('id')
		|| 'ge'.concat(Math.floor(Math.random() * 100));

	var reversed = (100 - parseInt(opt.link.text.offset)) + '%';
	opt.link.text.offset = [ opt.link.text.offset, reversed ];

	switch(opt.link.text.anchor) {
		case 'start':
			reversed = 'end';
			break;
		case 'end':
			reversed = 'start';
			break;
		default:
			reversed = 'middle';
	}
	opt.link.text.anchor = [ opt.link.text.anchor, reversed ];

	this.options = opt;
	return this;
};
