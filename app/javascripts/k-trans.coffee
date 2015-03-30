define [], ->
  # The d3 chart data series formatting configuration.
  CHART_DATA_SERIES_CONFIG:
    label: 'Ktrans'
    data:
      [
        {
          label: 'FXL Ktrans'
          color: 'BurlyWood'
          accessor: (modelingResult) ->
            modelingResult.fxlKTrans.average
        }
        {
          label: 'FXR Ktrans'
          color: 'OliveDrab'
          accessor: (modelingResult) ->
            modelingResult.fxrKTrans.average
        }
      ]

  HEADINGS:
    deltaKTrans: '&Delta;K<sub>trans</sub>'
    fxlKTrans: 'FXL K<sub>trans</sub>'
    fxrKTrans: 'FXR K<sub>trans</sub>'
  