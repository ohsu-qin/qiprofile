_ = require 'lodash'

webdriver = require 'selenium-webdriver'

expect = require('./helpers/expect')()

Page = require './helpers/page'

class CollectionDetailPage extends Page
  constructor: ->
    super('/quip/breast?project=QIN_Test')

  # @returns a promise which resolves to the subject table
  #   ElementFinder
  @property subjectTable: ->
    @find('#qi-subject-table')

  # @returns a promise which resolves to the subject chart
  #   ElementFinder
  @property subjectChart: ->
    @find('#qi-subject-chart')

  # @returns the subject table group promise
  @property subjectTableGroups: ->
    @findAll('.dc-table-label')

  # @returns the subject table column promise
  @property subjectTableColumns: ->
    @findAll('.dc-table-column')

  # @returns the collection charts promise
  @property collectionCharts: ->
    @findAll('.qi-collection-chart')

  # @returns the X-axis dropdown promise
  @property xAxisDropdowns: ->
    @findAll('.qi-x-axis-dropdown')

  # @returns the Y-axis dropdown promise
  @property yAxisDropdowns: ->
    @findAll('.qi-y-axis-dropdown')

describe 'E2E Testing Collection Detail', ->
  page = null

  before ->
    page = new CollectionDetailPage

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
  describe 'Charts', ->
    it 'should display the subject table', ->
      page.subjectTable.then (table) ->
        expect(table.isDisplayed(), 'The subject table is missing')
          .to.eventually.exist

    it 'should display a subject', ->
      page.subjectTableGroups.then (subjects) ->
        subj = _.first(subjects)
        expect(subj.text(), 'The chart table does not display a' +
                                   ' subject')
          .to.eventually.include('Patient')

    it 'should display a session', ->
      page.subjectTableColumns.then (sessions) ->
        sess = _.first(sessions)
        expect(sess.text(), 'The chart table does not display a ' +
                                   ' session')
          .to.eventually.include('Visit')

    it 'should display the subject chart', ->
      page.subjectChart.then (chart) ->
        expect(chart.isDisplayed(), 'The subject chart is missing')
          .to.eventually.exist

    it 'should display four data charts', ->
      page.collectionCharts.then (charts) ->
        expect(charts.length, 'The data chart count is incorrect')
          .to.equal(4)

    it 'should display four X-axis dropdowns', ->
      page.xAxisDropdowns.then (dropdowns) ->
        expect(dropdowns.length, 'The X-axis dropdown count is incorrect')
          .to.equal(4)

    it 'should display the X-axis dropdown items', ->
      page.xAxisDropdowns.then (dropdowns) ->
        dropdown = _.first(dropdowns)
        # Show the dropdown.
        dropdown.click()
        # The default selection for the first chart is 'RCB Index'.
        dropdown.find(By.css('.qi-dropbtn-label')).then (selected) ->
          expect(selected.text(), 'The default X-axis selection is incorrect')
            .to.eventually.equal('RCB Index')
        # The first item in the dropdown is 'FXL Ktrans'.
        dropdown.findAll(By.css('.qi-dropdown-item')).then (items) ->
          item = _.first(items)
          item.find(By.css('.qi-dropdown-label')).then (label) ->
            expect(label.text(), 'The first item in the X-axis dropdown is' +
                                 ' incorrect')
              .to.eventually.equal('FXL Ktrans')

    it 'should display four Y-axis dropdowns', ->
      page.yAxisDropdowns.then (dropdowns) ->
        expect(dropdowns.length, 'The Y-axis dropdown count is incorrect')
          .to.equal(4)

    it 'should display the Y-axis dropdown items', ->
      page.yAxisDropdowns.then (dropdowns) ->
        dropdown = _.first(dropdowns)
        # Show the dropdown.
        # TODO - the following tests began failing with the message:
        #    UnknownError: unknown error: Element is not clickable at point (120, 318). Other element would receive the click:
        #    <div ng-repeat="(key,val) in choices.x" ng-model="chartAxes.x" ng-click="chartAxes.x=key"
        #    class="qi-dropdown-item ng-pristine ng-untouched ng-valid ng-scope">...</div>
        #  Enable this test case and resolve this error.
        #
        dropdown.click()
        # The default selection of the first chart is 'delta Ktrans'.
        dropdown.find(By.css('.qi-dropbtn-label')).then (selected) ->
          expect(selected.text(), 'The default Y-axis selection is incorrect')
            .to.eventually.equal('delta Ktrans')
        # The first item in the dropdown is 'FXL Ktrans'.
        dropdown.findAll(By.css('.qi-dropdown-item')).then (items) ->
          item = _.first(items)
          item.find(By.css('.qi-dropdown-label')).then (label) ->
            expect(label.text(), 'The first item in the Y-axis dropdown is' +
                                 ' incorrect')
              .to.eventually.equal('FXL Ktrans')
          # TNM stage is a categorical data series and is not included in the
          # Y-axis choices.
          for item in items
            item.find(By.css('.qi-dropdown-label')).then (label) ->
              expect(label.text(), 'TNM stage appears in the Y-axis dropdown')
                .to.eventually.not.equal('TNM Stage')
