/**
 * Line.
 * @class
 * @param {?object} [data]                JSON data.
 * @param {?number} [data.loopStart=180]  Loop start angle in degrees.
 * @param {?number} [data.loopEnd=270]    Loop end angle in degrees.
 */
ge.path.Line = function Line(data) {
	ge.path.Path.call(this, data);
};

ge.path.Line.prototype = Object.create(ge.path.Line);
Object.defineProperty(
	ge.path.Line.prototype,
	'constructor',
	{ 
		value: ge.path.Line,
		enumerable: false,
		writable: true
	}
);
ge.path.addClass(ge.path.Line);

/**
 * Return text path and set link path.
 * @param   {ge.Link}   link   Link data.
 * @returns {string}           SVG path.
 */
ge.path.Line.prototype.path = function path(link) {
	var src, dst;

	if(link.source === link.target) {
		src = link.source.shape.getPoint(link.source, this.loopStart);
		dst = link.source.shape.getPoint(link.source, this.loopEnd);
		var rx = link.source.width / 2;
		var ry = link.source.height / 2;

		link.reversed = false;
		link.path = 'M'.concat(
			src.x, ',', src.y,
			'A', rx, ',', ry, ',0,1,0,', dst.x, ',', dst.y
		);

		return link.path;
	}

	src = new ge.Point(link.source.x, link.source.y);
	dst = new ge.Point(link.target.x, link.target.y);
	var src2 = link.source.shape.intersect(link.source, link.target);
	var dst2 = link.target.shape.intersect(link.target, link.source);
	src = src2 || src;
	dst = dst2 || dst;

	link.path = 'M'.concat(src.x, ',', src.y, 'L', dst.x, ',', dst.y);

	if((link.reversed = src.x > dst.x)) {
		src2 = src;
		src = dst;
		dst = src2;
	}

	return 'M'.concat(src.x, ',', src.y, 'L', dst.x, ',', dst.y);
};
