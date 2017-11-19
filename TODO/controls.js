/**
 * Get unused node ID.
 * @private
 * @returns {ID}
 */
ge.GraphEditor.prototype.newNodeId = function() {
	// ...
};

/**
 * Get unused link ID.
 * @private
 * @returns {ID}
 */
ge.GraphEditor.prototype.newLinkId = function() {
	// ...
};

/**
 * Add a node if it does not exist.
 * @param   {ImportNodeData} node                Node data.
 * @param   {boolean}        [skipUpdate=false]  Skip DOM update.
 * @returns {?ge.Node}                           Added node.
 */
ge.GraphEditor.prototype.addNode = function(node, skipUpdate) {
	// ...
};

/**
 * Add a link if it does not exist.
 * @param   {ImportLinkData} link                Link data.
 * @param   {boolean}        [skipUpdate=false]  Skip DOM update.
 * @returns {?ge.Link}                           Added link.
 */
ge.GraphEditor.prototype.addLink = function(link, skipUpdate) {
	// ...
};

/**
 * Add multiple nodes.
 * @param   {Array<ImportNodeData>} nodes               Node data.
 * @param   {boolean}               [skipUpdate=false]  Skip DOM update.
 * @returns {Array<Node>}                               Added nodes.
 */
ge.GraphEditor.prototype.addNodes = function(nodes, skipUpdate) {
	// ...
};

/**
 * Add multiple links.
 * @param   {Array<ImportLinkData>} links               Link data.
 * @param   {boolean}               [skipUpdate=false]  Skip DOM update.
 * @returns {Array<Link>}                               Added links.
 */
ge.GraphEditor.prototype.addLinks = function(links, skipUpdate) {
	// ...
};

/**
 * Add one or multiple nodes/links.
 * @param   {ImportNodeData|ImportLinkData|Array<(ImportNodeData|ImportLinkData)>} data  Data.
 * @param   {boolean} [skipUpdate=false]  Skip DOM update.
 * @returns {?(Node|Link|AddedObjects)}   Added objects.
 */
ge.GraphEditor.prototype.add = function(data, skipUpdate) {
	// ...
};

/**
 * Convert to JSON.
 * @returns {ExportGraphData}
 * @see ge.GraphEditor.exportData
 */
ge.GraphEditor.prototype.toJson = function() {
	// ...
};

/**
 * Convert to SVG image.
 * @returns {string}
 */
ge.GraphEditor.prototype.toSvg = function() {
	// ...
};
