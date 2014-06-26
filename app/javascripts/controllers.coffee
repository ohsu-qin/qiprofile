ctlrs = angular.module 'qiprofile.controllers', ['qiprofile.services']

# The controller helper methods.
ctlrs.factory 'ControllerHelper', ['$location', ($location) ->
  # Replaces the browser URL search parameters to include at most
  # a non-default project, since all other search parameters are
  # redundant.
  cleanBrowserUrl: (project) ->
    searchParams = {}
    if project != 'QIN'
      searchParams.project = project
    $location.replace()
    $location.search(searchParams)
]


ctlrs.controller 'GoHomeCtrl', ['$rootScope', '$scope', '$state',
  ($rootScope, $scope, $state) ->
    $scope.goHome = () ->
      project = $rootScope.project or 'QIN'
      $state.go('quip.home', project: project)
]


ctlrs.controller 'HelpCtrl', ['$scope',
  ($scope) ->
    $scope.$on '$locationChangeStart', (event, next, current) ->
      # Set the showHelp flag on the parent scope, since the
      # flag is shared with the sibling view scope.
      $scope.$parent.showHelp = false
]


ctlrs.controller 'SubjectListCtrl', ['$rootScope', '$scope', 'project',
  'subjects', 'collections',
  ($rootScope, $scope, project, subjects, collections) ->
    # Capture the current project.
    $rootScope.project = project
    # Place the subjects and collections in the scope.
    $scope.subjects = subjects
    $scope.collections = collections
]


