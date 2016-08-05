###*
 * The Function test helper.
 *
 * @class Function
###

###*
 * A convenience function for defining an instance property
 * on the class prototype.
 *
 * The definition argument is a property {name: descriptor} object,
 * where:
 * * *name* is the property name
 * * *descriptor* is the property getter function or
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
###
Function::property = (definition) ->
  if Object.keys(definition).length != 1
    throw new Error('The propery definition does not consist of exactly one' +
                    ' property definition')
  name = Object.keys(definition)[0]
  descriptor = definition[name]
  if 'get' not of descriptor
    descriptor = get: descriptor
  # The property is enumerable by default.
  if 'enumerable' not of descriptor
    descriptor.enumerable = true
  # Make the new property.
  Object.defineProperty @prototype, name, descriptor
