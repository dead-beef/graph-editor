# GraphEditor - graph editor library module

## Overview

It exports a class which should be bound to an element and provided data for [Graph](https://en.wikipedia.org/wiki/Graph_(abstract_data_type)) visualisation and editing.

## Requirements

- [`jQuery`](https://jquery.com/)
- [`D3`](https://d3js.org/)

## Usage

```js
var selector = 'svg';

var data = {
	nodes: [
		{ id: 0, size: 4, title: 'node1' },
		{ id: 1, size: 8, title: 'node2' }
	],
	links: [
		{ source: 0, target: 0, size: 2, title: 'link2' },
		{ source: 0, target: 1, size: 4, title: 'link1' }
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

### Events

```js
graph.on(event, handler);
```

- `click (position)`
- `node-click (datum)`
- `link-click (datum)`
- `new-link-start (datum)`
- `new-link-end (source_datum, target_datum)`
- `new-link-cancel (datum)`
- `simulation-start ()`
- `simulation-stop ()`

### State

- `graph.state.simulation`
- `graph.state.dragToLink`
- `graph.state.selectedNode`
- `graph.state.selectedLink`

### Editing

- `graph.addNode(datum[, skipUpdate])`
- `graph.addNodes(data[, skipUpdate])`

- `graph.addLink(datum[, skipUpdate])`
- `graph.addLinks(data[, skipUpdate])`

- `graph.add(data[, skipUpdate])`
- `graph.remove(data[, skipUpdate])`

- `graph.selectNode([datum[, update]])`
- `graph.selectLink([datum[, update]])`
- `graph.select([datum[, update]])`

- `graph.simulation([on])`

- `graph.updateLink(datum)`
- `graph.updateNode(datum)`
- `graph.update()`
- `graph.resized()`

- `graph.clear([clearData])`
- `graph.redraw()`
- `graph.destroy()`

- `graph.exportData()`

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
# test application bundle
TEST_BUNDLE=1 make test
# select browsers (default: Chromium)
TEST_BROWSERS="Firefox Chrome" make test
```

## Code Linting

```
make lint
```

## Licenses

* [`GraphEditor`](LICENSE)
