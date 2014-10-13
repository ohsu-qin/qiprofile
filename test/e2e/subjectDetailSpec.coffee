expect = require('./helpers/expect')()

Page = require('./helpers/page')()

class SubjectDetailPage extends Page
  # Finds the profile table WebElements for the given CSS style.
  # The return value is a table promise resolving to a list of
  # row promises, each of which resolves to a list of column
  # text promises.
  #
  # @returns the imaging profile tables promise
  profileTablesForCss: (style) ->
    # Note: a version of this with the all function fails, e.g.:
    #   element(By.css()).all(...)
    # results in:
    #   TypeError: Object #<Object> has no method 'all'
    @select(style).then (panel) ->
      expect(panel, "The #{ style } table is missing").to.exist
      panel.findElements(By.tagName('table')).then (tables) ->
        tables.map (table) ->
          table.findElement(By.tagName('tbody')).then (body) ->
            body.findElements(By.tagName('tr')).then (rows) ->
              rows.map (row) ->
                row.findElements(By.tagName('td')).then (cols) ->
                  cols.map (col) ->
                    col.getText()
  
  # Finds the imaging profile table WebElements.
  # See profileTablesForCss.
  #
  # @returns the imaging profile tables promise
  imagingProfileTables: () ->
    @profileTablesForCss('qi-modeling-table')
  
  # Finds the clinical profile table WebElements.
  # See profileTablesForCss.
  #
  # @returns the clinical profile tables promise
  clinicalProfileTables: () ->
    # Note: a version of this with the all function fails, e.g.:
    #   element(By.css()).all(...)
    # results in:
    #   TypeError: Object #<Object> has no method 'all'
    @profileTablesForCss('qi-clinical-table')
  
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
      expect(chart, 'The modeling chart is missing').to.exist
      chart.isDisplayed().then (chartDisplayed) =>
        # ...the chart is displayed and...
        expect(chartDisplayed, 'The modeling chart is initially hidden')
          .to.be.true
        @select('qi-modeling-table').then (table) =>
          # ..the table exists and...
          expect(table, 'The modeling table is missing').to.exist
          table.isDisplayed().then (tableDisplayed) =>
            # ...the table is hidden and...
            expect(tableDisplayed, 'The modeling table is initially displayed')
              .to.be.false
            @select('.qi-modeling-profile button').then (button) =>
              # ...the button exists and when it is clicked then...
              expect(button).to.exist
              button.click().then =>
                table.isDisplayed().then (tableDisplayed) =>
                  # ...the table is displayed and...
                  expect(tableDisplayed,
                         'The modeling table is hidden after the format button is clicked')
                    .to.be.true
                  chart.isDisplayed().then (chartDisplayed) =>
                    # ...the chart is hidden and when the button
                    # is clicked again then...
                    expect(chartDisplayed,
                           'The modeling chart is displayed after the format button is clicked')
                      .to.be.false
                    button.click().then =>
                      table.isDisplayed().then (tableDisplayed) =>
                        # ...the table is hidden and the chart is displayed.
                        expect(tableDisplayed,
                               'The modeling table is displayed after the format button is clicked twice')
                          .to.be.false
                        chart.isDisplayed()

  # @returns the line chart promise
  linechart: ->
    this.select('//qi-visit-dateline//nvd3-line-chart')

