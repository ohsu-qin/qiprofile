_ = require 'lodash'

expect = require('./helpers/expect')()

Page = require './helpers/page'

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
      panel.all(By.tagName('table'))

    headings = (table) ->
      table.all(By.tagName('th'))

    rows = (table) ->
      body = table.element(By.tagName('tbody'))
      body.all(By.tagName('tr'))

    columns = (row) ->
      row.all(By.tagName('td'))

    text = (col) ->
      col.getText().then (text) ->
        fn(text) if text? and fn?
        text

    mapTables = (panel) ->
      mapTable = (table) ->
        mapHeader = ->
          headings(table).map(text)
        
        mapBody = ->
          mapRow = (row) ->
            columns(row).map(text)

          rows(table).map(mapRow)
        
        header: mapHeader()
        body: mapBody()

      tables(panel).map(mapTable)

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

  # Finds the imaging profile table panel WebElement.
  #
  # @param fn optional function to run on the resolved panel
  # @returns the imaging profile table panel promise
  imagingProfileTablePanel: (fn) ->
    @select('qi-modeling-table').then (panel) ->
      fn(panel) if panel? and fn?
      panel

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

  # @param fn optional function to run on the resolved tables
  modelingChart: (fn) ->
    @select('#qi-modeling-chart').then (chart) ->
      fn(chart) if chart? and fn?
      chart

  # @param fn optional function to run on the resolved chart
  # @returns the date line chart promise
  dateLine: (fn) ->
    @select('//qi-visit-dateline//nvd3-line-chart').then (chart) ->
      fn(chart) if chart? and fn?
      chart

  # Finds the clinical profile table panel WebElement.
  #
  # @param fn optional function to run on the resolved panel
  # @returns the clinical profile table panel promise
  clinicalProfileTablePanel: (fn) ->
    # @param selector the selection criterion
    # @param bindings the table field {property: binding} bindings
    # @returns the target table augmented with the component table
    #   access functions, or null if the table was not found
    selectTableWithBindings = (selector, bindings) =>
      # Gets the given WebElement text.
      text = (elt) -> elt.getText() if elt

      # Searches for a WebElement and resolves to its text.
      selectText = (selector) => @select(selector).then(text)

      # @param table the target table
      # @param bindings the table field bindings
      addTextFields = (table, bindings) =>
        # @param property the field property
        # @param _binding the subject property bound to the field
        addTextField = (property, binding) ->
          # Associate the field property with its text.
          table[property] = ->
            # Note: the assignments below must be made locally in
            # this anonymous function rather than preceding this
            # statement in the addTextField function in order to
            # work around the following Javascript scope/closure
            # interaction anomaly:
            # * If the local variables below are bound in the
            #   parent context, then every property finder resolves
            #   to the last property binding.
            sbjBinding = 'subject.' + binding
            # Make the field element search selector.
            selector = By.binding(sbjBinding)
            selectText(selector)
          
        addTextField(prop, binding) for prop, binding of bindings

      # Find the table.
      #
      # Note: A better solution is to perform the field selects below
      # against the table panel rather than the page. However,
      # panel.findElement('qi-demographics-table')
      # results in an error, since the untyped panel object has most, but
      # not all, of the WebElement function properties. In particular, it
      # is missing the findElement function. The work-around is to search
      # in the page context instead.
      #
      # TODO - find out why the panel is neither an ElementFinder nor a
      # WebElement and replace the select below with panel.element or
      # panel.findElement. Add panel to the clinicalProfileTablePanel
      # function arguments.
      @select(selector).then (table) ->
        # Add the fields.
        addTextFields(table, bindings) if table
        # Return the table, or null if the table was not found.
        table

    # Adds a function property for each component table to the given
    # profile panel.
    #
    # @param panel the clinical profile panel
    addComponentTables = (panel) ->
      componentTables =
        demographics:
          selector: 'qi-demographics-table'
          bindings:
            age: 'birthDate'
            races: 'races'
            ethnicity: 'ethnicity'

      addComponentTable = (prop, selector, bindings) ->
        panel[prop] = -> selectTableWithBindings(selector, bindings)

      for prop, spec of componentTables
        addComponentTable(prop, spec.selector, spec.bindings)

    # Find the clinical profile table.
    @select('qi-clinical-table').then (panel) =>
      if panel?
        # Add the component table functions.
        addComponentTables(panel)
        # Apply the function to the panel.
        fn(panel) if fn?
      panel

  # Finds the demographics profile table WebElements.
  #
  # @param fn optional function to run on the resolved table
  # @returns the demographics table promise

