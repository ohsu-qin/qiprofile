expect = require('./helpers/expect')()

Page = require './helpers/page' 

class SessionDetailPage extends Page
  # Note: this function should return a promise, but for an unknown
  # reason the return value is the resolved object instead.
  #
  # @param number the volume number
  # @returns the {download: ElementFinder, display: ElementFinder}
  #   associative object, where each ElementFinder resolves
  #   to the respective button
  scanImageButtons: (number) ->
    # The locator for the image select button group element.
    # Since the tvolume number is one-based, the zero-based
    # image select index is one less than the volume number.
    locator = By.repeater('volume in scan.volumes').row(number - 1)
    # Find the image select button group element, then...
    @find(locator).then (elt) ->
      if elt
        # ...make an associative object which references the
        # button ElementFinders.
        download: elt.element(By.css('.glyphicon-download'))
        open: elt.element(By.css('.glyphicon-eye-open'))
        failed: elt.element(By.css('.glyphicon-exclamation-sign'))

  # Loads the image by clicking the given download button.
  #
  # @param button the image download button
  # @returns a promise that resolves when either the button is hidden
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
    # @returns a promise that resolves when either the button
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
  # The Sarcoma001 Session01 volume number for which there is a test
  # fixture scan image file. The seed helper function called from the
  # protractor config links _public/data to the test fixture data
  # directory.
  TEST_VOL_NBR = 20
  # A Sarcoma001 Session01 volume number for which a test fixture scan
  # image file is missing.
  MISSING_TEST_VOL_NBR = 1

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
    pat = /a href="http:\/\/qiprofile\.idea\.informer\.com"/
    expect(page.contactInfo, 'The email address is missing')
      .to.eventually.match(pat)

  describe 'Intensity Chart', ->
    # Note: chart content is not testable. See the subjectDetailSpec note
    # for details.
    #
    # Note: this test case results in the following benign error message:
    #     Client error: Error: [$compile:tpload] Failed to load template: /partials/intensity-chart.html
    # The log messages are not informative. However, the error is ignored
    # and tests succeed. The error does not occur for a browser load.
    # TODO - find a way to isolate and correct this problem.
    # 
    it 'should display the chart', ->
      expect(page.chart(), 'The chart is not displayed').to.eventually.exist

    it 'should load the image', ->
      # Find the download/display button pair, then...
      #
      # Work around the anomaly described in the scanImageButtons function.
      #page.scanImageButtons(TEST_VOL_NBR).then (btnGroup) ->
        btnGroup = page.scanImageButtons(TEST_VOL_NBR)
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

    # TODO - Add a test to verify that an alert box is opened when a link for
    #   a missing image is clicked. Currently the opening of an alert box stops
    #   Protractor, with no apparent easy workaround.
    #
    # it 'should display an alert box', ->
    #   page.scanImageButtons(MISSING_TEST_VOL_NBR).then (btnGroup) ->
    #     btnGroup = page.scanImageButtons(MISSING_TEST_VOL_NBR)
    #     download = btnGroup.download
    #
    #     page.loadScanImage(download).then ->
    #       expect(download.isDisplayed(), 'The download button is displayed after download')
    #         .to.eventually.be.false
    #       expect(failed.isDisplayed(), 'The exclamation sign icon is hidden after download failed')
    #         .to.eventually.be.true
