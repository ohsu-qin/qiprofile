# Exports the Chai expect function augmented with eventually.
#
# Example:
#   expect = require('../helpers/expect')()
#   expect(promise).to.eventually.exist
module.exports = ->
  chai = require 'chai'
  chaiAsPromised = require 'chai-as-promised'
  chai.use(chaiAsPromised)
  chai.expect
