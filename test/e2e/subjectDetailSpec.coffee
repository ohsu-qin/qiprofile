_ = require 'lodash'

expect = require('./helpers/expect')()

Page = require './helpers/page'

class SubjectDetailPage extends Page
  # @returns a promise which resolves to the image profile button
  #   ElementFinder
  imageProfileFormatButton: ->
    @find('#modeling-format-btn')

  # Finds the modeling table WebElements.
  # See profileTables.
  #
  # @returns the modeling tables promise
  modelingTables: ->
    @findTables('.qi-modeling-table')

  # @returns the modeling charts promise
  modelingCharts: ->
     @findAll('.qi-modeling-chart')

  # @returns the date line chart promise
  dateLine: ->
    @find('//qi-visit-dateline//nvd3-line-chart')

  # @returns the clinical profile panel promise
  clinicalProfile: ->
    # @param selector the selection criterion
    # @param bindings the table field {property: binding} bindings
    # @returns the target table augmented with the component table
    #   access functions, or null if the table was not found
    findTableWithBindings = (selector, bindings) =>
      # Gets the given WebElement text.
      text = (elt) -> elt.getText() if elt

      # Searches for a WebElement and resolves to its text.
      findText = (selector) => @find(selector).then(text)

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
            findText(selector)

        addTextField(prop, binding) for prop, binding of bindings

      # Find the table.
      #
      # Note: A better solution is to perform the field selects below
      # against the table rather than the page. However,
      # panel.findElement('qi-demographics-table')
      # results in an error, since the untyped panel object has most, but
      # not all, of the WebElement function properties. In particular, it
      # is missing the findElement function. The work-around is to search
      # in the page context instead.
      #
      # TODO - find out why the panel is neither an ElementFinder nor a
      # WebElement and replace the select below with panel.element or
      # panel.findElement. Add panel to the clinicalProfile function
      # arguments.
      @find(selector).then (table) ->
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
          selector: '#demographics'
          bindings:
            age: 'birthDate'
            weight: 'weight'
            races: 'races'
            ethnicity: 'ethnicity'

      addComponentTable = (prop, selector, bindings) ->
        panel[prop] = -> findTableWithBindings(selector, bindings)

      for prop, spec of componentTables
        addComponentTable(prop, spec.selector, spec.bindings)

    # Find the clinical profile panel.
    @find('.qi-clinical-profile').then (panel) =>
      # Add the component table functions.
      addComponentTables(panel) if panel?
      panel


