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


ctlrs.controller 'HomeCtrl', ['$rootScope', '$scope', '$state',
  ($rootScope, $scope, $state) ->
    $scope.goHome = () ->
      project = $rootScope.project or 'QIN'
      $state.go('quip.home', project: project)
]


ctlrs.controller 'HelpCtrl', ['$rootScope', '$scope',
  ($rootScope, $scope) ->
    # Toggles the root scope showHelp flag.
    # This method and the showHelp flag are defined in the root
    # scope in order to share them with the partial template
    # home alert attribute directives.
    $rootScope.toggleHelp = () ->
      $rootScope.showHelp = !$rootScope.showHelp
    
    # Unconditionally hide help when the location changes.
    $scope.$on '$locationChangeStart', (event, next, current) ->
      # Set the showHelp flag on the parent scope, since the
      # flag is shared with the sibling view scope.
      $rootScope.showHelp = false
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
  'detail', 'ControllerHelper', 'Chart',
  ($rootScope, $scope, subject, detail, ControllerHelper, Chart) ->
    # The format button action.
    $scope.toggleModelingFormat = ->
      if $scope.modelingFormat == 'Chart'
        $scope.modelingFormat = 'List'
      else if $scope.modelingFormat == 'List'
        $scope.modelingFormat ='Chart'
      else
        throw "Modeling format is not recognized: " +
          $scope.modelingFormat

    # The modeling format is 'Chart' if the subject has
    # more than one session, 'List' otherwise
    if subject.isMultiSession
      $scope.modelingFormat = 'Chart'
    else
      $scope.modelingFormat = 'List'

    # Prepares the headings and data for the modeling profile sheet.
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
        visitDate: Chart.dateFormat(sess.acquisition_date)
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

    # Capture the current project.
    $rootScope.project = subject.project
    # Place the sheet data in scope.
    $scope.sessionCounter = sessionCounter
    $scope.sheetData = sheetData

    # Set the modeling profile sheet accordion groups to open by default.
    $scope.groupOpen =
      kTrans: true
      ve: true
      taui: true

    # Place the subject in scope.
    $scope.subject = subject
    # If the project is the default, then remove it from the URL.
    ControllerHelper.cleanBrowserUrl($rootScope.project)
]


ctlrs.controller 'ClinicalProfileCtrl', ['$scope', '$stateParams',
  ($scope, $stateParams) ->
]


ctlrs.controller 'SessionDetailCtrl', ['$rootScope', '$scope', '$state',
  'session', 'ControllerHelper',
  ($rootScope, $scope, $state, session, ControllerHelper) ->
    # Opens the series image display page.
    #
    # @param image the Image object
    $scope.openImage = (image) ->
      # Route to the image detail page.
      params =
        project: image.parent.session.subject.project
        container: image.parent.container_type
        time_point: image.time_point
      $state.go('quip.subject.session.container.image', params)

    # Capture the current project.
    $rootScope.project = session.subject.project
    # Place the session in the scope.
    $scope.session = session
    # If the project is the default, then remove it from the URL.
    ControllerHelper.cleanBrowserUrl($rootScope.project)
]


ctlrs.controller 'ImageDetailCtrl', ['$rootScope', '$scope', 'image',
  'ControllerHelper',
  ($rootScope, $scope, image, ControllerHelper) ->
    # Capture the current project.
    $rootScope.project = image.parent.session.subject.project
    # Place the image in the scope.
    $scope.image = image
    # If the project is the default, then remove it from the URL.
    ControllerHelper.cleanBrowserUrl($rootScope.project)
]
