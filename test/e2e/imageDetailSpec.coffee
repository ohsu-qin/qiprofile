_ = require 'lodash'

expect = require('./helpers/expect')()

Page = require('./helpers/page')()

class ImageDetailPage extends Page
  displayPanel: ->
    this.select('qi-series-image')
  overlaySelector: ->
    this.select('.qi-overlay-select')
  imageCtlPanel: ->
    this.select('.qi-image-ctl')

describe 'E2E Testing Image Detail', ->
  page = null

  beforeEach ->
    page = new ImageDetailPage '/quip/sarcoma/subject/1/session/1/scan/21?project=QIN_Test'
  
  it 'should display the billboard', ->
    expect(page.billboard, 'The billboard is incorrect')
      .to.eventually.equal('Sarcoma Patient 1 Session 1 Scan Time Point 21')
  
  it 'should have a home button', ->
    pat = /.*\/quip\?project=QIN_Test$/
    expect(page.home(), 'The home URL is incorrect').to.eventually.match(pat)
  
  it 'should have help text', ->
    expect(page.help(), 'The help is missing').to.eventually.exist
  
  describe 'Image Display', ->
    panel = null
    
    beforeEach ->
      panel = page.displayPanel()
    
    it 'should display the image', ->
      expect(panel, 'The image panel is missing').to.eventually.exist

  describe 'Overlay Selection Buttons', ->
    panel = null
    
    beforeEach ->
      panel = page.overlaySelector()
    
    it 'should display the overlay selection buttons', ->
      expect(panel, 'The overlay selection buttons are missing').to.eventually.exist

  describe 'Image Control Panel', ->
    panel = null
    
    beforeEach ->
      panel = page.imageCtlPanel()
    
    it 'should display the image control panel', ->
      expect(panel, 'The image control panel is missing').to.eventually.exist
