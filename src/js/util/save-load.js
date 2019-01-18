/**
 * Class for saving/loading JSON.
 * @class
 * @param {?number}  x  X coordinate.
 * @param {?number}  y  Y coordinate.
 */
ge.SaveLoad = function SaveLoad() {
	/**
	 * Class constructors by name.
	 * @member {object}
	 */
	this.classes = {};
};

/**
 * Add a class.
 * @param {function} constructor              Class constructor.
 * @param {string}   [name=constructor.name]  Class name.
 * @param {boolean}  [overwrite=false]        Overwrite if class exists.
 */
ge.SaveLoad.prototype.addClass = function addClass(
	constructor,
	name,
	overwrite
) {
	name = name || constructor.name;
	if(this.classes[name] && !overwrite) {
		throw new Error('class "' + name +'" exists');
	}
	this.classes[name] = constructor;
};

/**
 * Get class by name.
 * @param   {string}   name  Class name.
 * @returns {function}       Class constructor.
 */
ge.SaveLoad.prototype.getClass = function getClass(name) {
	var ret = this.classes[name];
	if(!ret) {
		throw new Error('class "' + name +'" not found');
	}
	return ret;
};

/**
 * Load from JSON.
 * @param   {object}  data     JSON data.
 * @returns {object}
 */
ge.SaveLoad.prototype.fromJson = function fromJson(data) {
	var cls = this.getClass(data['class']);
	return new cls(data);
};

/**
 * Save to JSON.
 * @param   {object}  obj                          Object to save.
 * @param   {string}  [name=obj.constructor.name]  Class name.
 * @returns {object}
 */
ge.SaveLoad.prototype.toJson = function toJson(obj, name) {
	var ret = obj.toJson();
	ret['class'] = name || obj.constructor.name;
	return ret;
};
