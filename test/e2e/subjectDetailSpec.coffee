_ = require 'lodash'

expect = require('./helpers/expect')()

Page = require './helpers/page'

class SubjectDetailPage extends Page
  #constructor: ->

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
            table.addBindings(spec.bindings) if table?
        
        # The table accessor properties.
        for name in Object.keys(TABLES)
          profile[name] = getTable(name)

        # The encounter accessor properties.
        for enc in ['Biopsy', 'Surgery', 'Assessment']
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
        pat = /a href="http:\/\/qiprofile\.idea\.informer\.com"/
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
          page.imageProfileFormatButton().then (button) ->
            button.click().then ->
              modelingTables = page.modelingTables()
        
        after ->
          # Restore the format to chart.
          page.imageProfileFormatButton().then (button) ->
            button.click()

        # There are three modeling tables, one for each PK modeling
        # property.
        it 'should have three modeling parameter tables', ->
          modelingTables.then (tables) ->
            # The modeling tables exists.
            expect(tables, 'The modeling parameter tables are missing')
              .to.exist.and.not.be.empty
            expect(tables.length,
                   'The modeling parameter table count is incorrect')
              .to.equal(3)
        
        describe 'Properties', ->
          it 'should display the column headers', ->
            modelingTables.then (tables) ->
              for table, tblNdx in tables
                table.header().then (headings) ->
                  for heading, hdgNdx in headings 
                    expect(heading, "Table #{ tblNdx + 1 } is missing column" +
                                    " heading #{ hdgNdx + 1 }")
                      .to.exist.and.not.be.empty
          
          it 'should have four Breast patient visits', ->
            modelingTables.then (tables) ->
              for table, tblNdx in tables
                table.body().then (rows) ->
                  expect(rows.length,
                         "Table #{ tblNdx + 1 } row count is incorrect")
                    .to.equal(4)
          
          it 'should show the visit dates', ->
            modelingTables.then (tables) ->
              # The expected visit dates are the first column of the first
              # table.
              referenceTable = _.first(tables)
              expected = null
              referenceTable.body().then (rows) ->
                expected = (_.first(columns) for columns in rows)
                for date, rowNdx in expected
                  expect(date,
                         "The table 1 row #{ rowNdx + 1 } visit date is missing")
                    .to.exist
                # The date values for every remaining table should be
                # consistent with those of the first table.
                for table, tblNdx in _.rest(tables)
                  table.body().then (rows) ->
                    for columns, rowNdx in rows
                      date = _.first(columns)
                      expect(date,
                             "The table #{ tblNdx + 2 } row #{ rowNdx + 1 }" +
                             " visit date is missing")
                        .to.exist
                      expect(date,
                             "The table #{ tblNdx + 2 } row #{ rowNdx + 1 }" +
                             " visit date is incorrect")
                        .to.equal(expected[rowNdx])
                          
          it 'should have seven Ktrans table columns', ->
            modelingTables.then (tables) ->
              # The KTrans table is the first table.
              table = _.first(tables)
              table.body().then (rows) ->
                for row, rowNdx in rows
                  expect(row.length, "The Ktrans table row #{ rowNdx + 1 }" +
                                     " column count is incorrect").to.equal(7)
                  
          it 'should have three non-Ktrans table columns', ->
            modelingTables.then (tables) ->
              # The KTrans table is the first table.
              tables = _.rest(tables)
              for table, tblNdx in tables
                table.body().then (rows) ->
                  for row, rowNdx in rows
                    expect(row.length,
                           "The table #{ tblNdx + 2 } row #{ rowNdx + 1 }" +
                           " column count is incorrect").to.equal(3)
                  
          it 'should not have a blank non-percent change value', ->
            modelingTables.then (tables) ->
              for table, tblNdx in tables
                table.body().then (rows) ->
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
                table.body().then (rows) ->
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
                table.body().then (rows) ->
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
        expect(clinicalProfile, 'The Breast clinical profile is missing')
          .to.eventually.exist

      describe 'Demographics', ->
        demographics = null
        
        before ->
          demographics = clinicalProfile.then (profile) ->
            profile.demographics

        it 'should show the demographics table', ->
          demographics.then (table) ->
            expect(table, 'The demographics table is missing').to.exist
            expect(table.isDisplayed(), 'The demographics table is not displayed')
              .to.eventually.be.true

        # Validate the demographics values.
        it 'should show the age', ->
          demographics.then (table) ->
            table.age.then (age) ->
              expect(age, 'The age is missing').to.exist.and.to.not.be.empty
              expect(age, 'The age is not an integer').to.match(/^\d+$/)
              expect(parseInt(age), 'The age is not positive')
                .to.be.greaterThan(0)
              
        it 'should show the race', ->
          demographics.then (table) ->
            table.races.then (races) ->
              expect(races, 'The race is missing').to.exist.and.to.not.be.empty
              
        it 'should show the ethnicity', ->
          demographics.then (table) ->
            table.ethnicity.then (ethnicity) ->
              expect(ethnicity, 'The ethnicity is missing')
                .to.exist.and.to.not.be.empty
      
      describe 'Encounters', ->
        describe 'Biopsy', ->
          biopsy = null
      
          before ->
            biopsy = clinicalProfile.then (profile) ->
              profile.find('div[ng-switch-when="Biopsy"]')

          # TODO - Add test cases for the date, weight and every outcome, e.g.:
          # it 'should show the weight', ->
          #   biopsy.then (table) ->
          #     table.weight.then (weight) ->
          #       expect(weight, 'The weight is missing').to.exist.and.to.not.be.empty
          #       expect(weight, 'The weight is not an integer').to.match(/^\d+$/)
          #       expect(parseInt(weight), 'The weight is not positive')
          #         .to.be.greaterThan(0)

          # TODO - Test cases for receptor status.

          # TODO - Test cases for genetic expression.

          it 'should show the TNM stage', ->
            biopsy.then (table) ->
              table.find(By.binding('tnm')).then (stage) ->
                expect(stage,
                       'The Breast TNM stage table is missing')
                  .to.exist
                expect(stage.isDisplayed(),
                       'The Breast TNM stage field is not displayed')
                  .to.eventually.be.true

          it 'should show the Modified B-R tubular formation', ->
            biopsy.then (table) ->
              table.find(By.binding('grade.tubularFormation')).then (diff) ->
                expect(diff,
                       'The Modified B-R tubular formation table is missing')
                  .to.exist
                expect(diff.isDisplayed(),
                       'The Modified B-R tubular formation field is not displayed')
                  .to.eventually.be.true

          it 'should show the Modified B-R nuclear pleomorphism', ->
            biopsy.then (table) ->
              table.find(By.binding('grade.nuclearPleomorphism')).then (count) ->
                expect(count,
                       'The Modified B-R nuclear pleomorphism table is missing')
                  .to.exist
                expect(count.isDisplayed(),
                       'The Modified B-R nuclear pleomorphism field is not displayed')
                  .to.eventually.be.true

          it 'should show the Modified B-R mitotic count', ->
            biopsy.then (table) ->
              table.find(By.binding('grade.mitoticCount')).then (necrosis) ->
                expect(necrosis,
                       'The Modified B-R mitotic count is missing')
                  .to.exist
                expect(necrosis.isDisplayed(),
                       'The Modified B-R mitotic count is not displayed')
                  .to.eventually.be.true

          it 'should show the TNM size', ->
            biopsy.then (table) ->
              table.find(By.binding('tnm.size')).then (size) ->
                expect(size,
                       'The Breast TNM size table is missing')
                  .to.exist
                expect(size.isDisplayed(),
                       'The Breast TNM size field is not displayed')
                  .to.eventually.be.true

          it 'should show the TNM lymph status', ->
            biopsy.then (table) ->
              table.find(By.binding('tnm.lymphStatus')).then (status) ->
                expect(status,
                       'The Breast TNM lymph status table is missing')
                  .to.exist
                expect(status.isDisplayed(),
                       'The Breast TNM lymph status field is not displayed')
                  .to.eventually.be.true

          it 'should show the TNM metastasis', ->
            biopsy.then (table) ->
              table.find(By.binding('tnm.metastasis')).then (metastasis) ->
                expect(metastasis,
                       'The Breast TNM metastasis table is missing')
                  .to.exist
                expect(metastasis.isDisplayed(),
                       'The Breast TNM metastasis field is not displayed')
                  .to.eventually.be.true

        describe 'Assessment', ->
          assessment = null
      
          before ->
            assessment = clinicalProfile.then (profile) ->
              profile.find('div[ng-switch-when="Assessment"]')
          
          it 'should show the assessment panel', ->
            assessment.then (table) ->
              expect(table, 'The Breast assessment panel is missing').to.exist
              expect(table.isDisplayed(), 'The Breast assessment panel is not' +
                                          ' displayed')
                .to.eventually.be.true

          it 'should show the TNM stage', ->
            assessment.then (table) ->
              table.find(By.binding('tnm')).then (stage) ->
                expect(stage,
                       'The Breast TNM stage table is missing')
                  .to.exist
                expect(stage.isDisplayed(),
                       'The Breast TNM stage field is not displayed')
                  .to.eventually.be.true

          it 'should show the Modified B-R tubular formation', ->
            assessment.then (table) ->
              table.find(By.binding('grade.tubularFormation')).then (diff) ->
                expect(diff,
                       'The Modified B-R tubular formation table is missing')
                  .to.exist
                expect(diff.isDisplayed(),
                       'The Modified B-R tubular formation field is not displayed')
                  .to.eventually.be.true

          it 'should show the Modified B-R nuclear pleomorphism', ->
            assessment.then (table) ->
              table.find(By.binding('grade.nuclearPleomorphism')).then (count) ->
                expect(count,
                       'The Modified B-R nuclear pleomorphism table is missing')
                  .to.exist
                expect(count.isDisplayed(),
                       'The Modified B-R nuclear pleomorphism field is not displayed')
                  .to.eventually.be.true

          it 'should show the Modified B-R mitotic count', ->
            assessment.then (table) ->
              table.find(By.binding('grade.mitoticCount')).then (necrosis) ->
                expect(necrosis,
                       'The Modified B-R mitotic count is missing')
                  .to.exist
                expect(necrosis.isDisplayed(),
                       'The Modified B-R mitotic count is not displayed')
                  .to.eventually.be.true

          it 'should show the TNM size', ->
            assessment.then (table) ->
              table.find(By.binding('tnm.size')).then (size) ->
                expect(size,
                       'The Breast TNM size table is missing')
                  .to.exist
                expect(size.isDisplayed(),
                       'The Breast TNM size field is not displayed')
                  .to.eventually.be.true

          it 'should show the TNM lymph status', ->
            assessment.then (table) ->
              table.find(By.binding('tnm.lymphStatus')).then (status) ->
                expect(status,
                       'The Breast TNM lymph status table is missing')
                  .to.exist
                expect(status.isDisplayed(),
                       'The Breast TNM lymph status field is not displayed')
                  .to.eventually.be.true

          it 'should show the TNM metastasis', ->
            assessment.then (table) ->
              table.find(By.binding('tnm.metastasis')).then (metastasis) ->
                expect(metastasis,
                       'The Breast TNM metastasis table is missing')
                  .to.exist
                expect(metastasis.isDisplayed(),
                       'The Breast TNM metastasis field is not displayed')
                  .to.eventually.be.true

      describe 'Treatments', ->
        describe 'Neoadjuvant Treatment', ->
          treatment = null

          before ->
            treatment = clinicalProfile.then (profile) ->
              profile.find(By.css('.treatment'))

          it 'should show the treatment panel', ->
            treatment.then (table) ->
              expect(table, 'The treatment panel is missing').to.exist
              expect(table.isDisplayed(), 'The treatment panel is not' +
                                          ' displayed')
                .to.eventually.be.true

          it 'should show the treatment start date', ->
            treatment.then (table) ->
              table.find(By.binding('treatment.startDate')).then (start) ->
                expect(start,
                       'The treatment start date table is missing')
                  .to.exist
                expect(start.isDisplayed(),
                       'The treatment start date field is not displayed')
                  .to.eventually.be.true

          it 'should show the treatment end date', ->
            treatment.then (table) ->
              table.find(By.binding('treatment.endDate')).then (end) ->
                expect(end,
                       'The treatment end date table is missing')
                  .to.exist
                expect(end.isDisplayed(),
                       'The treatment end date field is not displayed')
                  .to.eventually.be.true

          describe 'Chemotherapy', ->
            chemo = null

            before ->
              chemo = clinicalProfile.then (profile) ->
                profile.find(By.css('.dosage'))

            it 'should show the chemotherapy panel', ->
              chemo.then (table) ->
                expect(table, 'The chemotherapy panel is missing').to.exist
                expect(table.isDisplayed(), 'The chemotherapy panel is not' +
                                            ' displayed')
                  .to.eventually.be.true

            it 'should show the agent name', ->
              chemo.then (table) ->
                table.find(By.binding('dosage.agent.name')).then (name) ->
                  expect(name,
                         'The chemotherapy agent name table is missing')
                    .to.exist
                  expect(name.isDisplayed(),
                         'The chemotherapy agent name field is not displayed')
                    .to.eventually.be.true

            it 'should show the dosage start date', ->
              chemo.then (table) ->
                table.find(By.binding('dosage.startDate')).then (start) ->
                  expect(start,
                         'The chemotherapy dosage start date table is missing')
                    .to.exist
                  expect(start.isDisplayed(),
                         'The chemotherapy dosage start date field is not displayed')
                    .to.eventually.be.true

            it 'should show the dosage amount', ->
              chemo.then (table) ->
                table.find(By.binding('dosage.amount')).then (amount) ->
                  expect(amount,
                         'The chemotherapy dosage amount table is missing')
                    .to.exist
                  expect(amount.isDisplayed(),
                         'The chemotherapy dosage amount field is not displayed')
                    .to.eventually.be.true

            it 'should show the dosage duration', ->
              chemo.then (table) ->
                table.find(By.binding('dosage.duration')).then (duration) ->
                  expect(duration,
                         'The chemotherapy dosage duration table is missing')
                    .to.exist
                  expect(duration.isDisplayed(),
                         'The chemotherapy dosage duration field is not displayed')
                    .to.eventually.be.true
        
          describe 'Radiotherapy', ->
            # TODO - Add radiotherapy test cases.

  describe 'Sarcoma', ->
    page = null
    
    beforeEach ->
      page = new SubjectDetailPage '/quip/sarcoma/subject/1?project=QIN_Test'

    it 'should load the page', ->
      expect(page.content, 'The page was not loaded').to.eventually.exist
    
    # The Sarcoma-specific page header test cases.
    describe 'Header', ->
      it 'should display the billboard', ->
        expect(page.billboard, 'The billboard is incorrect')
          .to.eventually.equal('Sarcoma Patient 1')

    describe 'Clinical Profile', ->
      clinicalProfile = null

      before ->
        clinicalProfile = page.clinicalProfile()

      it 'should show the clinical profile', ->
        expect(clinicalProfile, 'The Sarcoma clinical profile is missing')
          .to.eventually.exist
      
      describe 'Encounters', ->
        describe 'Biopsy', ->
          biopsy = null
      
          before ->
            biopsy = clinicalProfile.then (profile) ->
              profile.find('div[ng-switch-when="Biopsy"]')
          
          it 'should show the biopsy panel', ->
            biopsy.then (table) ->
              expect(table, 'The Sarcoma biopsy panel is missing').to.exist
              expect(table.isDisplayed(), 'The Sarcoma biopsy panel is not' +
                                          ' displayed')
                .to.eventually.be.true

          it 'should show the tumor site', ->
            biopsy.then (table) ->
              table.find(By.binding('tumor.location')).then (site) ->
                expect(site, 'The Sarcoma site table is missing').to.exist
                expect(site.isDisplayed(), 'The Sarcoma site field is not' +
                                           ' displayed')
                  .to.eventually.be.true

          it 'should show the tumor histology', ->
            biopsy.then (table) ->
              table.find(By.binding('tumor.histology')).then (histology) ->
                expect(histology, 'The Sarcoma histology table is' +
                                  ' missing').to.exist
                expect(histology.isDisplayed(), 'The Sarcoma histology field' +
                                                ' is not displayed')
                  .to.eventually.be.true

          it 'should show the TNM stage', ->
            biopsy.then (table) ->
              table.find(By.binding('tnm')).then (stage) ->
                expect(stage,
                       'The Sarcoma TNM stage table is missing')
                  .to.exist
                expect(stage.isDisplayed(),
                       'The Sarcoma TNM stage field is not displayed')
                  .to.eventually.be.true
                expect(stage, 'The stage is undefined').not.to.equal("undefined")

          it 'should show the FNCLCC differentiation', ->
            biopsy.then (table) ->
              table.find(By.binding('grade.differentiation')).then (diff) ->
                expect(diff,
                       'The FNCLCC differentiation table is missing')
                  .to.exist
                expect(diff.isDisplayed(),
                       'The FNCLCC differentiation field is not displayed')
                  .to.eventually.be.true

          it 'should show the FNCLCC mitotic count', ->
            biopsy.then (table) ->
              table.find(By.binding('grade.mitoticCount')).then (count) ->
                expect(count,
                       'The FNCLCC mitotic count table is missing')
                  .to.exist
                expect(count.isDisplayed(),
                       'The FNCLCC mitotic count field is not displayed')
                  .to.eventually.be.true

          it 'should show the FNCLCC necrosis score', ->
            biopsy.then (table) ->
              table.find(By.binding('grade.necrosis_score')).then (necrosis) ->
                expect(necrosis,
                       'The FNCLCC necrosis score is missing')
                  .to.exist
                expect(necrosis.isDisplayed(),
                       'The FNCLCC necrosis score is not displayed')
                  .to.eventually.be.true

          it 'should show the TNM size', ->
            biopsy.then (table) ->
              table.find(By.binding('tnm.size')).then (size) ->
                expect(size,
                       'The Sarcoma TNM size table is missing')
                  .to.exist
                expect(size.isDisplayed(),
                       'The Sarcoma TNM size field is not displayed')
                  .to.eventually.be.true

          it 'should show the TNM lymph status', ->
            biopsy.then (table) ->
              table.find(By.binding('tnm.lymphStatus')).then (status) ->
                expect(status,
                       'The Sarcoma TNM lymph status table is missing')
                  .to.exist
                expect(status.isDisplayed(),
                       'The Sarcoma TNM lymph status field is not displayed')
                  .to.eventually.be.true

          it 'should show the TNM metastasis', ->
            biopsy.then (table) ->
              table.find(By.binding('tnm.metastasis')).then (metastasis) ->
                expect(metastasis,
                       'The Sarcoma TNM metastasis table is missing')
                  .to.exist
                expect(metastasis.isDisplayed(),
                       'The Sarcoma TNM metastasis field is not displayed')
                  .to.eventually.be.true

          it 'should show the necrosis percent range', ->
            biopsy.then (table) ->
              table.find(By.binding('necrosis_percent')).then (range) ->
                expect(range,
                       'The Sarcoma necrosis percent range table is missing')
                  .to.exist
                expect(range.isDisplayed(),
                       'The Sarcoma necrosis percent range field is not' +
                       ' displayed')
                  .to.eventually.be.true

        describe 'Assessment', ->
          assessment = null
      
          before ->
            assessment = clinicalProfile.then (profile) ->
              profile.find('div[ng-switch-when="Assessment"]')
          
          it 'should show the assessment panel', ->
            assessment.then (table) ->
              expect(table, 'The Sarcoma assessment panel is missing').to.exist
              expect(table.isDisplayed(), 'The Sarcoma assessment panel is not' +
                                          ' displayed')
                .to.eventually.be.true

          it 'should show the TNM stage', ->
            assessment.then (table) ->
              table.find(By.binding('tnm')).then (stage) ->
                expect(stage,
                       'The Sarcoma TNM stage table is missing')
                  .to.exist
                expect(stage.isDisplayed(),
                       'The Sarcoma TNM stage field is not displayed')
                  .to.eventually.be.true 

          it 'should show the FNCLCC differentiation', ->
            assessment.then (table) ->
              table.find(By.binding('grade.differentiation')).then (diff) ->
                expect(diff,
                       'The FNCLCC differentiation table is missing')
                  .to.exist
                expect(diff.isDisplayed(),
                       'The FNCLCC differentiation field is not displayed')
                  .to.eventually.be.true

          it 'should show the FNCLCC mitotic count', ->
            assessment.then (table) ->
              table.find(By.binding('grade.mitoticCount')).then (count) ->
                expect(count,
                       'The FNCLCC mitotic count table is missing')
                  .to.exist
                expect(count.isDisplayed(),
                       'The FNCLCC mitotic count field is not displayed')
                  .to.eventually.be.true

          it 'should show the FNCLCC necrosis score', ->
            assessment.then (table) ->
              table.find(By.binding('grade.necrosis_score')).then (necrosis) ->
                expect(necrosis,
                       'The FNCLCC necrosis score is missing')
                  .to.exist
                expect(necrosis.isDisplayed(),
                       'The FNCLCC necrosis score is not displayed')
                  .to.eventually.be.true

          it 'should show the TNM size', ->
            assessment.then (table) ->
              table.find(By.binding('tnm.size')).then (size) ->
                expect(size,
                       'The Sarcoma TNM size table is missing')
                  .to.exist
                expect(size.isDisplayed(),
                       'The Sarcoma TNM size field is not displayed')
                  .to.eventually.be.true

          it 'should show the TNM lymph status', ->
            assessment.then (table) ->
              table.find(By.binding('tnm.lymphStatus')).then (status) ->
                expect(status,
                       'The Sarcoma TNM lymph status table is missing')
                  .to.exist
                expect(status.isDisplayed(),
                       'The Sarcoma TNM lymph status field is not displayed')
                  .to.eventually.be.true

          it 'should show the TNM metastasis', ->
            assessment.then (table) ->
              table.find(By.binding('tnm.metastasis')).then (metastasis) ->
                expect(metastasis,
                       'The Sarcoma TNM metastasis table is missing')
                  .to.exist
                expect(metastasis.isDisplayed(),
                       'The Sarcoma TNM metastasis field is not displayed')
                  .to.eventually.be.true
