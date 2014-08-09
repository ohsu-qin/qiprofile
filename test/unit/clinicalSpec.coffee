define ['ngmocks', 'clinical'], (ngmocks, clinical) -> 
  describe 'Unit Testing Clinical Service', ->
    # The qiprofile Clinical Profile factory.
    Clinical = null

    beforeEach ->
      # Fake the clinical service.
      angular.mock.module('qiprofile.clinical')
      inject ['Clinical', (_Clinical_) ->
        Clinical = _Clinical_
      ]

    describe 'Clinical Profile', ->
      # FIXME - test is broken with the REST model changes.
      # TODO - change mock to conform with REST model and
      # rerun after clinical is refactored per the app TODOs.
      mock =
        subject:
          birth_date: new Date
          races: ['Black', 'Asian']
          ethnicity: 'Non-Hispanic'
          encounters:
            [
              {
                date: new Date
                outcomes: [
                  # TODO - make a pathology outcome here.
                  # TODO - grade is composite.
                  # tnm: {
                  #   grade: 2
                  #   lymph_status: 3
                  #   metastasis: true
                  #   size: "pT3"
                  # }
                ]
                encounter_type: "Biopsy"
              }
              {
                date: new Date
                outcomes: [
                  # tnm: {
                  #   #
                  #   grade: 3
                  #   lymph_status: 2
                  #   metastasis: true
                  #   size: "pT2"
                  # }
                ]
                encounter_type: "Assessment"
              }
            ]
      
      
      it 'should configure the clinical profile panel', ->
        # The Clinical Profile configuration.
        config = Clinical.configureProfile(mock.subject)
        # Validate the configuration.
        # TODO - compare to the mock values for each encounter
        # and each demographic and outcome value.
        # TODO - these should be broken out into test cases.
        # TODO - add expect message arguments.
        expect(config.encounters).to.exist
        expect(config.encounters.length).to.equal(2)
        expect(config.races).to.exist
        expect(config.ethnicity).to.exist
        expect(config.demogrOpen).to.equal(true)
