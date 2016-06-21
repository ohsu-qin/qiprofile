define [], ->
  #
  # TODO - this and other modeling param modules are too D3-specific.
  #   Consolidate and generalize these modules in the Modeling service,
  #   e.g.:
  #     Modeling:
  #       fxlKTrans:
  #         label:
  #         accessor:
  #       ...
  #   Then, push the formatting cruft into the respective formatting
  #   service, e.g.:
  #     ModelingChart:
  #       kTrans:
  #         dataSeries:
  #           label:  'Ktrans'
  #           data: [
  #             {
  #               label: Modeling.fxlKTrans.label
  #               color: 'BurlyWood'
  #               accessor: Modeling.fxlKTrans.accessor
  #             }
  #             ...
  #         headings:
  #           ...
  #
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
  