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
    @find('qi-volume-image')

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
  xdescribe 'Image Display', ->
    pane = null

    beforeEach ->
      # Wrap the panel resolver in a retry loop, since it might
      # take a while for the image to load and the pane to display.
      # Furthermore, wrap the retry argument in a function, since
      # the then loses the self context.
      pane = promiseRetry(-> page.imagePanel())

    it 'should display the image', ->
      expect(pane, 'The image panel is missing').to.eventually.exist

  # Verify the volume chooser heading. We can only detect the
  # volume slider and player.
  #
  # TODO - see ImageDisplay TODO.
  xdescribe 'Time Point Chooser', ->
    chooser = null

    beforeEach ->
      page.timePointChooser().then (resolved) ->
        chooser = resolved

    it 'should display the volume chooser', ->
      expect(chooser, 'The chooser is missing').to.exist

    it 'should display the volume chooser heading', ->
      # The heading is the first row.
      heading = chooser.findAll('.row').then (rows) ->
        rows[0].text()
      expect(heading, 'The chooser heading is missing')
        .to.eventually.exist
      expect(heading, 'The chooser heading is incorrect')
        .to.eventually.equal('Time Point')

    it 'should display the volume chooser slider', ->
      slider = chooser.find('.qi-vertical-slider')
      expect(slider, 'The chooser slider is missing')
        .to.eventually.exist

    it 'should display the volume chooser player', ->
      chooser.find('.qi-volume-player').then (player) ->
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

  # TODO - see ImageDisplay TODO.
  # TODO - flush out once previous TODO is addressed.
  xdescribe 'Session Chooser', ->
    chooser = null

    beforeEach ->
      page.volumeChooser().then (resolved) ->
        chooser = resolved

    it 'should display the session chooser', ->
      expect(chooser, 'The session chooser is missing').to.eventually.exist

    it 'should display the session chooser heading', ->
      heading = chooser.text('.qi-session-chooser-heading')
      expect(heading, 'The session chooser heading is missing')
        .to.eventually.exist
      expect(heading, 'The session chooser heading is incorrect')
        .to.eventually.equal('Session')