describe 'E2E Testing Subject Detail', ->
  page = null

  describe 'Breast', ->
    before ->
      page = new SubjectDetailPage '/quip/breast/subject/1?project=QIN_Test'

    it 'should load the page', ->
      expect(page.content, 'The page was not loaded')
        .to.eventually.exist

    # The page header test cases.
    describe 'Header', ->
      it 'should display the billboard', ->
        expect(page.billboard, 'The billboard is incorrect')
          .to.eventually.equal('Breast Patient 1')

      it 'should have a home button', ->
        pat = /.*\/quip\?project=QIN_Test$/
        expect(page.home, 'The home URL is incorrect').to.eventually.match(pat)

      it 'should have help text', ->
        expect(page.help, 'The help is missing').to.eventually.exist

      it 'should display a contact email link', ->
        pat = /a href="mailto:\w+@ohsu.edu"/
        expect(page.contactInfo, 'The email address is missing')
          .to.eventually.match(pat)

    # The page main body test cases.
    describe 'Imaging Profile', ->
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
            expect(button, 'The modeling format button is missing')
              .to.exist
            expect(page.modelingCharts(), 'The modeling charts are initially hidden')
              .to.eventually.not.be.empty
            expect(page.modelingTables(), 'The modeling tables are initially visible')
              .to.eventually.be.empty
            # When the button is clicked, then the modeling tables
            # are displayed.
            button.click().then ->
              expect(page.modelingCharts(), 'The modeling charts are visible after' +
                                            ' the format button is clicked')
                .to.eventually.be.empty
              expect(page.modelingTables(), 'The modeling tables are hidden after' +
                                            ' the format button is clicked')
                .to.eventually.not.be.empty
              # When the button is clicked again, then the modeling charts
              # are displayed.
              button.click().then ->
                expect(page.modelingCharts(), 'The modeling charts are hidden after' +
                                              ' the format button is clicked twice')
                  .to.eventually.not.be.empty
                expect(page.modelingTables(), 'The modeling tables are visible after' +
                                              ' the format button is clicked twice')
                  .to.eventually.be.empty

      describe 'Chart', ->
        it 'should display the imaging charts', ->
          page.modelingCharts().then (charts) ->
            # The chart exists.
            expect(charts, 'The modeling charts are missing')
              .to.exist.and.not.be.empty
            # The charts are displayed.
            for chart, i in charts
              expect(chart.isDisplayed(), 
                     "The modeling chart #{ i } is initially hidden")
                .to.eventually.be.true

      describe 'Table', ->
        modelingTables = null
        
        before ->
          # The tables are only added to the DOM if the format button
          # is clicked.
          modelingTables = page.imageProfileFormatButton().then (button) ->
            button.click().then ->
              page.modelingTables()
        
        after ->
          # Restore the format to chart.
          page.imageProfileFormatButton().then (button) ->
            button.click()

        # There are three modeling tables, one for each PK modeling
        # property.
        it 'should have three tables', ->
          modelingTables.then (tables) ->
            # The modeling tables exists.
            expect(tables, 'The modeling tables are missing')
              .to.exist.and.not.be.empty
            expect(tables.length, 'The modeling table count is incorrect')
              .to.equal(3)
        
        describe 'Properties', ->
          it 'should display the column headers', ->
            modelingTables.then (tables) ->
              for table, tblNdx in tables
                table.header.then (headings) ->
                  for heading, hdgNdx in headings 
                    expect(heading, "Table #{ tblNdx + 1 } is missing column" +
                                    " heading #{ hdgNdx + 1 }")
                      .to.exist.and.not.be.empty
        
          it 'should have four Breast patient visits', ->
            modelingTables.then (tables) ->
              for table, tblNdx in tables
                table.body.then (rows) ->
                  expect(rows.length,
                         "Table #{ tblNdx + 1 } row count is incorrect")
                    .to.equal(4)
                  
          it 'should show the visit dates', ->
            modelingTables.then (tables) ->
              # The expected visit dates are the first column of the first table.
              referenceTable = _.first(tables)
              expected = null
              referenceTable.body.then (rows) ->
                expected = ((_.first(columns) for columns in rows))
              # The date values for every remaining table should be
              # consistent with those of the first table.
              for table, tblNdx in _.rest(tables)
                table.body.then (rows) ->
                  for columns, rowNdx in rows
                    visitDate = _.first(columns)
                    expect(visitDate,
                           "The table #{ tblNdx + 2 } visit date is incorrect")
                      .to.equal(expected[rowNdx])
                  
          it 'should have seven Ktrans table columns', ->
            modelingTables.then (tables) ->
              
              # The KTrans table is the first table.
              table = _.first(tables)
              table.body.then (rows) ->
                for row, rowNdx in rows
                  expect(row.length, "The Ktrans table row #{ rowNdx + 1 }" +
                                     " column count is incorrect").to.equal(7)
                  
          it 'should have three non-Ktrans table columns', ->
            modelingTables.then (tables) ->
              # The KTrans table is the first table.
              tables = _.rest(tables)
              for table, tblNdx in tables
                table.body.then (rows) ->
                  for row, rowNdx in rows
                    expect(row.length,
                           "The table #{ tblNdx + 2 } row #{ rowNdx + 1 }" +
                           " column count is incorrect").to.equal(3)
                  
          it 'should not have a blank non-percent change value', ->
            modelingTables.then (tables) ->
              for table, tblNdx in tables
                table.body.then (rows) ->
                  for columns, rowNdx in rows
                    # The odd columns hold non-percent change values.
                    for colNdx in _.range(1, columns.length, 2)
                      value = columns[colNdx]
                      expect(value, "Imaging Profile table #{ tblNdx + 1 } body" +
                                    " row #{ rowNdx + 1 } percent change column" +
                                    " #{ colNdx + 1 } is not blank")
                        .to.not.be.empty
                  
          it 'should have blank percent values in the first row', ->
            modelingTables.then (tables) ->
              for table, tblNdx in tables
                table.body.then (rows) ->
                  columns = _.first(rows)
                  expect(columns, "Imaging Profile table #{ tblNdx + 1 } body" +
                                  " row 0 has no columns")
                    .to.exist.and.not.be.empty
                  # The percent change is in the third, fifth and seventh column.
                  # The percent changes of the first row are blank.
                  # The odd columns hold non-percent change values.
                  for colNdx in _.range(2, columns.length, 2)
                    value = columns[colNdx]
                    expect(value, "Imaging Profile table #{ tblNdx + 1 } body" +
                                  " row 0 percent change column #{ colNdx + 1 }" +
                                  " is not blank").to.be.empty
                  
          it 'should not have a blank percent value in the remaining rows', ->
            modelingTables.then (tables) ->
              for table, tblNdx in tables
                table.body.then (rows) ->
                  for columns, rowNdx in _.rest(rows)
                    for colNdx in _.range(2, columns.length, 2)
                      value = columns[colNdx]
                      expect(value, "Imaging Profile table #{ tblNdx + 1 } body" +
                                    " row #{ rowNdx + 2 } percent change column" +
                                    " #{ colNdx + 1 } is blank")
                        .to.not.be.empty

    describe 'Clinical Profile', ->
      clinicalProfile = null
      
      before ->
        clinicalProfile = page.clinicalProfile()

      it 'should show the clinical profile', ->
        expect(clinicalProfile, 'The clinical profile is missing')
          .to.eventually.exist

      describe 'Demographics', ->
        demographics = null
        
        before ->
          demographics = clinicalProfile.then (profile) ->
            profile.demographics()

        it 'should show the demographics table', ->
          demographics.then (table) ->
            expect(table, 'The demographics table is missing').to.exist
            expect(table.isDisplayed(), 'The demographics table is not displayed')
              .to.eventually.be.true
      
        # Validate the demographics values.
        it 'should show the age', ->
          demographics.then (table) ->
            table.age().then (age) ->
              expect(age, 'The age is missing').to.exist.and.to.not.be.empty
              expect(age, 'The age is not an integer').to.match(/^\d+$/)
              expect(parseInt(age), 'The age is not positive')
                .to.be.greaterThan(0)
        
        it 'should show the weight', ->
          demographics.then (table) ->
            table.weight().then (weight) ->
              expect(weight, 'The weight is missing').to.exist.and.to.not.be.empty
              expect(weight, 'The weight is not an integer').to.match(/^\d+$/)
              expect(parseInt(weight), 'The weight is not positive')
                .to.be.greaterThan(0)
      
        it 'should show the race', ->
          demographics.then (table) ->
            table.races().then (races) ->
              expect(races, 'The race is missing').to.exist.and.to.not.be.empty
      
        it 'should show the ethnicity', ->
          demographics.then (table) ->
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

    it 'should load the page', ->
      expect(page.content, 'The page was not loaded').to.eventually.exist

    # The Sarcoma-specific page header test cases.
    describe 'Header', ->
      it 'should display the billboard', ->
        expect(page.billboard, 'The billboard is incorrect')
          .to.eventually.equal('Sarcoma Patient 1')

    describe 'Biopsy', ->
      # TODO - Add test cases for the date and every outcome table.

    describe 'Assessment', ->
      # TODO - Add test cases for the date and every outcome table.
