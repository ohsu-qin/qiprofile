define ['ngmocks', 'moment', 'chart'], (ng, moment) ->
  describe 'Unit Testing the Chart Service', ->

    # The mock Chart service module.
    Chart = null
    
    beforeEach ->
      # Fake the chart service.
      ng.module('qiprofile.chart')
      # Enable the test service.
      inject ['Chart', (_Chart_) ->
        Chart = _Chart_
      ]

    describe 'Precision', ->
      it 'should calculate the minimum precision', ->
        actual = Chart.minPrecision([0.1234, 1.2, 0.004000002, 1.0, 2, 0.0, 0.12345])
        expect(actual, "The minimum precision is incorrect").to.equal(5)
