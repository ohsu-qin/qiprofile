define ['ngmocks', 'modeling'], ->
  describe 'Unit Testing Modeling Service', ->
    # TODO - add chart test cases as in the intensitySpec.

    describe 'Imaging Profile Table', ->
      # The mock input.
      mock = 
        sessions: [
          acquisitionDate: new Date
          modeling:
            v_e: 2.4
            tau_i: 0.1
            fxlKTrans: 2.3
            fxrKTrans: 2.1
            deltaKTrans: 0.2
          number: 1
        ]
      
      # The configuration.
      config = null

      beforeEach ->
        # Fake the modeling service.
        angular.mock.module('qiprofile.modeling')
        # Enable the test service.
        inject ['Modeling', (Modeling) ->
          config = Modeling.configureTable(mock.sessions)
        ]

      it 'should configure one session', ->
        expect(config.data, "The configuration data is missing").to.exist
        expect(config.data.length, "The configuration data series count is incorrect")
          .to.equal(1)

      it 'should initialize the open flags to true', ->
        expect(config.ktransOpen, "The configuration Ktrans open flag is not true").to.be.true
        expect(config.veOpen, "The configuration v_e open flag is not true").to.be.true
        expect(config.tauiOpen, "The configuration tau_i open flag is not true").to.be.true

      # TODO - add value test cases.

      # TODO - add percent change test case.
