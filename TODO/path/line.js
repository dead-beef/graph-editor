ge.path.line = (function() {
	var loopStart, loopEnd;

	/**
	 * Line generator.
	 * @name ge.link.line
	 * @param {ge.Link}  link  Link data.
	 * @returns {string}       SVG path.
	 */
	function line(link) {
		var src, dst;

		if(link.source === link.target) {
			src = link.source.shape.getPoint(link.source, loopStart);
			dst = link.source.shape.getPoint(link.source, loopEnd);
			var rx = link.source.width / 2;
			var ry = link.source.height / 2;

			link.reversed = false;
			link.path = 'M'.concat(
				src[0], ',', src[1],
				'A', rx, ',', ry, ',0,1,0,', dst[0], ',', dst[1]
			);

			return link.path;
		}

		src = [link.source.x, link.source.y];
		dst = [link.target.x, link.target.y];
		var src2 = link.source.shape.intersect(link.source, src, dst);
		var dst2 = link.target.shape.intersect(link.target, src, dst);
		src = src2 || src;
		dst = dst2 || dst;

		if((link.reversed = src[0] > dst[0])) {
			src2 = src;
			src = dst;
			dst = src2;
		}
		link.path = 'M'.concat(src[0], ',', src[1], 'L', dst[0], ',', dst[1]);

		return link.path;
	}

	/**
	 * Return loop start angle.
	 * @returns {SinCos}
	 *//**
	 * Set loop start angle.
	 * @param {number} angle  Angle in radians.
	 * @returns {Path}
	 */
	line.loopStart = function loopStart(angle) {
		if(angle === undefined) {
			return loopStart;
		}
		loopStart = ge.sincos(angle);
		return line;
	};

	/**
	 * Return loop end angle.
	 * @returns {SinCos}
	 *//**
	 * Set loop end angle.
	 * @param {number} angle  Angle in radians.
	 * @returns {Path}
	 */
	line.loopEnd = function loopEnd(angle) {
		if(angle === undefined) {
			return loopEnd;
		}
		loopEnd = ge.sincos(angle);
		return line;
	};

	return line
		.loopStart(Math.PI)
		.loopEnd(Math.PI * 1.5);
})();
