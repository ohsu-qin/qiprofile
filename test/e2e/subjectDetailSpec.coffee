expect = require('./helpers/expect')()

Page = require('./helpers/page')()

class SubjectDetailPage extends Page
  # @returns the imaging table properties
  imagingTableProperties: ->
    button = this.select('.qi-modeling-profile button')
    button.click().then () ->
      this.select('.qi-modeling-profile .qi-modeling-list')
  
  # @returns whether the imaging profile list is displayed
  #   when the button is clicked
  canDisplayImagingProfileList: ->
    this.select('.qi-modeling-profile .qi-modeling-list').then (list) ->
      if list
        button = this.select('.qi-modeling-profile button')
        button.click().then ->
          list.isDisplayed()
      else
        false

  # @returns the line chart promise
  linechart: ->
    this.select('//qi-visit-dateline//nvd3-line-chart')

describe 'E2E Testing Subject Detail', ->
  page = null

  beforeEach ->
    page = new SubjectDetailPage '/quip/breast/subject/1?project=QIN_Test'
  
  it 'should display the billboard', ->
    expect(page.billboard).to.eventually.equal('Breast Patient 1')
  
  it 'should have a home button', ->
    pat = /.*\/quip\?project=QIN_Test$/
    expect(page.home()).to.eventually.match(pat)
  
  it 'should have help text', ->
    expect(page.hasHelp()).to.eventually.be.true
  
  describe 'Imaging Profile', ->
    # Note: this is as deep as the chart can be tested,
    # since the chart SVG content is not visible to the
    # tester, perhaps because the chart directive dynamically
    # inserts the SVG into the DOM, and the app directive
    # then further modifies it.
    it 'should display the dateline', ->
      expect(page.linechart()).to.eventually.exist
    
    it 'should display the imaging property list when the list button is clicked', ->
      expect(page.canDisplayImagingProfileList()).to.eventually.be.true
      # TODO - test the properties
      #actual = page.imagingProfileProperties()
      #expected = ...
      #expect(actual.to.eventually.eql(expected)
