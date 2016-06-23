define [], ->
  # The d3 chart data series formatting configuration.
  CHART_DATA_SERIES_CONFIG:
    label: 'v_e'
    data: [
      label: 'v_e'
      color: 'MediumSeaGreen'
      accessor: (modelingResult) -> modelingResult.vE.average
    ]

  HEADINGS:
    vE: 'v<sub>e</sub>'
