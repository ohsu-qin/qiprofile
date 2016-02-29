expect = require('./helpers/expect')()

Page = require './helpers/page'

class VolumePage extends Page
  displayPanel: ->
    @find('qi-image')
  
  # TODO - Replace the CSS selector below with a selector for
  # elements bound to the model modelSelect.
  overlaySelector: ->
    @find('#overlay-select')
  
  imageCtlPanel: ->
    @find('.qi-vol-ctl')

describe 'E2E Testing Volume', ->
  page = null

  before ->
    page = new VolumePage '/quip/sarcoma/subject/1/session/1/scan/1/volume/20?project=QIN_Test'

  it 'should load the page', ->
    expect(page.content, 'The page was not loaded')
      .to.eventually.exist
  
  # The page header test cases.
  describe 'Header', ->
    it 'should display the billboard', ->
      expect(page.billboard, 'The billboard is incorrect')
        .to.eventually.equal('Sarcoma Patient 1 Session 1 Scan 1 Volume 20')
  
    it 'should have a home button', ->
      expect(page.home, 'The home URL is incorrect')
        .to.eventually.match(Page.HOME_URL_PAT)
  
    describe 'Help', ->
      help = null
    
      before ->
        help = page.help

      it 'should have help text', ->
        expect(help, 'The help text is missing')
          .to.eventually.exist.and.not.be.empty

      it 'should display a {qu,sugg}estion box hyperlink', ->
        expect(help, 'The {qu,sugg}estion box hyperlink is missing')
          .to.eventually.include(Page.SUGGESTION_BOX_URL)
  
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
      expect(panel, 'The overlay selection buttons are missing')
        .to.eventually.exist
  
  describe 'Image Control Panel', ->
    panel = null
  
    beforeEach ->
      panel = page.imageCtlPanel()
  
    it 'should display the image control panel', ->
      expect(panel, 'The image control panel is missing').to.eventually.exist
