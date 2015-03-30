define ['angular', 'lodash', 'k-trans', 'v-e', 'tau-i', 'chart'], (ng, _, Ktrans, Ve, TauI) ->
  modeling = ng.module 'qiprofile.modeling', ['qiprofile.chart']

  modeling.factory 'Modeling', ['Chart', (Chart) ->
    # The common modeling x-axis specification.
    X_DATA_SPEC =
      label: 'Visit Date'
      accessor: (mdlResult) ->
        mdlResult.modeling.session.acquisitionDate.valueOf()
    
    # The modeling parameter HTML display headings.
    PARAMETER_HEADINGS:
      _.assign({}, Ktrans.HEADINGS, Ve.HEADINGS, TauI.HEADINGS)

    # Configures the d3 chart with the given format. The format is an
    # object in the form {label: string, data: array}
    # where the data array has one object per data series in the form
    # {label: string, color: color, accessor: (modelingResult) -> body}
    #
    # @param modelingResults the session modeling results array
    # @param dataSeriesSpec the chart y-axis {label, data} format specification
    # @returns the nvd3 chart dataSpec
    configureChart: (modelingResults, dataSeriesSpec) ->
      # @returns the nvd3 tooltip HTML
      tooltip = (key, x, y, e, graph) ->
        "<b>#{ key }</b>: #{ y }"

      # The session date x values.
      xValues = (
        X_DATA_SPEC.accessor(mdlResult) for mdlResult in modelingResults
      )

      # The chart data specification.
      spec =
        x: X_DATA_SPEC
        y: dataSeriesSpec

      # Return the standard chart configuration extended with the following:
      # * the xValues and xFormat properties
      # * the tooltip function
      _.extend Chart.configureChart(modelingResults, spec),
        xValues: xValues
        xFormat: Chart.dateFormat
        tooltip: tooltip

    # The Ktrans d3 chart data series formatting configuration.
    kTrans:
      dataSeriesConfig: Ktrans.CHART_DATA_SERIES_CONFIG

    # The v_e d3 chart data series formatting configuration.
    vE:
      dataSeriesConfig: Ve.CHART_DATA_SERIES_CONFIG

    # The tau_i d3 chart data series formatting configuration.
    tauI:
      dataSeriesConfig: TauI.CHART_DATA_SERIES_CONFIG
  ]
