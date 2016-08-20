expect = require('../testing/expect')()

Page = require '../testing/page'

###*
 * The Volume Detail E2E page encapsulation.
 *
 * @module volume
 * @class VolumeDetailPage
 * @extends Page
###
class VolumeDetailPage extends Page
  constructor: ->
    super('/qiprofile/QIN_Test/Breast/subject/1/session/1/scan/1/volumes;volume=1')

  # Volume display panel.
  imagePanel: ->
    @find('qi-volume-image')

# Enable the describe below to enable XTK.
describe.only 'E2E Testing Volume Display', ->
  page = null

  before ->
    page = new VolumeDetailPage

  it 'should load the page', ->
    expect(page.content, 'The page was not loaded')
      .to.eventually.exist
  
  # The page header test cases.
  describe 'Header', ->
    it 'should display the billboard', ->
      expect(page.billboard, 'The billboard is incorrect')
        .to.eventually.equal('Breast Patient 1 Session 1 Scan 1 Volume 1')
  
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
      panel = page.imagePanel()
  
    it 'should display the image', ->
      expect(panel, 'The image panel is missing').to.eventually.exist

  xdescribe 'Volume Chooser', ->
    panel = null
  
    beforeEach ->
      panel = page.volumeChooser()
  
    it 'should display the volume chooser', ->
      expect(panel, 'The volume chooser is missing').to.eventually.exist
