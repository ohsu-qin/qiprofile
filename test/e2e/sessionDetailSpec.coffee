_ = require 'lodash'

expect = require('./helpers/expect')()

Page = require './helpers/page' 

class SessionDetailPage extends Page
  # @param time_point the time point
  # @returns a promise resolving to the given time point
  #   {download: ElementFinder, display: ElementFinder}
  #   associative object, where each ElementFinder resolves
  #   to the respective button
  scanImageButtons: (time_point) ->
    # The locator for the image select button group element.
    # Since the time point is one-based, the zero-based image
    # select index is one less than the time point.
    locator = By.repeater('image in session.scans.t1.images').row(time_point - 1)

    # Find the image select button group element, then...
    @find(locator).then (div) ->
      # ...return the associative object which contains the
      # both button ElementFinders.
      download: div.element(By.css('.glyphicon-download'))
      open: div.element(By.css('.glyphicon-eye-open'))

  # Loads the image by clicking the given download button.
  #
  # @param button the image download button
  # @return a promise that resolves when either the button is hidden
  #   or roughly one second has expired
  loadScanImage: (button) ->
    # Sleep 1/10 of a second and then invoke the async callback
    # (cf. https://github.com/angular/protractor/blob/master/docs/api.md#api-webdriver-webdriver-prototype-executeasyncscript).
    SLEEP = 'window.setTimeout(arguments[arguments.length - 1], 100);'

    # Sit and spin until either the given button is hidden or
    # sufficient time has transpired.
    #
    # @param button the scan image download button
    # @param retry the maximum number of times to reiterate
    #   until the image is loaded (default 10)
    # @return a promise that resolves when either the button
    #   is hidden or the retry limit is reached
    waitWhileVisible = (button, retry=10) ->
      if retry
        # Wait a while, then check if the button is visible.
        browser.executeAsyncScript(SLEEP).then ->
          button.isDisplayed().then (visible) ->
            if visible
              # Decrement the retry count and try again.
              # Note: this recursion is pushed onto the stack,
              # but no more times than the initial retry count.
              waitWhileVisible(button, retry - 1)

    # Click the button and wait until it is hidden.
    button.click().then ->
      waitWhileVisible(button)

  # @returns the line chart promise
  chart: ->
    @find('//qi-intensity-chart//nvd3-line-chart')

describe 'E2E Testing Session Detail', ->
  # The Sarcoma001 Session01 time point 20. This is the time point for
  # which there is a test fixture scan image file. The seed helper
  # function called from the protractor config links the test fixture
  # data directory to _public/data subdirectory.
  TEST_TIME_POINT = 20

  page = null

  beforeEach ->
    page = new SessionDetailPage '/quip/sarcoma/subject/1/session/1?project=QIN_Test'

  it 'should load the page', ->
    expect(page.content, 'The page was not loaded')
      .to.eventually.exist

  it 'should display the billboard', ->
    expect(page.billboard, 'The billboard is incorrect')
      .to.eventually.equal('Sarcoma Patient 1 Session 1')

  it 'should have a home button', ->
    pat = /.*\/quip\?project=QIN_Test$/
    expect(page.home, 'The home URL is incorrect').to.eventually.match(pat)

  it 'should have help text', ->
    expect(page.help, 'The help is missing').to.eventually.exist

  it 'should display a contact email link', ->
    pat = /a href="mailto:\w+@ohsu.edu"/
    expect(page.contactInfo, 'The email address is missing')
      .to.eventually.match(pat)

  describe 'Intensity Chart', ->
    # Note: chart content is not testable. See the subjectDetailSpec note
    # for details.
    it 'should display the chart', ->
      expect(page.chart(), 'The chart is not displayed').to.eventually.exist

    it 'should load the image', ->
      # Find the download/display button pair, then...
      page.scanImageButtons(TEST_TIME_POINT).then (btnGroup) ->
        # The download button should be displayed.
        download = btnGroup.download
        expect(download.isDisplayed(), 'The download button is initially hidden')
          .to.eventually.be.true

        # The open button should be hidden.
        open = btnGroup.open
        expect(open.isDisplayed(), 'The open button is initially displayed')
          .to.eventually.be.false

        # Click the download button, wait for the image to load, then...
        page.loadScanImage(download).then ->
          # The download button should now be hidden.
          expect(download.isDisplayed(), 'The download button is displayed after download')
            .to.eventually.be.false
          # The open button should be displayed.
          expect(open.isDisplayed(), 'The open button is hidden after download')
            .to.eventually.be.true
