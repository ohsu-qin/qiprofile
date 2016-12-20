
/**
 * The Function test helper.
 *
 * @class ObjectHelper
 * @static
 */


/**
 * A convenience function for defining an instance property
 * on the class prototype.
 *
 * The definition argument is a property {_name_: _descriptor_} object,
 * where:
 * * _name_ is the property name
 * * _descriptor_ is the property getter function or
 *   {get: getter, set: setter} object
 *
 * The property is enumerable by default.
 *
 * @example
 *     class Name
 *       constructor: (@first, @last) ->
 *   
 *       full: -> "#{first} #{last}"
 *   
 *       proper: ->
 *          get: -> "#{last}, #{first}"
 *          set: (name) -> [@last, @first] = name.split(', ')
 *
 * @method property
 * @param definition {Object} the {name: descriptor} property definition
 */

(function() {
  Function.prototype.property = function(definition) {
    var descriptor, name;
    if (Object.keys(definition).length !== 1) {
      throw new Error('The propery definition does not consist of exactly one' + ' property definition');
    }
    name = Object.keys(definition)[0];
    descriptor = definition[name];
    if (!('get' in descriptor)) {
      descriptor = {
        get: descriptor
      };
    }
    if (!('enumerable' in descriptor)) {
      descriptor.enumerable = true;
    }
    return Object.defineProperty(this.prototype, name, descriptor);
  };

}).call(this);
