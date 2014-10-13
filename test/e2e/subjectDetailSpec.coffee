_ = require 'lodash'

expect = require('./helpers/expect')()

Page = require('./helpers/page')()

class SubjectDetailPage extends Page
  # Finds the profile table WebElements for the given CSS style.
  # The return value is an array of table body promises. Each table
  # body promise resolves to an array of row promises. Each row
  # promise resolves to an array of column text promises.
  #
  # If the function argument is provided, then it is applied to
  # each table cell text value promise.
  #
  # Example:
  # page.profileTablesForCss 'qi-clinical-table', (text) ->
  #   expect(text).to.eventually.exist
  #
  # @param style the Page.select() search selector
  # @param fn the optional function to apply to each table cell
  #   text value
  profileTablesForCss: (selector, fn) ->
    tables = (panel) ->
      panel.all(By.tagName('tbody'))
    
    rows = (table) ->
      table.all(By.tagName('tr'))
    
    columns = (row) ->
      row.all(By.tagName('td'))

    text = (col) ->
      col.getText().then (text) ->
        fn(text) if text? and fn?
        text
    
    mapTables = (panel) ->
      tables(panel).map(mapTable)

    mapTable = (table) ->
      rows(table).map(mapRow)

    mapRow = (row) ->
      columns(row).map(text)
    
    @select(selector)
      .then(mapTables)

  # @param fn optional function to apply to the resolved button
  #   ElementFinder
  # @returns a promise which resolves to the image profile button
  #   ElementFinder
  imageProfileFormatButton: (fn) ->
    @select('.qi-modeling-profile button').then (button) ->
      fn(button) if button? and fn?
      button
  
  # Finds the imaging profile table WebElements.
  # See profileTablesForCss.
  #
  # @param fn optional function to run on the resolved tables
  # @returns the imaging profile tables promise
  imagingProfileTables: (fn) ->
    click = (button) ->
      button.click()

    tables = =>
      @profileTablesForCss('qi-modeling-table', fn)

    # Click the imaging profile format button to show the imaging
    # profile tables.
    @imageProfileFormatButton()
      .then(click)
      .then(tables)
  
  # Finds the imaging profile table panel WebElement.
  #
  # @param fn optional function to run on the resolved panel
  # @returns the imaging profile table panel promise
  imagingProfileTablePanel: (fn) ->
    @select('qi-modeling-table').then (panel) ->
      fn(panel) if panel? and fn?
      panel
  
  # Finds the clinical profile table WebElements.
  # See profileTablesForCss.
  #
  # @param fn optional function to run on the resolved tables
  # @returns the clinical profile tables promise
  clinicalProfileTables: (fn) ->
    # Note: a version of this with the all function fails, e.g.:
    #   element(By.css()).all(...)
    # results in:
    #   TypeError: Object #<Object> has no method 'all'
    @profileTablesForCss('qi-clinical-table', fn)

  # @param fn optional function to run on the resolved tables
  modelingChart: (fn) ->
    @select('#qi-modeling-chart').then (chart) ->
      fn(chart) if chart? and fn?
      chart
  
  # @param fn optional function to run on the resolved chart
  # @returns the line chart promise
  lineChart: (fn) ->
    this.select('//qi-visit-dateline//nvd3-line-chart').then (chart) ->
      fn(chart) if chart? and fn?
      chart

