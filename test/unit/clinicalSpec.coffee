define ['ngmocks', 'moment', 'clinical'], (ngmocks, moment, clinical) -> 
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
        # TODO - Use the resource data model to create the mock subject.          
        subject:
          # The anonymized birth date is July 7.
          birth_date: moment([1985, 6, 7])
          races: ['Black', 'Asian']
          ethnicity: 'Non-Hispanic'
          encounters:
            [
              {
                date: moment([2014, 2, 12])
                outcomes: [
                  # TODO - grade is an aggregate.
                  # tnm: {
                  #   grade: 2
                  #   lymphStatus: 3
                  #   metastasis: true
                  #   size: "pT3"
                  # }
                ]
                encounter_type: "Biopsy"
              }
              {
                date: moment([2014, 4, 6])
                outcomes: [
                  # tnm: {
                  #   #
                  #   grade: 3
                  #   lymphStatus: 2
                  #   metastasis: true
                  #   size: "pT2"
                  # }
                ]
                encounter_type: "Assessment"
              }
            ]
      
      config = null
      
      beforeEach ->
        # The Clinical Profile configuration.
        config = Clinical.configureProfile(mock.subject)

      it.only 'should set the open flag', ->
        expect(config.open, "Open flag is not true").to.be.true
