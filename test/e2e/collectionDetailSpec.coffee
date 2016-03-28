#_ = require 'lodash'

#webdriver = require 'selenium-webdriver'

expect = require('./helpers/expect')()

Page = require './helpers/page'

describe 'E2E Testing Collection Detail', ->
class CollectionDetailPage extends Page
  constructor: ->
    super('/quip/breast?project=QIN_Test')

  # @returns the X-axis dropdown promise
  @property xAxisDropdowns: ->
    @findAll('.qi-x-axis-dropdown')

  # @returns the Y-axis dropdown promise
  @property yAxisDropdowns: ->
    @findAll('.qi-y-axis-dropdown')

  # @returns the correlation charts promise
  @property correlationCharts: ->
    @findAll('.qi-correlation-chart')

describe 'E2E Testing Collection', ->
  page = null

  before ->
    page = new CollectionDetailPage()

  it 'should load the page', ->
    expect(page.content, 'The page was not loaded')
      .to.eventually.exist

  # The page header test cases.
  describe 'Header', ->
    it 'should display the billboard', ->
      expect(page.billboard, 'The billboard is incorrect')
        .to.eventually.equal('Breast Collection')

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

    # The page main body test cases.
    describe 'Chart', ->
    	it 'should display the X-axis dropdowns', ->
        page.xAxisDropdowns.then (dropdowns) ->
          # The dropdowns exist.
          expect(dropdowns, 'The X-axis dropdowns are missing')
            .to.exist.and.not.be.empty
          # The dropdowns are displayed.
          for dropdown, i in dropdowns
            expect(dropdown.isDisplayed(),
                   "The X-axis dropdown #{ i } is initially hidden")
              .to.eventually.be.true

    	it 'should display the Y-axis dropdowns', ->
        page.yAxisDropdowns.then (dropdowns) ->
          # The dropdowns exist.
          expect(dropdowns, 'The Y-axis dropdowns are missing')
            .to.exist.and.not.be.empty
          # The dropdowns are displayed.
          for dropdown, i in dropdowns
            expect(dropdown.isDisplayed(),
                   "The Y-axis dropdown #{ i } is initially hidden")
              .to.eventually.be.true

      it 'should display the correlation charts', ->
        page.correlationCharts.then (charts) ->
          # The charts exist.
          expect(charts, 'The correlation charts are missing')
            .to.exist.and.not.be.empty
          # The charts are displayed.
          for chart, i in charts
            expect(chart.isDisplayed(),
                   "The correlation chart #{ i } is initially hidden")
              .to.eventually.be.true
