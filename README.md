# graph-editor - graph editor frontend component

[![npm](https://img.shields.io/npm/v/graph-editor.svg)](
    https://www.npmjs.com/package/graph-editor
) [![node](https://img.shields.io/node/v/graph-editor.svg)](
    https://nodejs.org/
) [![Libraries.io for GitHub](https://img.shields.io/librariesio/github/dead-beef/graph-editor.svg)](
    https://libraries.io/npm/graph-editor/
) [![license](https://img.shields.io/github/license/dead-beef/graph-editor.svg)](
    https://github.com/dead-beef/graph-editor/blob/master/LICENSE
)

## Overview

It exports a class which should be bound to an element and provided data for [Graph](https://en.wikipedia.org/wiki/Graph_%28abstract_data_type%29) visualisation and editing.

## Requirements

- [`D3 v5`](https://d3js.org/)

## Installation

```
npm install graph-editor
```

## Usage

- [`Documentation`](https://dead-beef.github.io/graph-editor)
- [`Usage example`](https://codepen.io/deadbeef/pen/wRVMej)

## Development

### Requirements

- [`Node.js`](https://nodejs.org/)
- [`NPM`](https://nodejs.org/)
- [`Git`](https://git-scm.com/)
- [`GNU Make`](https://www.gnu.org/software/make/)

### Installation

```bash
git clone https://github.com/dead-beef/graph-editor.git
cd graph-editor
make install
```

### Building

```bash
# single run
make
# continuous
make watch
```

### Testing

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

### Code Linting

```
make lint
```

### Documentation

```
make docs
```

## Licenses

* [`graph-editor`](https://github.com/dead-beef/graph-editor/blob/master/LICENSE)
