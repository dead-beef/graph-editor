# graph-editor - graph editor library module

## Overview

It exports a class which should be bound to an element and provided data for [Graph](https://en.wikipedia.org/wiki/Graph_%28abstract_data_type%29) visualisation and editing.

## Requirements

- [`jQuery`](https://jquery.com/)
- [`D3 v4`](https://d3js.org/)

## Installation

```
npm install graph-editor
```

## Usage

- [`Documentation`](https://dead-beef.github.io/graph-editor)
- [`Usage example`](https://dead-beef.github.io/graph-editor-usage-example)

```js
var selector = 'svg';

var data = {
	nodes: [
		{ id: 0, size: 4, title: 'node1', data: 'userdata0' },
		{ id: 1, size: 8, title: 'node2', data: 'userdata1' }
	],
	links: [
		{ source: 0, target: 0, size: 2, title: 'link2', data: 'userdata2' },
		{ source: 0, target: 1, size: 4, title: 'link1', data: 'userdata3' }
	]
};

var options = {
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
		max: 8.0
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

var graph = new ge.GraphEditor(selector, data, options);
```

## Requirements for advanced workflow

To be able to rebuild the project you will need

- [`Node.js`](https://nodejs.org/)
- [`NPM`](https://nodejs.org/)
- [`Git`](https://git-scm.com/)
- [`GNU Make`](https://www.gnu.org/software/make/)

## Installation

```
git clone https://github.com/dead-beef/graph-editor.git
cd graph-editor
make install
```

## Building

```bash
# single run
make
# continuous
make watch
# single run, minify
make min
# continuous, minify
make min-watch
```

## Testing

```bash
# unit, single run
make test
# unit, continuous
make test-watch
# test library bundle
TEST_BUNDLE=1 make test
# test minified library bundle
TEST_MIN_BUNDLE=1 make test
# select browsers (default: Chromium)
TEST_BROWSERS="Firefox Chrome" make test
```

## Code Linting

```
make lint
```

## Documentation

```
make docs
```

## Licenses

* [`graph-editor`](https://github.com/dead-beef/graph-editor/blob/master/LICENSE)
