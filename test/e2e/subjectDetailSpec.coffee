expect = require('./helpers/expect')()

Page = require('./helpers/page')()

class SubjectDetailPage extends Page
  # Finds the imaging profile table WebElements. The return
  # value is a table promise resolving to a list of row
  # promises, each of which resolves to a list of column
  # text promises.
  #
  # @returns the imaging profile tables promise
  imagingProfileTables: () ->
    # Note: a version of this with the all function fails, e.g.:
    #   element(By.css()).all(...)
    # results in:
    #   TypeError: Object #<Object> has no method 'all'
    @select('.qi-modeling-table').then (panel) ->
      expect(panel).to.exist
      panel.findElements(By.tagName('table')).then (tables) ->
        tables.map (table) ->
          table.findElement(By.tagName('tbody')).then (body) ->
            body.findElements(By.tagName('tr')).then (rows) ->
              rows.map (row) ->
                row.findElements(By.tagName('td')).then (cols) ->
                  cols.map (col) ->
                    col.getText()
  
  # This method verifies that the format button correctly toggles
  # the chart and table display, specifically:
  # * the imaging profile chart is initially displayed
  # * the imaging profile table is initially hidden
  # * the table is displayed and the chart is hidden when the
  #   button is clicked the first time
  # * the table is hidden and the chart is displayed when the
  #   button is clicked again
  #
  # @returns a promise which resolves to whether the format
  #   button correctly toggles the chart and table display
  # @throws an expectation failure if the button toggle
  #   behavior is incorrect
  toggleImagingProfileFormatButton: ->
    # The use of => rather than -> below retains the 'this'
    # variable as this page in the promises, allowing
    # us to call the select function as @select.
    @select('#qi-modeling-chart').then (chart) =>
      # The chart exists and...
      expect(chart).to.exist
      chart.isDisplayed().then (chartDisplayed) =>
        # ...the chart is displayed and...
        expect(chartDisplayed).to.be.true
        @select('#qi-modeling-table').then (table) =>
          # ..the table exists and...
          expect(table).to.exist
          table.isDisplayed().then (tableDisplayed) =>
            # ...the table is hidden and...
            expect(tableDisplayed).to.be.false
            @select('.qi-modeling-profile button').then (button) =>
              # ...the button exists and when it is clicked then...
              expect(button).to.exist
              button.click().then =>
                table.isDisplayed().then (tableDisplayed) =>
                  # ...the table is displayed and...
                  expect(tableDisplayed).to.be.true
                  chart.isDisplayed().then (chartDisplayed) =>
                    # ...the chart is hidden and when the button
                    # is clicked again then...
                    expect(chartDisplayed).to.be.false
                    button.click().then =>
                      table.isDisplayed().then (tableDisplayed) =>
                        # ...the table is hidden and the chart is displayed.
                        expect(tableDisplayed).to.be.false
                        chart.isDisplayed()

  # @returns the line chart promise
  linechart: ->
    this.select('//qi-visit-dateline//nvd3-line-chart')

describe 'E2E Testing Subject Detail', ->
  page = null

  beforeEach ->
    page = new SubjectDetailPage '/quip/breast/subject/1?project=QIN_Test'
  
  it 'should display the billboard', ->
    expect(page.billboard).to.eventually.equal('Breast Patient 1')
  
  it 'should have a home button', ->
    pat = /.*\/quip\?project=QIN_Test$/
    expect(page.home()).to.eventually.match(pat)
  
  it 'should have help text', ->
    expect(page.help()).to.eventually.exist
  
  describe 'Imaging Profile', ->
    # Note: this is as deep as the chart can be tested,
    # since the chart SVG content is not visible to the
    # tester, perhaps because the chart directive dynamically
    # inserts the SVG into the DOM, and the app directive
    # then further modifies it.
    it 'should display the dateline', ->
      expect(page.linechart()).to.eventually.exist
    
    it 'should toggle the imaging chart and table', ->
      expect(page.toggleImagingProfileFormatButton()).to.eventually.be.true

    it 'should show the imaging properties when the format button is clicked', ->
      page.imagingProfileTables().then (tables) ->
        # There are three imaging properties.
        expect(tables.length).to.equal(3)
        # The visit dates are the first column of the first table
        # set below.
        expectedVisitDate = []
        # Validate each table.
        for table, tblNdx in tables
          table.then (rows) ->
            # There are four visits.
            expect(rows.length).to.equal(4)
            for row, rowNdx in rows
              row.then (cols) ->
                # The first table is Ktrans with seven columns.
                # The other tables have three columns.
                # The first column is the visit date.
                if tblNdx == 0
                  expect(cols.length).to.equal(7)
                  cols[0].then (value) ->
                    expectedVisitDate[rowNdx] = value
                else
                  expect(cols.length).to.equal(3)
                  visitDate = cols[0]
                  expect(visitDate).to.eventually.equal(expectedVisitDate[rowNdx])
                # The percent change is in the third, fifth and seventh column.
                # The percent change of the first row is blank. All other columns
                # are non-blank.
                for value, i in cols[1..-1]
                  if rowNdx == 0 and i > 1 and i % 2 == 1
                    expect(value).to.eventually.equal('')
                  else
                    expect(value).to.eventually.exist
          