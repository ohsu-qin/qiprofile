define ['angular', 'lodash', 'chart'], (ng, _) ->
  modeling = ng.module 'qiprofile.modeling', ['qiprofile.chart']

  modeling.factory 'Modeling', ['Chart', (Chart) ->
    # The common modeling x-axis specification.
    x =
      label: 'Visit Date'
      accessor: (session) -> session.acquisition_date.valueOf()

    # The chart-specific y-axis specifications.
    y =
      ktrans:
        label: 'Ktrans'
        data:
          [
            {
              label: 'FXL Ktrans'
              color: 'BurlyWood'
              accessor: (session) -> session.modeling.fxl_k_trans
            }
            {
              label: 'FXR Ktrans'
              color: 'OliveDrab'
              accessor: (session) -> session.modeling.fxr_k_trans
            }
          ]
      ve:
        label: 'v_e'
        data:
          [
            {
              label: 'v_e'
              color: 'MediumSeaGreen'
              accessor: (session) -> session.modeling.v_e
            }
          ]
      taui:
        label: 'tau_i'
        data:
          [
            {
              label: 'tau_i'
              color: 'PaleVioletRed'
              accessor: (session) -> session.modeling.tau_i
            }
          ]
  
    # The chart data access specifications.
    DATA_SPECS =
      ktrans: {x: x, y: y.ktrans}
      ve: {x: x, y: y.ve}
      taui: {x: x, y: y.taui}
  
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
            percent_change = (current, previous) ->
              (current - previous)/previous * 100
          
            # Return an object with the change properties.
            delta_k_trans_pct_change: percent_change(current.delta_k_trans, previous.delta_k_trans)
            fxl_k_trans_pct_change: percent_change(current.fxl_k_trans, previous.fxl_k_trans)
            fxr_k_trans_pct_change: percent_change(current.fxr_k_trans, previous.fxr_k_trans)
            v_e_pct_change: percent_change(current.v_e, previous.v_e)
            tau_i_pct_change: percent_change(current.tau_i, previous.tau_i)
        
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
        for sess in sessions
          curr = sess.modeling
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
      # The table size.
      ktransTableSize: "qi-full-width-table"
      veTableSize: "qi-half-width-table"
      tauiTableSize: "qi-half-width-table"
  ]
