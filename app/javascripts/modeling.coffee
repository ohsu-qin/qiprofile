define ['angular', 'lodash', 'chart'], (ng, _) ->
  modeling = ng.module 'qiprofile.modeling', ['qiprofile.chart']

  modeling.factory 'Modeling', ['Chart', (Chart) ->
    # The common modeling x-axis specification.
    x =
      label: 'Visit Date'
      accessor: (session) -> session.acquisitionDate.valueOf()

    # The chart-specific y-axis specifications.
    #
    # TODO - support multiple modeling by replacing the session
    #  arguments below with a modeling result.
    #
    y =
      ktrans:
        label: 'Ktrans'
        data:
          [
            {
              label: 'FXL Ktrans'
              color: 'BurlyWood'
              accessor: (session) -> session.modeling[0].fxlKTrans.average
            }
            {
              label: 'FXR Ktrans'
              color: 'OliveDrab'
              accessor: (session) -> session.modeling[0].fxrKTrans.average
            }
          ]
      ve:
        label: 'v_e'
        data:
          [
            {
              label: 'v_e'
              color: 'MediumSeaGreen'
              accessor: (session) -> session.modeling[0].vE.average
            }
          ]
      taui:
        label: 'tau_i'
        data:
          [
            {
              label: 'tau_i'
              color: 'PaleVioletRed'
              accessor: (session) -> session.modeling[0].tauI.average
            }
          ]
  
    # The chart data access specifications.
    DATA_SPECS =
      ktrans: {x: x, y: y.ktrans}
      ve: {x: x, y: y.ve}
      taui: {x: x, y: y.taui}
    
    # The PK modeling paramater properties, including the delta Ktrans.
    PK_PARAMS: ['fxlKTrans', 'fxrKTrans', 'deltaKTrans', 'vE', 'tauI']
  
    # @param sessions the session array 
    # @param chart the chart name
    # @returns the nvd3 chart dataSpec
    configureChart: (sessions, chart) ->
      # @returns the nvd3 tooltip HTML
      tooltip = (key, x, y, e, graph) ->
        "<b>#{ key }</b>: #{ y }"
    
      # The nvd3 data configuration.
      dataSpec = DATA_SPECS[chart]
      # Return the standard chart configuration extended
      # with the following:
      # * the xValues and xFormat properties
      # * the tooltip function
      _.extend Chart.configureChart(sessions, dataSpec),
        xValues: (dataSpec.x.accessor(sess) for sess in sessions)
        xFormat: Chart.dateFormat
        tooltip: tooltip

    # Configures the modeling tables.
    configureTable: (sessions) ->
      sessionsWithChangeProperties = (sessions) ->
        # @param current the current modeling parameters
        # @param previous the previous modeling parameters
        # @returns the session objects extended to include
        #   the percent change properties for all but the
        #   first session
        addSessionChangeProperties = (current, previous) ->
          # @param current the current modeling parameters
          # @param previous the previous modeling parameters
          # @returns the percent change properties object
          extension = (current, previous) ->
            # @param current the current value
            # @param previous the previous value
            # @returns the percent change
            percentChange = (current, previous) ->
              (current - previous)/previous * 100
          
            # Return an object with the change properties.
            deltaKTransPctChange: percentChange(current.deltaKTrans.average, previous.deltaKTrans.average)
            fxlKTransPctChange: percentChange(current.fxlKTrans.average, previous.fxlKTrans.average)
            fxrKTransPctChange: percentChange(current.fxrKTrans.average, previous.fxrKTrans.average)
            vEPctChange: percentChange(current.vE.average, previous.vE.average)
            tauIPctChange: percentChange(current.tauI.average, previous.tauI.average)
        
          # If this is not the first session's modeling object,
          # then extend the object with the percent change properties,
          # otherwise, return the first modeling object unchanged. 
          if previous
            _.extend current, extension(current, previous)
          else
            current

        # The previous modeling object.
        prev = null
        # The modeling objects extended with change properties.
        result = []
        # Extend all but the first modeling object with change properties.
        #
        # TODO - support multiple modeling by iterating over the modeling
        # results, then the sessions in the loop below.
        #
        for sess in sessions
          curr = sess.modeling[0]
          if curr
            result.push addSessionChangeProperties(curr, prev)
            prev = curr
        # Return the result.
        result

      # Return the configuration object.
      data: sessionsWithChangeProperties(sessions)
      # The accordian controls.
      ktransOpen: true
      veOpen: true
      tauiOpen: true
  ]
