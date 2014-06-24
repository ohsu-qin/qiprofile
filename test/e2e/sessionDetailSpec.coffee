_ = require 'lodash'

expect = require('./helpers/expect')()

Page = require('./helpers/page')()

class SessionDetailPage extends Page
  # @returns a promise resolving to a
  #   {download: button, display: button} object
  scanFirstImageButtons: ->
    div = element(By.repeater('image in session.scan.images').row(0))
    div.findElement(By.css('.glyphicon-download')).then (download) ->
      div.findElement(By.css('.glyphicon-eye-open')).then (display) ->
        download: download
        display: display

  # @returns the line chart promise
  chart: ->
    this.select('//qi-intensity-chart//nvd3-line-chart')

describe 'E2E Testing Session Detail', ->
  page = null

  beforeEach ->
    page = new SessionDetailPage '/quip/breast/subject/1/session/1?project=QIN_Test'
  
  it 'should display the billboard', ->
    expect(page.billboard).to.eventually.equal('Breast Patient 1 Session 1')
  
  it 'should have a home button', ->
    pat = /.*\/quip\?project=QIN_Test$/
    expect(page.home()).to.eventually.match(pat)
  
  it 'should have help text', ->
    expect(page.hasHelp()).to.eventually.be.true
  
  describe 'Intensity Chart', ->
    # Note - chart content is not testable. See the subjectDetailSpec note
    # for details.
    it 'should display the chart', ->
      expect(page.chart()).to.eventually.exist
  
  describe 'Image Selection', ->
    it 'should display the image selector buttons', ->
      validate = ->
        page.scanFirstImageButtons().then (buttons) ->
          _.has(buttons, 'download') and _.has(buttons, 'display')
      expect(validate()).to.eventually.be.true
