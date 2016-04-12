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
          deltaKTrans:
            average: 1.35
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
          deltaKTrans:
            average: 1.2
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
        describe 'Ktrans', ->
          config = null

          beforeEach ->
            config = ModelingChart.configure(mock, 'kTrans')

          it 'should configure two data series', ->
            expect(config.data, "The configuration data is missing").to.exist
            expect(config.data.length, "The configuration data series count is incorrect")
              .to.equal(2)
          
          describe 'FXL', ->

            data = null

            beforeEach ->
              data = _.find(config.data, key : 'FXL Ktrans')

            it 'should capture the FXL KTrans results', ->
              expect(data, "The FXL Ktrans data series is missing").to.exist
              expect(data.values, "The FXL Ktrans data values are missing").to.exist
              expect(data.values.length, "The FXL Ktrans results length is incorrect")
               .to.equal(2)
              expect(data.values, "The FXL Ktrans results are incorrect")
               .to.eql(_.map(mock, 'fxlKTrans'))
          
          describe 'FXR', ->

            data = null

            beforeEach ->
              data = _.find(config.data, key : 'FXR Ktrans')

            it 'should capture the FXR KTrans results', ->
              expect(data, "The FXR Ktrans data series is missing").to.exist
              expect(data.values, "The FXR Ktrans data values are missing").to.exist
              expect(data.values.length, "The FXL Ktrans results length is incorrect")
               .to.equal(2)
              expect(data.values, "The FXR Ktrans results are incorrect")
               .to.eql(_.map(mock, 'fxrKTrans'))

        describe 'v_e', ->
          config = null

          beforeEach ->
            config = ModelingChart.configure(mock, 'vE')

          it 'should configure one data series', ->
            expect(config.data, "The configuration data is missing").to.exist
            expect(config.data.length, "The configuration data series count is incorrect")
              .to.equal(1)
            expect(config.data[0].key, "The v_e data series key is incorrect")
              .to.equal('v_e')

          it 'should capture the v_e results', ->
            values = config.data[0].values
            expect(values, "The v_e data values are missing").to.exist
            expect(values.length, "The v_e results length is incorrect")
             .to.equal(2)
            expect(values, "The v_e results are incorrect")
             .to.eql(_.map(mock, 'vE'))

        # describe 'vE', ->
        #   config = null
        #
        #   beforeEach ->
        #     config = ModelingChart.configure(mock, 'vE')
        #
        #   it 'should configure two data series', ->
        #     expect(config.data.values, "The configuration data is missing").to.exist
        #     expect(config.data.values.length, "The configuration data series count is incorrect")
        #       .to.equal(1)
        #
        #   it 'should set the X axis values to the session acquisition dates', ->
        #     expect(config.xValues, "The configuration X values are incorrect")
        #       .to.eql(dates)
        #
        # describe 'tauI', ->
        #   config = null
        #
        #   beforeEach ->
        #     config = ModelingChart.configure(mock, 'tauI')
        #
        #   it 'should configure two data series', ->
        #     expect(config.data.values, "The configuration data is missing").to.exist
        #     expect(config..values.length, "The configuration data series count is incorrect")
        #       .to.equal(1)
        #
        #   it 'should set the X axis values to the session acquisition dates', ->
        #     expect(config.xValues, "The configuration X values are incorrect")
        #       .to.eql(dates)
