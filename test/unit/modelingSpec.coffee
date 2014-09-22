define ['angular', 'ngmocks', 'moment', 'modeling'],

  (ng, mocks, moment, modeling) ->
    describe 'Unit Testing Modeling Service', ->
      # TODO - add chart test cases as in the intensitySpec.

      describe 'Imaging Profile Table', ->
        # The mock input.
        
        # TODO - this test suite assumes one modeling result
        # per session. When multiple modeling results are enabled,
        # this test should break.
        mock = 
          sessions: [
            {
              acquisitionDate: moment([2014, 4, 1]).valueOf()
              modeling:
                name: 'scan'
                fxlKTrans:
                  average: 2.3
                fxrKTrans:
                  average: 2.1
                deltaKTrans:
                  average: 0.2
                vE:
                  average: 2.4
                tauI:
                  average: 0.1
              number: 1
            }
            {
              acquisitionDate: moment([2014, 4, 15]).valueOf()
              modeling:
                name: 'scan'
                fxlKTrans:
                  average: 2.5
                fxrKTrans:
                  average: 2.2
                deltaKTrans:
                  average: 0.3
                vE:
                  average: 2.5
                tauI:
                  average: 0.2
              number: 2
            }
          ]
      
        # The configuration.
        config = null
      
        beforeEach ->
          # Fake the modeling service.
          ng.mock.module('qiprofile.modeling')
          # Enable the test service.
          inject ['Modeling', (Modeling) ->
            config = Modeling.configureTable(mock.sessions)
          ]
      
        it 'should configure the sessions', ->
          expect(config.data, 'The configuration data is missing').to.exist
          expect(config.data.length, 'The configuration data session count is incorrect')
            .to.equal(2)
      
        it 'should initialize the open flags to true', ->
          expect(config.ktransOpen, 'The configuration Ktrans open flag is not true').to.be.true
          expect(config.veOpen, 'The configuration v_e open flag is not true').to.be.true
          expect(config.tauiOpen, 'The configuration tau_i open flag is not true').to.be.true
      
        # The value test cases.
        it 'should add the data', ->
          expect(config.data, 'The configuration is missing the modeling data').to.exist
          expect(config.data.length, 'The configuration modeling count is incorrect').to.equal(2)
        
        describe 'Modeling Parameters', ->
          prev = null
          
          it 'should set the modeling parameters', ->
            for mdl, i in config.data
              mock_sess = mock.sessions[i]
              mock_mdl = mock_sess.modeling
          
              # Validate the modeling parameters.
              expect(mdl.fxlKTrans, "Modeling #{ i } fxlKTrans is incorrect").to.equal(mock_mdl.fxlKTrans)
              expect(mdl.fxrKTrans, "Modeling #{ i } fxrKTrans is incorrect").to.equal(mock_mdl.fxrKTrans)
              expect(mdl.deltaKTrans, "Modeling #{ i } deltaKTrans is incorrect").to.equal(mock_mdl.deltaKTrans)
              expect(mdl.vE, "Modeling #{ i } vE is incorrect").to.equal(mock_mdl.vE)
              expect(mdl.tauI, "Modeling #{ i } tauI is incorrect").to.equal(mock_mdl.tauI)
          
              # If this is not the first session, then validate the percent change.
              if prev
                mockFxlKTransPctChange = (mock_mdl.fxlKTrans.average - prev.fxlKTrans.average) / prev.fxlKTrans.average * 100
                expect(mdl.fxlKTransPctChange, "Modeling #{ i } fxlKTransPctChange is incorrect").to.equal(mockFxlKTransPctChange)
            
                mockFxrKTransPctChange = (mock_mdl.fxrKTrans.average - prev.fxrKTrans.average) / prev.fxrKTrans.average * 100
                expect(mdl.fxrKTransPctChange, "Modeling #{ i } fxrKTransPctChange is incorrect").to.equal(mockFxrKTransPctChange)
            
                mockDeltaKTransPctChange = (mock_mdl.deltaKTrans.average - prev.deltaKTrans.average) / prev.deltaKTrans.average * 100
                expect(mdl.deltaKTransPctChange, "Modeling #{ i } deltaKTransPctChange is incorrect").to.equal(mockDeltaKTransPctChange)
      
                mockVEPctChange = (mock_mdl.vE.average - prev.vE.average) / prev.vE.average * 100
                expect(mdl.vEPctChange, "Modeling #{ i } vEPctChange is incorrect").to.equal(mockVEPctChange)
            
                mockTauIPctChange = (mock_mdl.tauI.average - prev.tauI.average) / prev.tauI.average * 100
                expect(mdl.tauIPctChange, "Modeling #{ i } tauIPctChange is incorrect").to.equal(mockTauIPctChange)
          
              prev = mock_mdl
