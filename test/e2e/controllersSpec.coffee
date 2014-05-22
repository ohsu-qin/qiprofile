chai = require 'chai'
chaiAsPromised = require 'chai-as-promised'
expect = chai.expect
chai.use(chaiAsPromised)

describe 'E2E Testing Controllers', ->

  describe 'Subject List', ->
    browser.get('http://www.angularjs.org')
    it 'should be routed to the home page', ->
      expect(browser.getCurrentUrl()).to.eventually.equal('/quip')
