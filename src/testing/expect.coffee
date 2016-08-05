# Exports the Chai expect function augmented with eventually.
#
# Example:
#   expect = require('../testing/expect')()
#   expect(promise).to.eventually.exist
#
# Note: this module is the Protractor version of the unit test
# helpers/expect.coffee. It is necessary because Protractor
# cannot import requirejs.
module.exports = ->
  chai = require 'chai'
  chaiAsPromised = require 'chai-as-promised'
  chai.use(chaiAsPromised)
  chai.expect
