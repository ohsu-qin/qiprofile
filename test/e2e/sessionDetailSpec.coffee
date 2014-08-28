_ = require 'lodash'

expect = require('./helpers/expect')()

Page = require('./helpers/page')()

class SessionDetailPage extends Page
  # @returns a promise resolving to the given time point
  #   {download: button, display: button} object
  #
  # @param time_point the time point
  scanImageButtons: (time_point) ->
    # Since the time point is one-based, the zero-based image select
    # index is one less than the time point.
    div = element(By.repeater('image in session.scan.images').row(time_point - 1))
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
  # The Sarcoma001 Session01 time point 21. This is the time point for
  # which there is a test fixture scan image file. The seed helper
  # function called from the protractor config links the test fixture
  # data directory to _public/data subdirectory.
  TEST_TIME_POINT = 21
  
  page = null

  beforeEach ->
    page = new SessionDetailPage '/quip/sarcoma/subject/1/session/1?project=QIN_Test'
  
  it 'should display the billboard', ->
    expect(page.billboard, 'The billboard is incorrect')
      .to.eventually.equal('Sarcoma Patient 1 Session 1')
  
  it 'should have a home button', ->
    pat = /.*\/quip\?project=QIN_Test$/
    expect(page.home(), 'The home URL is incorrect').to.eventually.match(pat)
  
  it 'should have help text', ->
    expect(page.help(), 'The help is missing').to.eventually.exist
  
  describe 'Intensity Chart', ->
    # Note - chart content is not testable. See the subjectDetailSpec note
    # for details.
    it 'should display the chart', ->
      expect(page.chart(), 'The chart is not displayed').to.eventually.exist

    it 'should load the image', ->
      page.scanImageButtons(TEST_TIME_POINT).then (buttons) ->
        # The download/display button pair.
        download = buttons.download
        expect(download, 'The download button is initially missing').to.exist
        expect(download.isDisplayed(), 'The download button is initially hidden')
          .to.eventually.be.true
        open = buttons.open
        expect(open, 'The open button is initially missing').to.exist
        expect(open.isDisplayed(), 'The open button is initially displayed')
          .to.eventually.be.false
        # Click the button, then wait for it to load.
        page.loadScanImage(download).then ->
          expect(download.isDisplayed(), 'The download button is displayed after download')
            .to.eventually.be.false
          expect(open.isDisplayed(), 'The open button is hidden after download')
            .to.eventually.be.true
