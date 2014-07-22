_ = require 'lodash'

expect = require('./helpers/expect')()

Page = require('./helpers/page')()

class SessionDetailPage extends Page
  # @returns a promise resolving to a
  #   {download: button, display: button} object
  firstScanImageButtons: ->
    div = element(By.repeater('image in session.scan.images').row(0))
    div.findElement(By.css('.glyphicon-download')).then (download) ->
      div.findElement(By.css('.glyphicon-eye-open')).then (open) ->
        download: download
        open: open
  
  # Loads the image by clicking the given download button.
  #
  # @param button the image download button
  # @return a promise that resolves when either the button is hidden
  #   or app. 450 milliseconds has expired
  loadScanImage: (button) ->
    # Sleep 50 milliseconds and then invoke the async callback
    # (cf. https://github.com/angular/protractor/blob/master/docs/api.md#api-webdriver-webdriver-prototype-executeasyncscript).
    SLEEP = 'window.setTimeout(arguments[arguments.length - 1], 50);'

    # Sit and spin until either the given button is hidden or
    # almost half a second has expired.
    #
    # @param button the scan image download button
    # @param retry the number of times to retry (default 8)
    # @return a promise that resolves when either the button
    #   is hidden or the retry limit is reached
    waitWhileVisible = (button, retry) ->
      # The silly Javascript idiom to check for an unset variable.
      if typeof retry is 'undefined'
        retry = 8
      if retry
        # Wait a while, then check if the button is visible.
        browser.executeAsyncScript(SLEEP).then ->
          button.isDisplayed().then (visible) ->
            if visible
              # Try again. Note: this recursion is pushed onto the stack,
              # but no more than eight times.
              waitWhileVisible(button, retry - 1)
    
    button.click().then =>
      waitWhileVisible(button)
  
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
    expect(page.help()).to.eventually.exist
  
  describe 'Intensity Chart', ->
    # Note - chart content is not testable. See the subjectDetailSpec note
    # for details.
    it 'should display the chart', ->
      expect(page.chart()).to.eventually.exist

    it 'should load the image', ->
      # Note: this test depends on the existence of the first session
      # scan image in the _public/data subdirectory. This file is created
      # by the seed helper function set in the protractor config.
      page.firstScanImageButtons().then (buttons) ->
        # The download/display button pair.
        download = buttons.download
        expect(download).to.exist
        expect(download.isDisplayed()).to.eventually.be.true
        open = buttons.open
        expect(open).to.exist
        expect(open.isDisplayed()).to.eventually.be.false
        # Click the button, then wait for it to load.
        page.loadScanImage(download).then ->
          expect(download.isDisplayed()).to.eventually.be.false
          expect(open.isDisplayed()).to.eventually.be.true
