_ = require 'lodash'

expect = require('./helpers/expect')()

Page = require('./helpers/page')()

class ImageDetailPage extends Page

describe 'E2E Testing Image Detail', ->
  page = null

  beforeEach ->
    page = new ImageDetailPage '/quip/breast/subject/1/session/1/scan/1?project=QIN_Test'
  
  it 'should display the billboard', ->
    expect(page.billboard).to.eventually.equal('Breast Patient 1 Session 1 Scan 1')
  
  it 'should have a home button', ->
    pat = /.*\/quip\?project=QIN_Test$/
    expect(page.home()).to.eventually.match(pat)
  
  it 'should have help text', ->
    expect(page.hasHelp()).to.eventually.be.true
  
  describe 'Image Display', ->
    it 'should display the image', ->
      expect(true).to.be.false
