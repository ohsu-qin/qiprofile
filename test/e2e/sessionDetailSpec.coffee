expect = require('./helpers/expect')()

Page = require './helpers/page'

class SessionDetailPage extends Page
  constructor: ->
    super('/quip/sarcoma/subject/1/session/1?project=QIN_Test')

  # @return the line chart promise
  @property chart: ->
    # Perform a XSL search for the chart element.
    @find('//div[@ng-controller="IntensityChartCtrl"]')

  # @param number the volume number
  # @return the {download: ElementFinder, display: ElementFinder}
  #   associative object, where each ElementFinder resolves
  #   to the respective button
  scanImageButtons: (number) ->
    # The locator for the image select button group element.
    # Since the tvolume number is one-based, the zero-based
    # image select index is one less than the volume number.
    locator = By.repeater('volume').row(number - 1)
    # Find the image select button group element, then...
    @find(locator).then (elt) ->
      if elt?
        # ...make an associative object which references the
        # button ElementFinders.
        download: elt.find('.glyphicon-download')
        open: elt.find('.glyphicon-eye-open')
        failed: elt.find('.glyphicon-exclamation-sign')
      else
        elt

  # Loads the image by clicking the given download button.
  #
  # @param button the image download button
  # @return a promise that resolves to true if the button
  #   is eventually hidden on image load or false if roughly
  #   one second has expired
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
    # @return a promise that resolves to true if the button
    #   is hidden or false if the retry limit is reached
    waitWhileVisible = (button, retry=10) ->
      # Wait a while, then check if the button is visible.
      browser.executeAsyncScript(SLEEP).then ->
        button.isDisplayed().then (visible) ->
          if visible
            # Decrement the retry count and try again.
            # Note: this recursion is pushed onto the stack,
            # but no more times than the initial retry count.
            if retry
              waitWhileVisible(button, retry - 1)
            else
              false
          else
            true


    # Click the button and wait until it is hidden.
    button.click().then ->
      waitWhileVisible(button)


describe 'E2E Testing Session Detail', ->
  # The Sarcoma001 Session01 volume number for which there is a test
  # fixture scan image file. The seed helper function called from the
  # protractor config links public/data to the test fixture data
  # directory.
  TEST_VOL_NBR = 20
  # A Sarcoma001 Session01 volume number for which a test fixture scan
  # image file is missing.
  MISSING_TEST_VOL_NBR = 1

  page = null

  beforeEach ->
    page = new SessionDetailPage

  it 'should load the page', ->
    expect(page.content, 'The page was not loaded')
      .to.eventually.exist

  # The page header test cases.
  describe 'Header', ->
    it 'should display the billboard', ->
      expect(page.billboard, 'The billboard is incorrect')
        .to.eventually.equal('Sarcoma Patient 1 Session 1')

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

  describe 'Intensity Chart', ->
    # Note: chart content is not testable. See the subjectDetailSpec note
    # for details.
    it 'should display the chart', ->
      expect(page.chart, 'The chart is not displayed').to.eventually.exist

    it 'should load the image', ->
      # Find the download/display button pair, then...
      page.scanImageButtons(TEST_VOL_NBR).then (btnGroup) ->
        # The open button should be hidden.
        btnGroup.open.then (open) ->
          expect(open, 'The Open button is missing').to.exist
          expect(open.isDisplayed(), 'The Open button is initially hidden')
            .to.eventually.be.true

        # FIXME - load is broken after the volume/slice refactoring and
        #   XTK removal.
        # TODO - if XTK is resurrected, then restore and fix. Otherwise,
        #   change to a time series load and volume prep, then enable all
        #   open buttons when loaded.
        #
        # # Get the download button, then...
        # btnGroup.download.then (download) ->
        #   # Click the download button and wait for the image to load, then...
        #   page.loadScanImage(download).then (loaded) ->
        #     expect(loaded, 'The Download button is still displayed a second' +
        #                    ' after being clicked')
        #       .to.be.true
        #     # The open button should be displayed.
        #     btnGroup.open.then (open) ->
        #       expect(open.isDisplayed(), 'The Open button is hidden after' +
        #                                  ' download')
        #         .to.eventually.be.true

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
