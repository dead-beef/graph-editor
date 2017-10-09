describe('functions', function() {
	describe('ge.id', function() {
		it('should be defined', function() {
			expect(ge.id).toBeDefined();
		});

		it('should return object id', function() {
			var obj = { id: { x: 0 } };
			expect(ge.id(obj)).toBe(obj.id);
		});

		it('should return null if object has no id', function() {
			expect(ge.id({})).toBe(null);
		});

		it('should return null if object is null or undefined', function() {
			expect(ge.id(null)).toBe(null);
			expect(ge.id(undefined)).toBe(null);
		});
	});

	describe('ge.bind', function() {
		it('should be defined', function() {
			expect(ge.bind).toBeDefined();
		});

		it('should bind this', function() {
			var func = function() {
				return this;
			};
			var context = { x: 0 };
			var bound = ge.bind(context, func);
			expect(bound.apply({})).toBe(context);
		});

		it('should pass arguments', function() {
			var func = function() {
				return Array.prototype.slice.call(arguments);
			};
			var context = { x: 0 };
			var bound = ge.bind(context, func);
			expect(bound.call({}, 0, 1, 2)).toEqual([0, 1, 2]);
		});
	});

	describe('ge.sincos', function() {
		beforeEach(function() {
			spyOn(Math, 'sin').and.returnValue(0);
			spyOn(Math, 'cos').and.returnValue(1);
		});

		it('should be defined', function() {
			expect(ge.sincos).toBeDefined();
		});

		it('should work', function() {
			expect(ge.sincos(180)).toEqual([0, 1]);
			expect(Math.sin).toHaveBeenCalledWith(Math.PI);
			expect(Math.cos).toHaveBeenCalledWith(Math.PI);
		});
	});

	describe('ge.equal', function() {
		it('should be defined', function() {
			expect(ge.equal).toBeDefined();
		});

		it('should compare numbers', function() {
			expect(ge.equal(0, 0)).toBe(true);
			expect(ge.equal(0, 0.9)).toBe(false);
			expect(ge.equal(0, 0.9, 1)).toBe(true);
			expect(ge.equal(0, 0.9, 0.5)).toBe(false);
		});

		it('should compare arrays', function() {
			var x = [0.1, 0.8, 1.9];
			var y = [-0.15, 1.2, 2.1];
			expect(ge.equal([0], [0])).toBe(true);
			expect(ge.equal([0, 1, 2], [0, 0, 2])).toBe(false);
			expect(ge.equal(x, y, 0.5)).toBe(true);
			expect(ge.equal(x, y, 0.1)).toBe(false);
		});

		it('should return false for null/undefined arguments', function() {
			expect(ge.equal(null, null)).toBe(false);
			expect(ge.equal(undefined, undefined)).toBe(false);
			expect(ge.equal(0, undefined)).toBe(false);
			expect(ge.equal(undefined, 0)).toBe(false);
			expect(ge.equal([0], null)).toBe(false);
			expect(ge.equal(null, [0])).toBe(false);
		});

		it('should return false if argument types differ', function() {
			expect(ge.equal(0, [0])).toBe(false);
			expect(ge.equal([0], 0)).toBe(false);
		});

		it('should throw if an argument has invalid type', function() {
			expect(function() { ge.equal({}, 0); }).toThrow();
			expect(function() { ge.equal(0, false); }).toThrow();
			expect(function() { ge.equal({}, {}); }).toThrow();
		});
	});

	describe('ge.defaultExportNode', function() {
		it('should be defined', function() {
			expect(ge.defaultExportNode).toBeDefined();
		});

		it('should work', function() {
			var obj = {
				id: 0, x: 1, y: 2, size: 3, title: 4, data: 5,
				data1: 6, x1: 7, y1: 8
			};
			var bbox = {
				bbox: [[2, 3], [4, 5]]
			};
			var exported = { id: 0, x: -1, y: -1, size: 3, title: 4, data: 5 };
			expect(ge.defaultExportNode.call(bbox, obj)).toEqual(exported);
		});
	});

	describe('ge.defaultExportLink', function() {
		it('should be defined', function() {
			expect(ge.defaultExportLink).toBeDefined();
		});

		it('should work', function() {
			var obj = {
				source: { id: 0, x: 1, y: 2 },
				target: { id: 1, x: 2, y: 3 },
				size: 3, title: 4, data: 5,
				data1: 6, x1: 7, y1: 8
			};
			var exported = { source: 0, target: 1, size: 3, title: 4, data: 5 };
			expect(ge.defaultExportLink(obj)).toEqual(exported);
		});
	});

	describe('ge.defaultLinkPath', function() {
		var opts = {
			options: {
				link: {
					arc: {
						start: [0, 1],
						end: [1, 0]
					}
				}
			}
		};
		var node = { id: 0, x: 1, y: 2, size: 10 };
		var node2 = { id: 1, x: 50, y: 2, size: 5 };

		it('should be defined', function() {
			expect(ge.defaultLinkPath).toBeDefined();
		});

		it('should work', function() {
			var link = {
				source: node,
				target: node2,
				size: 2
			};
			var path = 'M11,2L43,2';
			expect(ge.defaultLinkPath.call(opts, link)).toEqual(path);
			expect(link.path).toEqual(path);
			expect(link.textPath).toEqual(path);
			expect(link.flip).toEqual(0);
		});

		it('should reverse text path if necessary', function() {
			var link = {
				source: node2,
				target: node,
				size: 2
			};
			var path = 'M45,2L13,2';
			var reversed = 'M13,2L45,2';
			expect(ge.defaultLinkPath.call(opts, link)).toEqual(reversed);
			expect(link.path).toEqual(path);
			expect(link.textPath).toEqual(reversed);
			expect(link.flip).toEqual(1);
		});

		it('should work for reflexive links', function() {
			var link = {
				source: node,
				target: node,
				size: 2
			};
			var path = 'M11,2A10,10,0,1,0,1,-10';
			expect(ge.defaultLinkPath.call(opts, link)).toEqual(path);
			expect(link.path).toEqual(path);
			expect(link.textPath).toEqual(path);
			expect(link.flip).toEqual(0);
		});
	});

	describe('ge.defaultSimulation', function() {
		var nodes = [
			{ x: 0, y: 0, size: 2 },
			{ x: 10, y: 8, size: 4 }
		];

		var links = [];

		var simulation, force;

		beforeEach(function() {
			force = {
				charge: jasmine.createSpy('charge'),
				center: jasmine.createSpyObj('center', ['x', 'y']),
				link: jasmine.createSpyObj('link', ['links', 'distance'])
			};
			force.charge.and.returnValue(force.charge);
			force.center.x.and.returnValue(force.center);
			force.center.y.and.returnValue(force.center);
			force.link.links.and.returnValue(force.link);
			force.link.distance.and.returnValue(force.link);

			simulation = jasmine.createSpyObj('simulation', ['nodes', 'force']);
			simulation.nodes.and.returnValue(simulation);
			simulation.force.and.callFake(function(name, value) {
				if(value === undefined) {
					return force[name];
				}
				return simulation;
			});

			spyOn(d3, 'forceSimulation').and.returnValue(simulation);
			spyOn(d3, 'forceManyBody').and.returnValue(0);
			spyOn(d3, 'forceLink').and.returnValue(1);
			spyOn(d3, 'forceCenter').and.returnValue(2);
		});

		it('should be defined', function() {
			expect(ge.defaultSimulation).toBeDefined();
		});

		it('should create simulation', function() {
			var sim = ge.defaultSimulation(null, nodes, links);
			expect(d3.forceSimulation).toHaveBeenCalledWith();
			expect(d3.forceManyBody).toHaveBeenCalledWith();
			expect(d3.forceLink).toHaveBeenCalledWith();
			expect(d3.forceCenter).toHaveBeenCalledWith();
			expect(sim).toBe(simulation);
			expect(sim.force).toHaveBeenCalledWith('charge', 0);
			expect(sim.force).toHaveBeenCalledWith('link', 1);
			expect(sim.force).toHaveBeenCalledWith('center', 2);
			expect(sim.nodes).toHaveBeenCalledWith(nodes);
			expect(force.center.x).toHaveBeenCalledWith(5);
			expect(force.center.y).toHaveBeenCalledWith(4);
			expect(force.link.links).toHaveBeenCalledWith(links);
			expect(force.link.distance).toHaveBeenCalledWith(40);
		});

		it('should update simulation', function() {
			var sim = ge.defaultSimulation(simulation, nodes, links);
			expect(d3.forceSimulation).not.toHaveBeenCalled();
			expect(d3.forceManyBody).not.toHaveBeenCalled();
			expect(d3.forceLink).not.toHaveBeenCalled();
			expect(d3.forceCenter).not.toHaveBeenCalled();
			expect(sim).toBe(simulation);
			expect(sim.force).toHaveBeenCalledWith('link');
			expect(sim.force).toHaveBeenCalledWith('center');
			expect(sim.nodes).toHaveBeenCalledWith(nodes);
			expect(force.center.x).toHaveBeenCalledWith(5);
			expect(force.center.y).toHaveBeenCalledWith(4);
			expect(force.link.links).toHaveBeenCalledWith(links);
			expect(force.link.distance).toHaveBeenCalledWith(40);
		});
	});
});
