define ['ngmocks', 'moment', 'chart'], (ng, moment) ->
  describe 'Unit Testing the Chart Service', ->

    # The mock Chart service module.
    Chart = null

    # The mock chart results.
    mock = [
      {
        time: 1
        measurement:
          a: 4
          b: 5
      }
      {
        time: 2
        measurement:
          a: 3
          b: 2
      }
    ]

    spec =
      x:
        label: 'Time'
        accessor: (reading) ->
          reading.time
      y:
        label: 'Value'
        data:
          [
            {
              label: 'A'
              color: 'Blue'
              accessor: (reading) ->
                reading.measurement.a
            }
            {
              label: 'B'
              color: 'Green'
              accessor: (reading) ->
                reading.measurement.b
            }
          ]

    mockTimes = _.map(mock, 'time')
    mockValues = ['a', 'b'].map (attr) ->
      mock.map (reading) ->
        [reading.time, reading.measurement[attr]]
    
    beforeEach ->
      # Fake the chart service.
      ng.module('qiprofile.chart')
      # Enable the test service.
      inject ['Chart', (_Chart_) ->
        Chart = _Chart_
      ]

    describe 'Chart Configuration', ->
      config = null

      beforeEach ->
        config = Chart.configure(mock, spec)

      it 'should configure two data series', ->
        expect(config.data, "The configuration data is missing").to.exist
        expect(config.data.length, "The configuration data series count is incorrect")
          .to.equal(2)

      it 'should set the data values to the coordinates', ->
        actual = _.map(config.data, 'values')
        expect(actual, "The configuration data values are incorrect")
          .to.eql(mockValues
          )