ctlrs.controller 'SubjectDetailCtrl', ['$rootScope', '$scope', 'subject',
  'detail', 'ControllerHelper', 'Helpers',
  ($rootScope, $scope, subject, detail, ControllerHelper, Helpers) ->
    # Capture the current project.
    $rootScope.project = subject.project

    # The format button action.
    $scope.toggleModelingFormat = ->
      if $scope.modelingFormat == 'Chart'
        $scope.modelingFormat = 'List'
      else if $scope.modelingFormat == 'List'
        $scope.modelingFormat ='Chart'
      else
        throw "Modeling format is not recognized: " + $scope.modelingFormat
    
    # Adds the session links above the line.
    $scope.addSessionDetailLinks = (chart) ->
      # @returns the link to detail page for the given session
      sessionDetailLink = (session) ->
        "/quip/#{ subject.collection.toLowerCase() }/subject/" +
        "#{ subject.number }/session/#{ session.number }?" +
        "project=#{ subject.project }&detail=#{ session.detail_id }"
      
      # Select the SVG element.
      svg = d3.select(chart.container)
      # The x axis element.
      xAxis = svg.select('.nv-x')
      # The tick elements.
      ticks = xAxis.selectAll('.tick')[0]
      # Add the session hyperlinks.
      for i in _.range(ticks.length)
        # The session tick.
        tick = ticks[i]
        session = subject.sessions[i]
        # Make a new SVG text element.
        text = d3.select(tick).append('text')
        text.attr('dx', '-.2em').attr('dy', '-.5em')
        text.style('text-anchor: middle')
        # The text content is the session number.
        text.text(session.number)
        # The hyperlink target.
        href = sessionDetailLink(session)
        # Wrap the text element in a hyperlink.
        Helpers.d3Hyperlink(text.node(), href)
      # TODO - draw the x axis line.
      line = svg.append('line')

    # Prepares the headings and data for the modeling profile sheet.
    prepareModelingProfileSheet = ->
      # Number of decimal places displayed for values and percentages.
      dpVal = 4
      dpPct = 2
      # Get the session data.
      sessionCounter = []
      sheetData = []
      delta_k_trans = []
      for sess, i in subject.sessions
        sessionCounter.push i
        # Calculate delta-Ktrans
        delta_k_trans[i] = sess.modeling.fxr_k_trans - sess.modeling.fxl_k_trans
        # Unless this is the first visit,
        # calculate percent change in each property since previous visit.
        unless i == 0
          delta_k_trans_change = ((delta_k_trans[i] - sheetData[i-1].deltaKtrans)/sheetData[i-1].deltaKtrans * 100).toFixed(dpPct)
          fxl_change = ((sess.modeling.fxl_k_trans - sheetData[i-1].fxl)/sheetData[i-1].fxl * 100).toFixed(dpPct)
          fxr_change = ((sess.modeling.fxr_k_trans - sheetData[i-1].fxr)/sheetData[i-1].fxr * 100).toFixed(dpPct)
          v_e_change = ((sess.modeling.v_e - sheetData[i-1].ve)/sheetData[i-1].ve * 100).toFixed(dpPct)
          tau_i_change = ((sess.modeling.tau_i - sheetData[i-1].taui)/sheetData[i-1].taui * 100).toFixed(dpPct)
        # Update the parameters for this session.
        sheetData[i] =
          visitDate: Helpers.dateFormat(sess.acquisition_date)
          deltaKtrans: delta_k_trans[i].toFixed(dpVal)
          deltaKtransChange: delta_k_trans_change
          fxl: sess.modeling.fxl_k_trans.toFixed(dpVal)
          fxlChange: fxl_change
          fxr: sess.modeling.fxr_k_trans.toFixed(dpVal)
          fxrChange: fxr_change
          ve: sess.modeling.v_e.toFixed(dpVal)
          veChange: v_e_change
          taui: sess.modeling.tau_i.toFixed(dpVal)
          tauiChange: tau_i_change
      # Place the sheet data in scope.
      $scope.sessionCounter = sessionCounter
      $scope.sheetData = sheetData

    # Sets the modeling profile sheet accordion groups to open by default.
    $scope.groupOpen =
      kTrans: true
      ve: true
      taui: true

    # Adds the fetched subject detail into the given subject.
    addDetail = (detail, subject) ->
      # The default modeling format is Chart for more than
      # one session, Table otherwise.
      defaultModelingFormat = (subject) ->
        if subject.sessions.length > 1 then 'Chart' else 'Table'

      # Fix the session and encounter dates.
      Helpers.fixDate(sess, 'acquisition_date') for sess in detail.sessions
      Helpers.fixDate(enc, 'date') for enc in detail.encounters
      # Copy the detail content into the subject.
      ControllerHelper.copyContent(detail, subject)
      # Flag indicating whether there is more than one session.
      subject.multiSession = subject.sessions.length > 1
      # The modeling display format, Chart or Table.
      $scope.modelingFormat = defaultModelingFormat(subject)
      # Prepare the headings and display data for the modeling profile sheet.
      prepareModelingProfileSheet()
      # Place the subject in scope.
      $scope.subject = subject
      # End of the addDetail function.

    # If there is a detail id, then fetch the detail.
    # Otherwise, fetch the subject and then the detail.
    if subject.detail
      ControllerHelper.getDetail(subject, Subject, addDetail)
    else
      $scope.modelingFormat = 'List'
    
    # Place the subject in the scope.
    $scope.subject = subject

    ControllerHelper.cleanBrowserUrl(subject.project)
]


ctlrs.controller 'ClinicalProfileCtrl', ['$scope', '$stateParams',
  ($scope, $stateParams) ->
]


ctlrs.controller 'SessionDetailCtrl', ['$rootScope', '$scope',
  'session', 'detail', 'Image', 'ControllerHelper', 'Helpers',
  ($rootScope, $scope, session, detail, Image, ControllerHelper, Helpers) ->
    # Capture the current project.
    $rootScope.project = session.subject.project
    
    # Opens the series image display page.
    #
    # @param image the Image object
    $scope.openImage = (image) ->
      # TODO - Route to the image open page.
      window.alert("Image open is not yet supported.")

    # Place the session in the scope.
    $scope.session = session

    ControllerHelper.cleanBrowserUrl(session.subject.project)
]


ctlrs.controller 'SeriesDetailCtrl', ['$rootScope', '$scope', 'series',
  ($rootScope, $scope, series) ->
    # Capture the current project.
    $rootScope.project = series.session.subject.project

    # Place the series in the scope.
    $scope.series = series

    ControllerHelper.cleanBrowserUrl(series.session.subject.project)
]
