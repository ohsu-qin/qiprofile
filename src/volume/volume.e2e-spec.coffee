_ = require('lodash')
promiseRetry = require('../testing/promise-retry')

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
    @find('qi-image')

  # The time point slider-player combo.
  timePointChooser: ->
    @find('.qi-volume-chooser-left')

  # The session slider-player combo.
  sessionChooser: ->
    @find('.qi-volume-chooser-right')

describe 'E2E Testing Volume Display', ->
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

  # Since the image display is opaque to Protractor, we can
  # only test its presence.
  #
  # Untestable because of the load delay. The retry business below
  # doesn't work either.
  #
  # TODO - revisit in 2017 after Angular 2 testing is clarified (as if).
  #   See also tests below.
  describe 'Image Display', ->
    panel = null

    beforeEach ->
      panel = page.imagePanel()

    it 'should display the image', ->
      expect(panel, 'The image panel is missing').to.eventually.exist

  # Verify the volume chooser heading. We can only detect the
  # volume slider and player.
  #
  # TODO - see ImageDisplay TODO.
  describe 'Time Point Chooser', ->
    chooser = null

    beforeEach ->
      chooser = page.timePointChooser()

    # Oddly, this simple existence test fails but the following
    # tests which use the chooser succeed.
    # TODO - reinvestigate this anomaly.
    xit 'should display the volume chooser', ->
      expect(chooser, 'The chooser is missing').to.eventually.exist

    it 'should display the volume chooser heading', ->
      # The heading is the first row.
      heading = chooser
        .then (resolved) ->
          resolved.findAll('.row')
        .then (rows) ->
          rows[0].text()
      expect(heading, 'The chooser heading is missing')
        .to.eventually.exist
      expect(heading, 'The chooser heading is incorrect')
        .to.eventually.equal('Time Point')

    it 'should display the volume chooser slider', ->
      slider = chooser.then (resolved) ->
        resolved.find('.qi-vertical-slider')
      expect(slider, 'The chooser slider is missing')
        .to.eventually.exist

    it 'should display the volume chooser player', ->
      chooser
        .then (resolved) ->
          resolved.find('qi-player')
        .then (player) ->
          expect(player, 'The player is missing').to.exist
          player.findAll('button').then (buttons) ->
            expect(buttons, 'The player buttons are missing')
              .to.not.be.empty
            expect(buttons.length, 'The player buttons count is incorrect')
              .to.equal(3)
            [previous, play, next] = buttons
            next.click().then ->
              expect(page.billboard, 'The next button did not change the billboard')
                .to.eventually.equal('Breast Patient 1 Session 1 Scan 1 Volume 2')
              previous.click().then ->
                expect(page.billboard, 'The previous button did not change the billboard')
                  .to.eventually.equal('Breast Patient 1 Session 1 Scan 1 Volume 1')

  # TODO - flush out this test similar to the Time Point chooser test.
  xdescribe 'Session Chooser', ->
    chooser = null

    beforeEach ->
      chooser = page.sessionChooser()