describe 'E2E Testing Subject Detail', ->
  page = null

  describe 'Breast', ->
    before ->
      page = new SubjectDetailPage '/quip/breast/subject/1?project=QIN_Test'

    # The page header test cases.
    describe 'Header', ->
      it 'should display the billboard', ->
        expect(page.billboard, 'The billboard is incorrect').to.eventually.equal('Breast Patient 1')

      it 'should have a home button', ->
        pat = /.*\/quip\?project=QIN_Test$/
        expect(page.home, 'The home URL is incorrect').to.eventually.match(pat)

      it 'should have help text', ->
        expect(page.help, 'The help is missing').to.eventually.exist

    # The page main body test cases.
    describe 'Imaging Profile', ->
      chart = null
      table = null

      before ->
        page.modelingChart().then (elt) ->
          chart = elt
        page.imagingProfileTablePanel().then (elt) ->
          table = elt

      describe 'Dateline', ->
        # Note: this is as deep as the chart can be tested,
        # since the chart SVG content is not visible to the
        # tester, perhaps because the chart directive dynamically
        # inserts the SVG into the DOM, and the app directive
        # then further modifies it.
        it 'should exist', ->
          expect(page.dateLine(), 'The dateline is missing').to.eventually.exist

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
            expect(displayed, 'The modeling table panel is initially displayed')
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

          it 'should display the column headers', ->
            for table, tblNdx in tables
              for heading, hdgNdx in table.header
                expect(heading, "Table #{ tblNdx + 1 } is missing heading" +
                                " #{ hdgNdx + 1 }").to.exist.and.not.be.empty

          it 'should have four Breast patient visits', ->
            for table, tblNdx in tables
              rows = table.body
              for row in rows
                expect(rows.length, "Table #{ tblNdx + 1 } row count is incorrect")
                  .to.equal(4)

          it 'should show the visit dates', ->
            # The expected visit dates are the first column of the first table.
            referenceTable = _.first(tables)
            expected = ((_.first(columns) for columns in referenceTable.body))
            # The date values for every remaining table should be
            # consistent with those of the first table.
            for table, tblNdx in _.rest(tables)
              rows = table.body
              for columns, rowNdx in rows
                visitDate = _.first(columns)
                expect(visitDate, "The table #{ tblNdx + 2 } visit date is incorrect")
                  .to.equal(expected[rowNdx])

          it 'should have seven Ktrans table columns', ->
            # The KTrans table is the first table.
            table = _.first(tables)
            for row, rowNdx in table.body
              expect(row.length, "The Ktrans table row #{ rowNdx + 1 } column" +
                                 " count is incorrect").to.equal(7)

          it 'should have three non-Ktrans table columns', ->
            # The KTrans table is the first table.
            tables = _.rest(tables)
            for table, tblNdx in tables
              for row, rowNdx in table.body
                expect(row.length, "The table #{ tblNdx + 2 } row #{ rowNdx + 1 }" +
                                   " column count is incorrect").to.equal(3)

          it 'should not have a blank non-percent change value', ->
            for table, tblNdx in tables
              rows = table.body
              for columns, rowNdx in rows
                # The odd columns hold non-percent change values.
                for colNdx in _.range(1, columns.length, 2)
                  value = columns[colNdx]
                  expect(value, "Imaging Profile table #{ tblNdx + 1 } body" +
                                " row #{ rowNdx + 1 } percent change column" +
                                " #{ colNdx + 1 } is not blank").to.not.be.empty

          it 'should have blank percent values in the first row', ->
            for table, tblNdx in tables
              rows = table.body
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
            for table, tblNdx in tables
              rows = table.body
              for columns, rowNdx in _.rest(rows)
                for colNdx in _.range(2, columns.length, 2)
                  value = columns[colNdx]
                  expect(value, "Imaging Profile table #{ tblNdx + 1 } body" +
                                " row #{ rowNdx + 2 } percent change column" +
                                " #{ colNdx + 1 } is blank").to.not.be.empty

    describe 'Clinical Profile', ->
      panel = null

      before ->
        page.clinicalProfileTablePanel().then (elt) ->
          panel = elt

      it 'should show the clinical profile table', ->
          # The clinical tables panel exists.
          expect(panel, 'The clinical table panel is missing')
            .to.eventually.exist
          # The panel is displayed.
          panel.isDisplayed().then (displayed) ->
            expect(displayed, 'The clinical table panel is initially displayed')
              .to.be.true

      describe 'Demographics', ->
        table = null

        before ->
          panel.demographics().then (elt) ->
            table = elt

        it 'should show the demographics table', ->
          expect(table, 'The demographics table is missing')
            .to.eventually.exist
          table.isDisplayed().then (displayed) ->
            expect(displayed, 'The demographics table is not displayed')
              .to.be.true
        
        # Validate the demographics values.
        it 'should show the age', ->
          table.age().then (age) ->
            expect(age, 'The age is missing').to.exist.and.to.not.be.empty
            expect(age, 'The age is not an integer').to.match(/^\d+$/)
            expect(parseInt(age), 'The age is not positive')
              .to.be.greaterThan(0)

        it 'should show the race', ->
          table.races().then (races) ->
            expect(races, 'The race is missing').to.exist.and.to.not.be.empty

        it 'should show the ethnicity', ->
          table.ethnicity().then (ethnicity) ->
            expect(ethnicity, 'The ethnicity is missing')
              .to.exist.and.to.not.be.empty

      describe 'Outcomes', ->
          describe 'Biopsy', ->
            # TODO - Add test cases for the date and every outcome table.

          describe 'Assessment', ->
            # TODO - Add test cases for the date and every outcome table.

  describe 'Sarcoma', ->
    beforeEach ->
      page = new SubjectDetailPage '/quip/sarcoma/subject/1?project=QIN_Test'

    # The Sarcoma-specific page header test cases.
    describe 'Header', ->
      it 'should display the billboard', ->
        expect(page.billboard, 'The billboard is incorrect')
          .to.eventually.equal('Sarcoma Patient 1')

    describe 'Biopsy', ->
      # TODO - Add test cases for the date and every outcome table.

    describe 'Assessment', ->
      # TODO - Add test cases for the date and every outcome table.
