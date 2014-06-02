expect = require('./helpers/expect')()

Page = require('./helpers/page')()

# Wrapper for the fetched page.
class SeriesDetailPage extends Page
  imageElement: () ->
    this.select('.qi-series-image')

describe 'E2E Testing Series Detail', ->
    
  describe 'Scan', ->
    # The fetched page.
    page = null
    
    beforeEach ->
      page = new SeriesDetailPage('/quip/breast/subject/1/session/1/scan/series/1?project=QIN_Test')

    it 'should display the billboard', ->
      expect(page.billboard).to.eventually.equal('Breast Patient 1 Session 1 Scan Series 1')

    it 'should contain the image element', ->
      expect(page.imageElement()).to.eventually.exist

    it 'should render the image', ->
      expect(false).to.be.true
