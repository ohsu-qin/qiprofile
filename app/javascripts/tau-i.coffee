define [], ->
  # The d3 chart data series formatting configuration.
  CHART_DATA_SERIES_CONFIG:
    label: 'tau_i'
    data:[
        label: 'tau_i'
        color: 'PaleVioletRed'
        accessor: (modelingResult) -> modelingResult.tauI.average
    ]

  HEADINGS:
    tauI: '&tau;<sub>i</sub>'