describe 'E2E Testing Subject Detail', ->
  page = null
  
  # The header test cases.
  describe 'Header', ->
    beforeEach ->
      page = new SubjectDetailPage '/quip/breast/subject/1?project=QIN_Test'
  
    it 'should display the billboard', ->
      expect(page.billboard, 'The billboard is incorrect').to.eventually.equal('Breast Patient 1')
  
    it 'should have a home button', ->
      pat = /.*\/quip\?project=QIN_Test$/
      expect(page.home(), 'The home URL is incorrect').to.eventually.match(pat)
  
    it 'should have help text', ->
      expect(page.help(), 'The help is missing').to.eventually.exist
  
  it 'should display a contact email link', ->
    pat = /a href="mailto:\w+@ohsu.edu"/
    expect(page.contact(), 'The email address is missing')
      .to.eventually.match(pat)
  
  describe 'Imaging Profile', ->
    # The imaging profile is collection-independent.
    beforeEach ->
      page = new SubjectDetailPage '/quip/breast/subject/1?project=QIN_Test'

    it 'should toggle the imaging chart and table', ->
      expect(page.toggleImagingProfileFormatButton(),
             'The imaging chart is hidden after the format button is clicked twice')
        .to.eventually.be.true

    describe 'Chart', ->
      # Note: this is as deep as the chart can be tested,
      # since the chart SVG content is not visible to the
      # tester, perhaps because the chart directive dynamically
      # inserts the SVG into the DOM, and the app directive
      # then further modifies it.
      it 'should display the dateline', ->
        expect(page.linechart(), 'The dateline is missing').to.eventually.exist

    describe 'Table', ->
      it 'should show the imaging properties when the format button is clicked', ->
        page.imagingProfileTables().then (tables) ->
          # There are three imaging properties.
          expect(tables.length, 'The imaging profile table count is incorrect')
            .to.equal(3)
          # The visit dates are the first column of the first table
          # set below.
          expectedVisitDate = []
          # Validate each table.
          for table, tblNdx in tables
            table.then (rows) ->
              # There are four visits.
              expect(rows.length, 'The row count is incorrect').to.equal(4)
              for row, rowNdx in rows
                row.then (cols) ->
                  # The first table is Ktrans with seven columns.
                  # The other tables have three columns.
                  # The first column is the visit date.
                  if tblNdx == 0
                    expect(cols.length, 'The Ktrans table column length is incorrect')
                      .to.equal(7)
                    cols[0].then (value) ->
                      expectedVisitDate[rowNdx] = value
                  else
                    expect(cols.length, 'The non-Ktrans table column length is incorrect')
                      .to.equal(3)
                    visitDate = cols[0]
                    expect(visitDate, 'The table visit date is incorrect')
                      .to.eventually.equal(expectedVisitDate[rowNdx])
                  # The percent change is in the third, fifth and seventh column.
                  # The percent change of the first row is blank. All other columns
                  # are non-blank.
                  #
                  # FIXME - the validation below is broken. All values are blank,
                  # even though they show up in the browser.
                  #
                  for value, i in cols[1..-1]
                    # Every other column is a percent change.
                    if i % 2 == 1
                      # A percent change column - the first row is blank, other rows
                      # have a value.
                      if rowNdx == 0
                        expect(value, "The percent change in Imaging Profile table #{ tblNdx + 1 }" +
                                      " row #{ rowNdx + 1 } column #{ i + 2 } is not blank: #{ value }")
                          .to.eventually.equal('')
                      else
                        expect(value, "The percent change in Imaging Profile table #{ tblNdx + 1 }" +
                                      " row #{ rowNdx + 1 } column #{ i + 2 } is blank")
                          .to.eventually.not.be.empty
                    else
                      # Not a percent change column.
                      expect(value, "Imaging Profile table #{ tblNdx + 1 }" +
                                    " row #{ rowNdx + 1 } column #{ i + 2 } is blank")
                        .to.eventually.not.be.empty

  # describe 'Clinical Profile', ->
  #   describe 'Demographics', ->
  #     # Demographics is collection-independent.
  #     beforeEach ->
  #       page = new SubjectDetailPage '/quip/breast/subject/1?project=QIN_Test'
  #     
  #     it 'should show the demographics table', ->
  #       page.clinicalProfileTables().then (tables) ->
  #         # TODO - add test case.
  # 
  #   describe 'Outcomes', ->
  #     describe 'Breast', ->
  #       beforeEach ->
  #         page = new SubjectDetailPage '/quip/breast/subject/1?project=QIN_Test'
  # 
  #       describe 'Biopsy', ->
  #         # TODO - Add test cases for the date and every outcome table.
  # 
  #       describe 'Assessment', ->
  #         # TODO - Add test cases for the date and every outcome table.
  #     
  #     describe 'Sarcoma', ->
  #       beforeEach ->
  #         page = new SubjectDetailPage '/quip/sarcoma/subject/1?project=QIN_Test'
  # 
  #       describe 'Biopsy', ->
  #         # TODO - Add test cases for the date and every outcome table.
  # 
  #       describe 'Assessment', ->
  #         # TODO - Add test cases for the date and every outcome table.
  # 
          