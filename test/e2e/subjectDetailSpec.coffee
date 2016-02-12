_ = require 'lodash'

expect = require('./helpers/expect')()

Page = require './helpers/page'

class SubjectDetailPage extends Page
  # @returns a promise which resolves to the image profile button
  #   ElementFinder
  imageProfileFormatButton: ->
    @find('#modeling-format-btn')
    
  # @returns a promise which resolves to the PK modeling help button
  #   ElementFinder
  pkModelingHelpButton: ->
    @find('#pk-modeling-help-btn')

  # @returns a promise which resolves to the TNM stage help button
  #   ElementFinder
  tnmStageHelpButton: ->
    @find('.tnm-stage-help-btn')

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
    # The table specifications as described in the getTable()
    # function below.
    #
    TABLES =
      demographics:
        selector: '#demographics'
        bindings:
          age: 'subject.birthDate'
          races: 'subject.races'
          ethnicity: 'subject.ethnicity'

    @find('.qi-clinical-profile').then (profile) ->
      if profile?
        # The table object builder.
        getTable = (name) ->
          spec = TABLES[name]
          profile.findTable(spec.selector).then (table) ->
            if table? then table.addBindings(spec.bindings) else table

        # The table accessor properties.
        for name in Object.keys(TABLES)
          profile[name] = getTable(name)

        # The encounter accessor properties.
        # TODO - use the encounter type attribute instead
        # (cf. the encounter.jade TODO).
        for enc in ['Biopsy', 'BreastSurgery', 'SarcomaSurgery']
          profile[enc.toLowerCase()] =
            profile.find("div[ng-switch-when='#{ enc }']")

      # Return the clinical profile.
      profile

