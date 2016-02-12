# A convenience function for defining an instance property
# on the class prototype.
#
# Warning: this property meta-function is not yet advisable for
# testing. Properties are ignored when added as a mix-in with
# extend or as a superclass. The Javascript fun house does not
# lend itself it to rational inheritance or extension
# expectations.
#
# The definition argument is a property {name: descriptor} object,
# where:
# * *name* is the property name
# * *descriptor* is the property getter function or
#   {get: getter, set: setter} object
#
# Examples:
#
# class Name
#   constructor: (@first, @last) ->
#
#   full: -> "#{first} #{last}"
#
#   proper: ->
#      get: -> "#{last}, #{first}"
#      set: (name) -> [@last, @first] = name.split(', ')
#
# The property is enumerable by default.
#
# @param definition the {name: descriptor} property definition
Function::property = (definition) ->
  if Object.keys(definition).length != 1
    throw new Error('The propery definition does not consist of exactly one' +
                    ' property definition')
  name = Object.keys(definition)[0]
  descriptor = definition[name]
  if 'get' not in descriptor
    descriptor = get: descriptor
  # The property is enumerable by default.
  if 'enumerable' not in descriptor
    descriptor.enumerable = true
  # Make the new property.
  Object.defineProperty @prototype, name, descriptor