describe 'E2E Testing Subject Detail', ->
  page = null
  
  before ->
    page = new SubjectDetailPage '/quip/breast/subject/1?project=QIN_Test'
  
  # The page header test cases.
  describe 'Header', ->
    it 'should display the billboard', ->
      expect(page.billboard, 'The billboard is incorrect').to.eventually.equal('Breast Patient 1')
  
    it 'should have a home button', ->
      pat = /.*\/quip\?project=QIN_Test$/
      expect(page.home(), 'The home URL is incorrect').to.eventually.match(pat)
  
    it 'should have help text', ->
      expect(page.help(), 'The help is missing').to.eventually.exist
  
  # The page main body test cases.
  describe 'Imaging Profile', ->
    chart = null
    table = null
    
    before ->
      page.modelingChart().then (elt) ->
        chart = elt
      table = page.imagingProfileTablePanel().then (elt) ->
        table = elt
    
    describe 'Dateline', ->
      # Note: this is as deep as the chart can be tested,
      # since the chart SVG content is not visible to the
      # tester, perhaps because the chart directive dynamically
      # inserts the SVG into the DOM, and the app directive
      # then further modifies it.
      it 'should exist', ->
        expect(page.lineChart(), 'The dateline is missing').to.eventually.exist
    
    describe 'Format Button', ->
      it 'should toggle the chart/table display', ->
        page.imageProfileFormatButton().then (button) ->
          # The format button exists.
          expect(button, 'The imaging profile format button is missing')
            .to.exist
          # When the button is clicked, then the imaging profile table
          # panel is displayed.
          button.click().then ->
            table.isDisplayed().then (displayed) ->
              expect(displayed, 'The modeling table panel is hidden after the' +
                                ' format button is clicked').to.be.true
            # The chart is hidden.
            chart.isDisplayed().then (displayed) ->
              expect(displayed, 'The modeling chart is displayed after the' +
                                ' format button is clicked').to.be.false
            # When the button is clicked again, then the table is hidden and
            # the chart is displayed.
            button.click().then ->
              table.isDisplayed().then (displayed) ->
                expect(displayed, 'The modeling table panel is displayed' +
                                  ' after the format button is clicked twice')
                  .to.be.false
    
    describe 'Chart', ->
      it 'should display the imaging chart', ->
        # The chart exists.
        expect(chart, 'The modeling chart is missing').to.eventually.exist
        # The chart is displayed.
        chart.isDisplayed().then (displayed) ->
          expect(displayed, 'The modeling chart is initially hidden')
            .to.be.true
      
    describe 'Table', ->
      it 'should hide the table', ->
        # The modeling tables panel exists.
        expect(table, 'The modeling table panel is missing').to.eventually.exist
        # The panel is hidden.
        table.isDisplayed().then (displayed) ->
          expect(displayed, 'The modeling table is initially displayed')
            .to.be.false
      
      describe 'Properties', ->
        tables = null
        
        before ->
          page.imagingProfileTables().then (elt) ->
            tables = elt
        
        it 'should show the imaging properties when the format button is clicked', ->
          # There are three imaging profile tables, one for each
          # PK modeling property.
          expect(tables.length, 'The imaging profile table count is incorrect')
            .to.equal(3)
        
        it 'should have four Breast patient visits', ->
          for table, tblNdx in tables
            # There are four Breast patient visits.
            expect(table.length, "Table #{ tblNdx + 1 } row count is incorrect")
              .to.equal(4)
        
        it 'should show the visit dates', ->
          # The expected visit dates are the first column of the first table.
          expected = ((_.first(columns) for columns in _.first(tables)))
          # The date values for every remaining table should be
          # consistent with those of the first table.
          for table, tblNdx in _.rest(tables)
            for columns, rowNdx in table
              visitDate = _.first(columns)
              expect(visitDate, "The table #{ tblNdx + 2 } visit date is incorrect")
                .to.equal(expected[rowNdx])
        
        it 'should have seven Ktrans table columns', ->
          # The KTrans table is the first table.
          table = _.first(tables)
          for row, rowNdx in table
            expect(row.length, "The Ktrans table row #{ rowNdx + 1 } column" +
                              " count is incorrect").to.equal(7)
        
        it 'should have three non-Ktrans table columns', ->
          # The KTrans table is the first table.
          tables = _.rest(tables)
          for table, tblNdx in tables
            for row, rowNdx in table
              expect(row.length, "The table #{ tblNdx + 2 } row #{ rowNdx + 1 }" +
                                 " column count is incorrect").to.equal(3)
        
        it 'should not have a blank non-percent change value', ->
          for rows, tblNdx in tables
            for columns, rowNdx in rows
              # The odd columns hold non-percent change values.
              for colNdx in _.range(1, columns.length, 2)
                value = columns[colNdx]
                expect(value, "Imaging Profile table #{ tblNdx + 1 } body" +
                              " row #{ rowNdx + 1 } percent change column" +
                              " #{ colNdx + 1 } is not blank").to.not.be.empty
        
        it 'should have blank percent values in the first row', ->
          for rows, tblNdx in tables
            columns = _.first(rows)
            # The percent change is in the third, fifth and seventh column.
            # The percent changes of the first row are blank.
            # The odd columns hold non-percent change values.
            for colNdx in _.range(2, columns.length, 2)
              value = columns[colNdx]
              expect(value, "Imaging Profile table #{ tblNdx + 1 } body" +
                            " row 0 percent change column #{ colNdx + 1 }" +
                            " is not blank").to.be.empty
        
        it 'should not have a blank percent value in the remaining rows', ->
          for rows, tblNdx in tables
            for columns, rowNdx in _.rest(rows)
              for colNdx in _.range(2, columns.length, 2)
                value = columns[colNdx]
                expect(value, "Imaging Profile table #{ tblNdx + 1 } body" +
                              " row #{ rowNdx + 2 } percent change column" +
                              " #{ colNdx + 1 } is blank").to.not.be.empty

  describe 'Clinical Profile', ->
      describe 'Demographics', ->
        # Demographics is collection-independent.
        beforeEach ->
          page = new SubjectDetailPage '/quip/breast/subject/1?project=QIN_Test'
        
        it 'should show the demographics table', ->
          page.clinicalProfileTables().then (tables) ->
            # Validate the demographics values.
      
    
      describe 'Outcomes', ->
        describe 'Breast', ->
          beforeEach ->
            page = new SubjectDetailPage '/quip/breast/subject/1?project=QIN_Test'
    
          describe 'Biopsy', ->
            # TODO - Add test cases for the date and every outcome table.
    
          describe 'Assessment', ->
            # TODO - Add test cases for the date and every outcome table.
        
        describe 'Sarcoma', ->
          beforeEach ->
            page = new SubjectDetailPage '/quip/sarcoma/subject/1?project=QIN_Test'
    
          describe 'Biopsy', ->
            # TODO - Add test cases for the date and every outcome table.
    
          describe 'Assessment', ->
            # TODO - Add test cases for the date and every outcome table.
