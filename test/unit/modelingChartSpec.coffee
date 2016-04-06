define ['ngmocks', 'moment', 'k-trans', 'v-e', 'tau-i', 'modelingChart'],
  (ng, moment, KTrans, VE, TauI) ->
    describe 'Unit Testing the ModelingChart Service', ->
      # The mock Modeling service module.
      ModelingChart = null

      # The mock modeling results. The router sets the modeling
      # and modeling.session parent references, simulated here.
      mock = [
        {
          modeling:
            session:
              date: moment('Apr 1, 2014', 'MMM DD, YYYY').valueOf()
          fxlKTrans:
            average: 1.4
          fxrKTrans:
            average: 1.3
          vE:
            average: 0.2
          tauI:
            average: 3.1
        }
        {
          modeling:
            session:
              date: moment('May 11, 2014', 'MMM DD, YYYY').valueOf()
          fxlKTrans:
            average: 1.3
          fxrKTrans:
            average: 1.1
          vE:
            average: 0.3
          tauI:
            average: 2.8
        }
      ]

      beforeEach ->
        # Fake the modeling service.
        ng.module('qiprofile.modelingchart')
        # Enable the test service.
        inject ['ModelingChart', (_ModelingChart_) ->
          ModelingChart = _ModelingChart_
        ]

      describe 'Chart Configuration', ->

        dates = null

        beforeEach ->
          dates = mock.map (mdlResult) ->
            mdlResult.modeling.session.date

        describe 'kTrans', ->
          config = null

          beforeEach ->
            config = ModelingChart.configureD3(mock, KTrans.CHART_DATA_SERIES_CONFIG)

          it 'should configure two data series', ->
            expect(config.data, "The configuration data is missing").to.exist
            expect(config.data.length, "The configuration data series count is incorrect")
              .to.equal(2)

          it 'should set the X axis values to the session acquisition dates', ->
            expect(config.xValues, "The configuration X values are incorrect")
              .to.eql(dates)

          it 'should set the Y axis values to the Ktrans values', ->
            expect(config.xValues, "The configuration Y values are incorrect")
              .to.eql(dates)

        describe 'vE', ->
          config = null

          beforeEach ->
            config = ModelingChart.configureD3(mock, VE.CHART_DATA_SERIES_CONFIG)

          it 'should configure two data series', ->
            expect(config.data, "The configuration data is missing").to.exist
            expect(config.data.length, "The configuration data series count is incorrect")
              .to.equal(1)

          it 'should set the X axis values to the session acquisition dates', ->
            expect(config.xValues, "The configuration X values are incorrect")
              .to.eql(dates)

        describe 'tauI', ->
          config = null

          beforeEach ->
            config = ModelingChart.configureD3(mock, TauI.CHART_DATA_SERIES_CONFIG)

          it 'should configure two data series', ->
            expect(config.data, "The configuration data is missing").to.exist
            expect(config.data.length, "The configuration data series count is incorrect")
              .to.equal(1)

          it 'should set the X axis values to the session acquisition dates', ->
            expect(config.xValues, "The configuration X values are incorrect")
              .to.eql(dates)
