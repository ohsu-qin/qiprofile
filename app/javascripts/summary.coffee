define ['angular', 'chart'], (ng) ->
  summary = ng.module 'qiprofile.summary', ['qiprofile.chart']


  # TO DO - Consolidate into one factory function.
  # Note: Currently these charts are wireframes only.

  summary.factory 'ktransSummary', ['Chart', (Chart) ->

    configureChart: ->
      # Mock data for the wireframe.
      dataValues = [
        [
          {x: 2.76, y: 0.227},
          {x: 1.50, y: 0.164},
          {x: 1.90, y: 0.231}
        ],
        [
          {x: 2.76, y: 0.325},
          {x: 1.50, y: 0.224},
          {x: 1.90, y: 0.285}
        ]
      ]
      fxlKtransData =
        key: "FXL Ktrans"
        values: dataValues[0]
        color: "BurlyWood"
      fxrKtransData =
        key: "FXR Ktrans"
        values: dataValues[1]
        color: "OliveDrab"
      data: [fxlKtransData].concat([fxrKtransData])
      forcex: [1, 3]
      xValues: [1, 2, 3]
      forcey: [0, 0.4]
      yValues: [0, 0.2, 0.4]

  ]

  summary.factory 'deltaKtransSummary', ['Chart', (Chart) ->

    configureChart: ->
      # Mock data for the wireframe.
      dataValues = [
        {x: 2.76, y: -0.098},
        {x: 1.50, y: -0.060},
        {x: 1.90, y: -0.053}
      ]
      deltaKtransData =
        key: "delta Ktrans"
        values: dataValues
        color: "Crimson"
      data: [deltaKtransData]
      forcex: [1, 3]
      xValues: [1, 2, 3]
      forcey: [-0.1, 0]
      yValues: [-0.1, -0.05, 0]

  ]

  summary.factory 'veSummary', ['Chart', (Chart) ->

    configureChart: ->
      # Mock data for the wireframe.
      dataValues = [
        {x: 2.76, y: 0.698},
        {x: 1.50, y: 0.659},
        {x: 1.90, y: 0.594}
      ]
      veData =
        key: "v_e"
        values: dataValues
        color: "Orange"
      data: [veData]
      forcex: [1, 3]
      xValues: [1, 2, 3]
      forcey: [0.4, 1]
      yValues: [0.4, 0.7, 1]

  ]

  summary.factory 'tauiSummary', ['Chart', (Chart) ->

    configureChart: ->
      # Mock data for the wireframe.
      dataValues = [
        {x: 2.76, y: 0.485},
        {x: 1.50, y: 0.419},
        {x: 1.90, y: 0.481}
      ]
      tauiData =
        key: "tau_i"
        values: dataValues
        color: "DodgerBlue"
      data: [tauiData]
      forcex: [1, 3]
      xValues: [1, 2, 3]
      forcey: [0.3, 0.7]
      yValues: [0.3, 0.5, 0.7]

  ]
