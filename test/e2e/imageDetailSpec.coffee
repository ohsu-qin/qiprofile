_ = require 'lodash'

expect = require('./helpers/expect')()

Page = require './helpers/page' 

class ImageDetailPage extends Page
  displayPanel: ->
    @find('qi-series-image')
  
  overlaySelector: ->
    @find('.qi-overlay-select')
  
  imageCtlPanel: ->
    @find('.qi-image-ctl')

describe.only 'E2E Testing Image Detail', ->
  page = null

  beforeEach ->
    page = new ImageDetailPage '/quip/sarcoma/subject/1/session/1/scan/t1/image/20?project=QIN_Test'

  it 'should load the page', ->
    expect(page.content, 'The page was not loaded')
      .to.eventually.exist

  it 'should display the billboard', ->
    expect(page.billboard, 'The billboard is incorrect')
      .to.eventually.equal('Sarcoma Patient 1 Session 1 Scan Time Point 20')

  it 'should have a home button', ->
    pat = /.*\/quip\?project=QIN_Test$/
    expect(page.home, 'The home URL is incorrect').to.eventually.match(pat)

  it 'should have help text', ->
    expect(page.help, 'The help is missing').to.eventually.exist

  it 'should display a contact email link', ->
    pat = /a href="mailto:\w+@ohsu.edu"/
    expect(page.contactInfo(), 'The email address is missing')
      .to.eventually.match(pat)

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