describe 'E2E Testing Subject Detail', ->
  page = null

  describe 'Breast', ->
    before ->
      page = new SubjectDetailPage '/quip/breast/subject/1?project=QIN_Test'

    it 'should load the page', ->
      expect(page.content(), 'The page was not loaded')
        .to.eventually.exist

    # The page header test cases.
    describe 'Header', ->
      it 'should display the billboard', ->
        expect(page.billboard(), 'The billboard is incorrect')
          .to.eventually.exist
        expect(page.billboard(), 'The billboard is incorrect')
          .to.eventually.equal('Breast Patient 1')

      it 'should have a home button', ->
        expect(page.home(), 'The home URL is incorrect')
          .to.eventually.match(Page.HOME_URL_PAT)

      describe 'Help', ->
        help = null
    
        before ->
          help = page.help()

        it 'should have help text', ->
          expect(help, 'The help text is missing')
            .to.eventually.exist.and.not.be.empty

        it 'should display a {qu,sugg}estion box hyperlink', ->
          expect(help, 'The {qu,sugg}estion box hyperlink is missing')
            .to.eventually.include(Page.SUGGESTION_BOX_URL)

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
          buttonFinder = page.imageProfileFormatButton()
          # The format button exists.
          expect(buttonFinder, 'The modeling format button is missing')
            .to.eventually.exist

          expect(page.modelingCharts(), 'The modeling tables are initially visible')
            .to.eventually.not.be.empty
          expect(page.modelingTables(), 'The modeling tables are initially visible')
            .to.eventually.be.empty

          # When the button is clicked, then the modeling tables
          # are displayed.
          buttonFinder.then (button) ->
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

      describe 'Help Button', ->
        it 'should display the PK modeling help button', ->
          page.pkModelingHelpButton().then (button) ->
            expect(button.isDisplayed(), 'The PK modeling help button is not displayed')
              .to.eventually.be.true

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
        modelingTablesFinder = null

        before ->
          # The tables are only added to the DOM if the format button
          # is clicked.
          modelingTablesFinder = page.imageProfileFormatButton().then (button) ->
            button.click().then ->
              page.modelingTables()

        after ->
          # Restore the format to chart.
          page.imageProfileFormatButton().then (button) ->
            button.click()

        # There are three modeling tables, one for each PK modeling
        # property.
        it 'should have three modeling result tables', ->
          expect(modelingTablesFinder, 'The modeling result tables are' +
                                       ' missing')
            .to.eventually.not.be.empty
          modelingTablesFinder.then (tables) ->
            expect(tables.length, 'The modeling result tables count is' +
                                  ' incorrect')
              .to.equal(3)

        describe 'Properties', ->
          it 'should display the column headers', ->
            modelingTablesFinder.then (tables) ->
              for table, tblNdx in tables
                expect(table.header(), "Table #{ tblNdx + 1 } is missing a" +
                                     " header")
                  .to.exist.and.not.be.empty
                table.header().then (headings) ->
                  for heading, hdgNdx in headings
                    expect(heading, "Table #{ tblNdx + 1 } is missing" +
                                    " column heading #{ hdgNdx + 1 }")
                      .to.eventually.exist.and.not.be.empty

          it 'should have four Breast patient visits', ->
            modelingTablesFinder.then (tables) ->
              for table, tblNdx in tables
                table.body().then (rows) ->
                  expect(rows.length, "Table #{ tblNdx + 1 } row count" +
                                      " is incorrect")
                    .to.equal(4)

          it 'should show the visit dates', ->
            modelingTablesFinder.then (tables) ->
              # The expected visit dates are the first column of the first
              # table.
              referenceTable = _.first(tables)
              expect(referenceTable, 'The reference modeling Table 1 is' +
                                     'missing')
                .to.exist
              expected = null
              referenceTable.body().then (rows) ->
                expected = (_.first(columns) for columns in rows)
                for date, rowNdx in expected
                  expect(date, "The table 1 row #{ rowNdx + 1 } visit date" +
                               " is missing")
                    .to.exist.and.not.be.empty
                # The date values for every remaining table should be
                # consistent with those of the first table.
                for table, tblNdx in _.tail(tables)
                  table.body().then (rows) ->
                    for columns, rowNdx in rows
                      date = _.first(columns)
                      expect(date, "The table #{ tblNdx + 2 } row" +
                                   " #{ rowNdx + 1 } visit date is missing")
                        .to.exist
                      expect(date, "The table #{ tblNdx + 2 } row" +
                                   " #{ rowNdx + 1 } visit date is incorrect")
                        .to.equal(expected[rowNdx])

  #         it 'should have seven Ktrans table columns', ->
  #           modelingTablesFinder.then (tables) ->
  #             # The KTrans table is the first table.
  #             table = _.first(tables)
  #             table.body().then (rows) ->
  #               for row, rowNdx in rows
  #                 expect(row.length, "The Ktrans table row #{ rowNdx + 1 }" +
  #                                    " column count is incorrect").to.equal(7)
  #
  #         it 'should have three non-Ktrans table columns', ->
  #           modelingTablesFinder.then (tables) ->
  #             # The KTrans table is the first table.
  #             tables = _.tail(tables)
  #             for table, tblNdx in tables
  #               table.body().then (rows) ->
  #                 for row, rowNdx in rows
  #                   expect(row.length,
  #                          "The table #{ tblNdx + 2 } row #{ rowNdx + 1 }" +
  #                          " column count is incorrect").to.equal(3)
  #
  #         it 'should not have a blank non-percent change value', ->
  #           modelingTablesFinder.then (tables) ->
  #             for table, tblNdx in tables
  #               table.body().then (rows) ->
  #                 for columns, rowNdx in rows
  #                   # The odd columns hold non-percent change values.
  #                   for colNdx in _.range(1, columns.length, 2)
  #                     value = columns[colNdx]
  #                     expect(value, "Imaging Profile table #{ tblNdx + 1 } body" +
  #                                   " row #{ rowNdx + 1 } percent change column" +
  #                                   " #{ colNdx + 1 } is not blank")
  #                       .to.not.be.empty
  #
  #         it 'should have blank percent values in the first row', ->
  #           modelingTablesFinder.then (tables) ->
  #             for table, tblNdx in tables
  #               table.body().then (rows) ->
  #                 columns = _.first(rows)
  #                 expect(columns, "Imaging Profile table #{ tblNdx + 1 } body" +
  #                                 " row 0 has no columns")
  #                   .to.exist.and.not.be.empty
  #                 # The percent change is in the third, fifth and seventh column.
  #                 # The percent changes of the first row are blank.
  #                 # The odd columns hold non-percent change values.
  #                 for colNdx in _.range(2, columns.length, 2)
  #                   value = columns[colNdx]
  #                   expect(value, "Imaging Profile table #{ tblNdx + 1 } body" +
  #                                 " row 0 percent change column #{ colNdx + 1 }" +
  #                                 " is not blank").to.be.empty
  #
  #         it 'should not have a blank percent value in the remaining rows', ->
  #           modelingTablesFinder.then (tables) ->
  #             for table, tblNdx in tables
  #               table.body().then (rows) ->
  #                 for columns, rowNdx in _.tail(rows)
  #                   for colNdx in _.range(2, columns.length, 2)
  #                     value = columns[colNdx]
  #                     expect(value, "Imaging Profile table #{ tblNdx + 1 } body" +
  #                                   " row #{ rowNdx + 2 } percent change column" +
  #                                   " #{ colNdx + 1 } is blank")
  #                       .to.not.be.empty
  #
  #   describe 'Clinical Profile', ->
  #     clinicalProfile = null
  #
  #     before ->
  #       clinicalProfile = page.clinicalProfile()
  #
  #     it 'should show the clinical profile', ->
  #       expect(clinicalProfile, 'The Breast clinical profile is missing')
  #         .to.eventually.exist
  #
  #     describe 'Demographics', ->
  #       demographics = null
  #
  #       before ->
  #         demographics = clinicalProfile.then (profile) ->
  #           profile.demographics
  #
  #       it 'should show the demographics table', ->
  #         demographics.then (table) ->
  #           expect(table, 'The demographics table is missing').to.exist
  #           expect(table.isDisplayed(), 'The demographics table is not displayed')
  #             .to.eventually.be.true
  #
  #       # Validate the demographics values.
  #       it 'should show the age', ->
  #         demographics.then (table) ->
  #           table.age.then (age) ->
  #             expect(age, 'The age is missing').to.exist.and.to.not.be.empty
  #             expect(age, 'The age is not an integer').to.match(/^\d+$/)
  #             expect(parseInt(age), 'The age is not positive')
  #               .to.be.greaterThan(0)
  #
  #       it 'should show the race', ->
  #         demographics.then (table) ->
  #           table.races.then (races) ->
  #             expect(races, 'The race is missing').to.exist.and.to.not.be.empty
  #
  #       it 'should show the ethnicity', ->
  #         demographics.then (table) ->
  #           table.ethnicity.then (ethnicity) ->
  #             expect(ethnicity, 'The ethnicity is missing')
  #               .to.exist.and.to.not.be.empty
  #
  #     describe 'Encounters', ->
  #       describe 'Biopsy', ->
  #         biopsy = null
  #
  #         before ->
  #           biopsy = clinicalProfile.then (profile) ->
  #             profile.find('div[ng-switch-when="Biopsy"]')
  #
  #         # TODO - Add test cases for the date, weight and every outcome, e.g.:
  #         # it 'should show the weight', ->
  #         #   biopsy.then (table) ->
  #         #     table.weight.then (weight) ->
  #         #       expect(weight, 'The weight is missing').to.exist.and.to.not.be.empty
  #         #       expect(weight, 'The weight is not an integer').to.match(/^\d+$/)
  #         #       expect(parseInt(weight), 'The weight is not positive')
  #         #         .to.be.greaterThan(0)
  #
  #         it 'should show the biopsy panel', ->
  #           expect(biopsy, 'The Breast Biopsy panel is missing')
  #             .to.eventually.exist
  #
  #         describe 'Pathology', ->
  #           pathology = null
  #
  #           before ->
  #             # The first (and usually only) tumor panel.
  #             pathology = biopsy.then (biopsy) ->
  #               biopsy.findAll(By.repeater('tumor in pathology.tumors')).then (tumors) ->
  #                 tumors[0]
  #
  #           it 'should show the pathology panel', ->
  #             pathology.then (table) ->
  #               expect(table, 'The pathology panel is missing').to.exist
  #               expect(table.isDisplayed(), 'The pathology panel is not' +
  #                                           ' displayed')
  #                 .to.eventually.be.true
  #
  #           it 'should show the tumor length', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('extent.length')).then (length) ->
  #                 expect(length,
  #                        'The Breast tumor length table is missing')
  #                   .to.exist
  #                 expect(length.isDisplayed(),
  #                        'The Breast tumor length field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the tumor width', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('extent.width')).then (width) ->
  #                 expect(width,
  #                        'The Breast tumor width table is missing')
  #                   .to.exist
  #                 expect(width.isDisplayed(),
  #                        'The Breast tumor width field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the tumor depth', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('extent.depth')).then (depth) ->
  #                 expect(depth,
  #                        'The Breast tumor depth table is missing')
  #                   .to.exist
  #                 expect(depth.isDisplayed(),
  #                        'The Breast tumor depth field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the TNM stage', ->
  #             pathology.then (table) ->
  #               # Note: By.binding('tnm') resolves to multiple elements,
  #               # perhaps because the elements bound to tnm attributes,
  #               # e.g. tnm.size, are included. Therefore, select the
  #               # multiple tnm elements and test the first, which will
  #               # be the stage element.
  #               table.findAll(By.binding('tnm')).then (stages) ->
  #                 stage = stages[0]
  #                 expect(stage, 'The Breast TNM stage table is missing')
  #                   .to.exist
  #                 expect(stage.isDisplayed(),
  #                        'The Breast TNM stage field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should display the TNM stage help button', ->
  #             page.tnmStageHelpButton().then (buttons) ->
  #               button = buttons[0]
  #               expect(button.isDisplayed(), 'The TNM stage help button is not displayed')
  #                 .to.eventually.be.true
  #
  #           it 'should show the Modified B-R tubular formation', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('grade.tubularFormation')).then (diff) ->
  #                 expect(diff,
  #                        'The Modified B-R tubular formation table is missing')
  #                   .to.exist
  #                 expect(diff.isDisplayed(),
  #                        'The Modified B-R tubular formation field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the Modified B-R nuclear pleomorphism', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('grade.nuclearPleomorphism')).then (count) ->
  #                 expect(count,
  #                        'The Modified B-R nuclear pleomorphism table is missing')
  #                   .to.exist
  #                 expect(count.isDisplayed(),
  #                        'The Modified B-R nuclear pleomorphism field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the Modified B-R mitotic count', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('grade.mitoticCount')).then (necrosis) ->
  #                 expect(necrosis,
  #                        'The Modified B-R mitotic count is missing')
  #                   .to.exist
  #                 expect(necrosis.isDisplayed(),
  #                        'The Modified B-R mitotic count is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the TNM size', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('tnm.size')).then (size) ->
  #                 expect(size,
  #                        'The Breast TNM size table is missing')
  #                   .to.exist
  #                 expect(size.isDisplayed(),
  #                        'The Breast TNM size field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the TNM lymph status', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('tnm.lymphStatus')).then (status) ->
  #                 expect(status,
  #                        'The Breast TNM lymph status table is missing')
  #                   .to.exist
  #                 expect(status.isDisplayed(),
  #                        'The Breast TNM lymph status field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the TNM metastasis', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('tnm.metastasis')).then (metastasis) ->
  #                 expect(metastasis,
  #                        'The Breast TNM metastasis table is missing')
  #                   .to.exist
  #                 expect(metastasis.isDisplayed(),
  #                        'The Breast TNM metastasis field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the estrogen receptor result', ->
  #             pathology.then (table) ->
  #               table.findAll(By.binding('receptorStatus.positive')).then (results) ->
  #                 result = results[0]
  #                 expect(result,
  #                        'The Breast estrogen receptor result table is missing')
  #                   .to.exist
  #                 expect(result.isDisplayed(),
  #                        'The Breast estrogen receptor result field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the estrogen receptor intensity', ->
  #             pathology.then (table) ->
  #               table.findAll(By.binding('receptorStatus.intensity')).then (intensities) ->
  #                 intensity = intensities[0]
  #                 expect(intensity,
  #                        'The Breast estrogen receptor intensity table is missing')
  #                   .to.exist
  #                 expect(intensity.isDisplayed(),
  #                        'The Breast estrogen receptor intensity field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the estrogen receptor quick score', ->
  #             pathology.then (table) ->
  #               table.findAll(By.binding('receptorStatus.quickScore')).then (scores) ->
  #                 score = scores[0]
  #                 expect(score,
  #                        'The Breast estrogen receptor quick score table is missing')
  #                   .to.exist
  #                 expect(score.isDisplayed(),
  #                        'The Breast estrogen receptor quick score field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the progesterone receptor result', ->
  #             pathology.then (table) ->
  #               table.findAll(By.binding('receptorStatus.positive')).then (results) ->
  #                 result = results[1]
  #                 expect(result,
  #                        'The Breast progesterone receptor result table is missing')
  #                   .to.exist
  #                 expect(result.isDisplayed(),
  #                        'The Breast progesterone receptor result field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the progesterone receptor intensity', ->
  #             pathology.then (table) ->
  #               table.findAll(By.binding('receptorStatus.intensity')).then (intensities) ->
  #                 intensity = intensities[1]
  #                 expect(intensity,
  #                        'The Breast progesterone receptor intensity table is missing')
  #                   .to.exist
  #                 expect(intensity.isDisplayed(),
  #                        'The Breast progesterone receptor intensity field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the progesterone receptor quick score', ->
  #             pathology.then (table) ->
  #               table.findAll(By.binding('receptorStatus.quickScore')).then (scores) ->
  #                 score = scores[1]
  #                 expect(score,
  #                        'The Breast progesterone receptor quick score table is missing')
  #                   .to.exist
  #                 expect(score.isDisplayed(),
  #                        'The Breast progesterone receptor quick score field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the HER2 NEU IHC expression', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('geneticExpression.her2NeuIhc')).then (her2NeuIhc) ->
  #                 expect(her2NeuIhc,
  #                        'The Breast HER2 NEU IHC expression table is missing')
  #                   .to.exist
  #                 expect(her2NeuIhc.isDisplayed(),
  #                        'The Breast HER2 NEU IHC expression field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the HER2 NEU FISH expression', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('geneticExpression.her2NeuFish')).then (her2NeuFish) ->
  #                 expect(her2NeuFish,
  #                        'The Breast HER2 NEU FISH expression table is missing')
  #                   .to.exist
  #                 expect(her2NeuFish.isDisplayed(),
  #                        'The Breast HER2 NEU FISH expression field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the Ki67 expression', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('geneticExpression.ki67')).then (ki67) ->
  #                 expect(ki67,
  #                        'The Breast Ki67 expression table is missing')
  #                   .to.exist
  #                 expect(ki67.isDisplayed(),
  #                        'The Breast Ki67 expression field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the recurrence score', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('recurrenceScore')).then (recurrence) ->
  #                 expect(recurrence,
  #                        'The Breast recurrence score table is missing')
  #                   .to.exist
  #                 expect(recurrence.isDisplayed(),
  #                        'The Breast recurrence score field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the GSTM1 assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.gstm1')).then (gstm1) ->
  #                 expect(gstm1,
  #                        'The Breast GSTM1 assay table is missing')
  #                   .to.exist
  #                 expect(gstm1.isDisplayed(),
  #                        'The Breast GSTM1 assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the CD68 assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.cd68')).then (cd68) ->
  #                 expect(cd68,
  #                        'The Breast CD68 assay table is missing')
  #                   .to.exist
  #                 expect(cd68.isDisplayed(),
  #                        'The Breast CD68 assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the BAG1 assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.bag1')).then (bag1) ->
  #                 expect(bag1,
  #                        'The Breast BAG1 assay table is missing')
  #                   .to.exist
  #                 expect(bag1.isDisplayed(),
  #                        'The Breast BAG1 assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the GRB7 assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.her2.grb7')).then (grb7) ->
  #                 expect(grb7,
  #                        'The Breast GRB7 assay table is missing')
  #                   .to.exist
  #                 expect(grb7.isDisplayed(),
  #                        'The Breast GRB7 assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the HER2 assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.her2.her2')).then (her2) ->
  #                 expect(her2,
  #                        'The Breast HER2 assay table is missing')
  #                   .to.exist
  #                 expect(her2.isDisplayed(),
  #                        'The Breast HER2 assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the ER assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.estrogen.er')).then (er) ->
  #                 expect(er,
  #                        'The Breast ER assay table is missing')
  #                   .to.exist
  #                 expect(er.isDisplayed(),
  #                        'The Breast ER assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the PGR assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.estrogen.pgr')).then (pgr) ->
  #                 expect(pgr,
  #                        'The Breast PGR assay table is missing')
  #                   .to.exist
  #                 expect(pgr.isDisplayed(),
  #                        'The Breast PGR assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the BCL2 assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.estrogen.bcl2')).then (bcl2) ->
  #                 expect(bcl2,
  #                        'The Breast BCL2 assay table is missing')
  #                   .to.exist
  #                 expect(bcl2.isDisplayed(),
  #                        'The Breast BCL2 assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the SCUBE2 assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.estrogen.scube2')).then (scube2) ->
  #                 expect(scube2,
  #                        'The Breast SCUBE2 assay table is missing')
  #                   .to.exist
  #                 expect(scube2.isDisplayed(),
  #                        'The Breast SCUBE2 assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the Ki67 assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.proliferation.ki67')).then (ki67) ->
  #                 expect(ki67,
  #                        'The Breast Ki67 assay table is missing')
  #                   .to.exist
  #                 expect(ki67.isDisplayed(),
  #                        'The Breast Ki67 assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the STK15 assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.proliferation.stk15')).then (stk15) ->
  #                 expect(stk15,
  #                        'The Breast STK15 assay table is missing')
  #                   .to.exist
  #                 expect(stk15.isDisplayed(),
  #                        'The Breast STK15 assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the Survivin assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.proliferation.survivin')).then (survivin) ->
  #                 expect(survivin,
  #                        'The Breast Survivin assay table is missing')
  #                   .to.exist
  #                 expect(survivin.isDisplayed(),
  #                        'The Breast Survivin assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the CCNB1 assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.proliferation.ccnb1')).then (ccnb1) ->
  #                 expect(ccnb1,
  #                        'The Breast CCNB1 assay table is missing')
  #                   .to.exist
  #                 expect(ccnb1.isDisplayed(),
  #                        'The Breast CCNB1 assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the MYBL2 assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.proliferation.mybl2')).then (mybl2) ->
  #                 expect(mybl2,
  #                        'The Breast MYBL2 assay table is missing')
  #                   .to.exist
  #                 expect(mybl2.isDisplayed(),
  #                        'The Breast MYBL2 assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the MMP11 assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.invasion.mmp11')).then (mmp11) ->
  #                 expect(mmp11,
  #                        'The Breast MMP11 assay table is missing')
  #                   .to.exist
  #                 expect(mmp11.isDisplayed(),
  #                        'The Breast MMP11 assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the CTSL2 assay', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('assay.invasion.ctsl2')).then (ctsl2) ->
  #                 expect(ctsl2,
  #                        'The Breast CTSL2 assay table is missing')
  #                   .to.exist
  #                 expect(ctsl2.isDisplayed(),
  #                        'The Breast CTSL2 assay field is not displayed')
  #                   .to.eventually.be.true
  #
  #       describe 'Surgery', ->
  #         surgery = null
  #
  #         before ->
  #           surgery = clinicalProfile.then (profile) ->
  #             profile.find('div[ng-switch-when="Surgery"]')
  #
  #         it 'should show the surgery panel', ->
  #           surgery.then (table) ->
  #             expect(table, 'The Breast surgery panel is missing').to.exist
  #             expect(table.isDisplayed(), 'The Breast surgery panel is not' +
  #                                         ' displayed')
  #               .to.eventually.be.true
  #
  #         describe 'Pathology', ->
  #           pathology = null
  #
  #           before ->
  #              pathology = surgery.then (surgery) ->
  #               surgery.findAll(By.repeater('tumor in pathology.tumors')).then (tumors) ->
  #                 tumors[0]
  #
  #           it 'should show the pathology panel', ->
  #             pathology.then (table) ->
  #               expect(table, 'The pathology panel is missing').to.exist
  #               expect(table.isDisplayed(), 'The pathology panel is not' +
  #                                           ' displayed')
  #                 .to.eventually.be.true
  #
  #           it 'should show the residual cancer burden index', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('rcb.rcbIndex')).then (score) ->
  #                 expect(score,
  #                        'The RCB index table is missing')
  #                   .to.exist
  #                 expect(score.isDisplayed(),
  #                        'The RCB index field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the residual cancer burden class', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('rcb.rcbClass')).then (cls) ->
  #                 expect(cls,
  #                        'The RCB class table is missing')
  #                   .to.exist
  #                 expect(cls.isDisplayed(),
  #                        'The RCB class field is not displayed')
  #                   .to.eventually.be.true
  #
  #     describe 'Treatments', ->
  #       describe 'Neoadjuvant Treatment', ->
  #         treatment = null
  #
  #         before ->
  #           treatment = clinicalProfile.then (profile) ->
  #             profile.findAll(By.css('.treatment')).then (treatments) ->
  #                 treatments[0]
  #
  #         it 'should show the treatment panel', ->
  #           treatment.then (table) ->
  #             expect(table, 'The treatment panel is missing').to.exist
  #             expect(table.isDisplayed(), 'The treatment panel is not' +
  #                                         ' displayed')
  #               .to.eventually.be.true
  #
  #         it 'should show the treatment start date', ->
  #           treatment.then (table) ->
  #             table.find(By.binding('treatment.startDate')).then (start) ->
  #               expect(start,
  #                      'The treatment start date table is missing')
  #                 .to.exist
  #               expect(start.isDisplayed(),
  #                      'The treatment start date field is not displayed')
  #                 .to.eventually.be.true
  #
  #         it 'should show the treatment end date', ->
  #           treatment.then (table) ->
  #             table.find(By.binding('treatment.endDate')).then (end) ->
  #               expect(end,
  #                      'The treatment end date table is missing')
  #                 .to.exist
  #               expect(end.isDisplayed(),
  #                      'The treatment end date field is not displayed')
  #                 .to.eventually.be.true
  #
  #         describe 'Chemotherapy', ->
  #           chemo = null
  #
  #           before ->
  #             chemo = clinicalProfile.then (profile) ->
  #               profile.findAll(By.css('.dosage')).then (dosages) ->
  #                 dosages[0]
  #
  #           it 'should show the chemotherapy panel', ->
  #             chemo.then (table) ->
  #               expect(table, 'The chemotherapy panel is missing').to.exist
  #               expect(table.isDisplayed(), 'The chemotherapy panel is not' +
  #                                           ' displayed')
  #                 .to.eventually.be.true
  #
  #           it 'should show the agent name', ->
  #             chemo.then (table) ->
  #               table.find(By.binding('dosage.agent.name')).then (name) ->
  #                 expect(name,
  #                        'The chemotherapy agent name table is missing')
  #                   .to.exist
  #                 expect(name.isDisplayed(),
  #                        'The chemotherapy agent name field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the dosage start date', ->
  #             chemo.then (table) ->
  #               table.find(By.binding('dosage.startDate')).then (start) ->
  #                 expect(start,
  #                        'The chemotherapy dosage start date table is missing')
  #                   .to.exist
  #                 expect(start.isDisplayed(),
  #                        'The chemotherapy dosage start date field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the dosage amount', ->
  #             chemo.then (table) ->
  #               table.find(By.binding('dosage.amount')).then (amount) ->
  #                 expect(amount,
  #                        'The chemotherapy dosage amount table is missing')
  #                   .to.exist
  #                 expect(amount.isDisplayed(),
  #                        'The chemotherapy dosage amount field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the dosage duration', ->
  #             chemo.then (table) ->
  #               table.find(By.binding('dosage.duration')).then (duration) ->
  #                 expect(duration,
  #                        'The chemotherapy dosage duration table is missing')
  #                   .to.exist
  #                 expect(duration.isDisplayed(),
  #                        'The chemotherapy dosage duration field is not displayed')
  #                   .to.eventually.be.true
  #
  #         describe 'Radiotherapy', ->
  #           # TODO - Add radiotherapy test cases.
  #
  # describe 'Sarcoma', ->
  #   page = null
  #
  #   beforeEach ->
  #     page = new SubjectDetailPage '/quip/sarcoma/subject/1?project=QIN_Test'
  #
  #   it 'should load the page', ->
  #     expect(page.content(), 'The page was not loaded').to.eventually.exist
  #
  #   # The Sarcoma-specific page header test cases.
  #   describe 'Header', ->
  #     it 'should display the billboard', ->
  #       expect(page.billboard(), 'The billboard is incorrect')
  #         .to.eventually.equal('Sarcoma Patient 1')
  #
  #   describe 'Clinical Profile', ->
  #     clinicalProfile = null
  #
  #     before ->
  #       clinicalProfile = page.clinicalProfile()
  #
  #     it 'should show the clinical profile', ->
  #       expect(clinicalProfile, 'The Sarcoma clinical profile is missing')
  #         .to.eventually.exist
  #
  #     describe 'Encounters', ->
  #       describe 'Biopsy', ->
  #         biopsy = null
  #
  #         before ->
  #           biopsy = clinicalProfile.then (profile) ->
  #             profile.find('div[ng-switch-when="Biopsy"]')
  #
  #         it 'should show the biopsy panel', ->
  #           biopsy.then (table) ->
  #             expect(table, 'The Sarcoma biopsy panel is missing').to.exist
  #             expect(table.isDisplayed(), 'The Sarcoma biopsy panel is not' +
  #                                         ' displayed')
  #               .to.eventually.be.true
  #
  #         describe 'Pathology', ->
  #           pathology = null
  #
  #           before ->
  #             pathology = biopsy.then (biopsy) ->
  #               biopsy.findAll(By.repeater('tumor in pathology.tumors')).then (tumors) ->
  #                 tumors[0]
  #
  #           it 'should show the pathology panel', ->
  #             pathology.then (table) ->
  #               expect(table, 'The pathology panel is missing').to.exist
  #               expect(table.isDisplayed(), 'The pathology panel is not' +
  #                                           ' displayed')
  #                 .to.eventually.be.true
  #
  #           it 'should show the tumor body part', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('tumor.location.body_part')).then (part) ->
  #                 expect(part, 'The Sarcoma body part table is missing').to.exist
  #                 expect(part.isDisplayed(), 'The Sarcoma body part field is not' +
  #                                            ' displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the tumor sagittal location', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('tumor.location.sagittal_location')).then (sag) ->
  #                 expect(sag, 'The Sarcoma sagittal location table is missing').to.exist
  #                 expect(sag.isDisplayed(), 'The Sarcoma sagittal location field is not' +
  #                                           ' displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the tumor coronal location', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('tumor.location.coronal_location')).then (cor) ->
  #                 expect(cor, 'The Sarcoma coronal location table is missing').to.exist
  #                 expect(cor.isDisplayed(), 'The Sarcoma coronal location field is not' +
  #                                           ' displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the tumor histology', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('tumor.histology')).then (histology) ->
  #                 expect(histology, 'The Sarcoma histology table is' +
  #                                   ' missing').to.exist
  #                 expect(histology.isDisplayed(), 'The Sarcoma histology field' +
  #                                                 ' is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the TNM stage', ->
  #             pathology.then (table) ->
  #               # See the Breast TNM test case above for the rationale of
  #               # findAll as opposed to find.
  #               table.findAll(By.binding('tnm')).then (stages) ->
  #                 stage = stages[0]
  #                 expect(stage,
  #                        'The Sarcoma TNM stage table is missing')
  #                   .to.exist
  #                 expect(stage.isDisplayed(),
  #                        'The Sarcoma TNM stage field is not displayed')
  #                   .to.eventually.be.true
  #                 expect(stage, 'The stage is undefined').not.to.equal("undefined")
  #
  #           it 'should show the FNCLCC differentiation', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('grade.differentiation')).then (diff) ->
  #                 expect(diff,
  #                        'The FNCLCC differentiation table is missing')
  #                   .to.exist
  #                 expect(diff.isDisplayed(),
  #                        'The FNCLCC differentiation field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the FNCLCC mitotic count', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('grade.mitoticCount')).then (count) ->
  #                 expect(count,
  #                        'The FNCLCC mitotic count table is missing')
  #                   .to.exist
  #                 expect(count.isDisplayed(),
  #                        'The FNCLCC mitotic count field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the FNCLCC necrosis score', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('grade.necrosis_score')).then (necrosis) ->
  #                 expect(necrosis,
  #                        'The FNCLCC necrosis score is missing')
  #                   .to.exist
  #                 expect(necrosis.isDisplayed(),
  #                        'The FNCLCC necrosis score is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the TNM size', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('tnm.size')).then (size) ->
  #                 expect(size,
  #                        'The Sarcoma TNM size table is missing')
  #                   .to.exist
  #                 expect(size.isDisplayed(),
  #                        'The Sarcoma TNM size field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the TNM lymph status', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('tnm.lymphStatus')).then (status) ->
  #                 expect(status,
  #                        'The Sarcoma TNM lymph status table is missing')
  #                   .to.exist
  #                 expect(status.isDisplayed(),
  #                        'The Sarcoma TNM lymph status field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the TNM metastasis', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('tnm.metastasis')).then (metastasis) ->
  #                 expect(metastasis,
  #                        'The Sarcoma TNM metastasis table is missing')
  #                   .to.exist
  #                 expect(metastasis.isDisplayed(),
  #                        'The Sarcoma TNM metastasis field is not displayed')
  #                   .to.eventually.be.true
  #
  #           it 'should show the necrosis percent range', ->
  #             pathology.then (table) ->
  #               table.find(By.binding('necrosis_percent')).then (range) ->
  #                 expect(range,
  #                        'The Sarcoma necrosis percent range table is missing')
  #                   .to.exist
  #                 expect(range.isDisplayed(),
  #                        'The Sarcoma necrosis percent range field is not' +
  #                        ' displayed')
  #                   .to.eventually.be.true
