expect = require('./helpers/expect')()

Page = require './helpers/page'

class SlicePage extends Page
  constructor: ->
    super('/quip/sarcoma/subject/1/session/1/scan/1?project=QIN_Test')

  slicePanel: ->
    @find('#qi-slice-image')
  
  sliceControlPanel: ->
    @find('.qi-slice-ctrl-panel')

# TODO - timeout of 5000ms exceeded. Ensure the done() callback is being called
# in this test.
xdescribe 'E2E Testing Slice Display', ->
  page = null

  before ->
    page = new SlicePage

  it 'should load the page', ->
    expect(page.content, 'The page was not loaded')
      .to.eventually.exist
  
  # The page header test cases.
  describe 'Header', ->
    it 'should display the billboard', ->
      expect(page.billboard, 'The billboard is incorrect')
        .to.eventually.equal('Sarcoma Patient 1 Session 1 Scan 1 Time Series')
  
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
  
  describe 'Slice Display', ->
    panel = null
  
    beforeEach ->
      panel = page.slicePanel()
  
    it 'should display the slice', ->
      expect(panel, 'The slice panel is missing').to.eventually.exist

  describe 'Slice Control Panel', ->
    panel = null
  
    beforeEach ->
      panel = page.sliceControlPanel()
  
    it 'should display the slice control panel', ->
      expect(panel, 'The slice control panel is missing').to.eventually.exist
