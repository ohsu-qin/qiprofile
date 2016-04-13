define ['angular', 'lodash', 'underscore.string', 'spin', 'helpers',
        'collection', 'timeline', 'intensityChart', 'modeling'],
  (ng, _, _s, Spinner) ->
    directives = ng.module(
      'qiprofile.directives',
      ['qiprofile.helpers', 'qiprofile.collection', 'qiprofile.timeline',
       'qiprofile.intensitychart', 'qiprofile.modeling']
    )

    # Spinner directive.
    directives.directive 'qiSpin', ->
      (scope, element, attrs) ->
        # Replaces the DOM element with a spinner
        # while the qiSpin attribute is set.

        createSpinner = ->
          # Creates an image selection spinner.
          # position relative places the spinner element
          # with respect to the button. top .6em centers
          # the spinner on the button. The spinner has
          # 10 spokes radiating out 2 pixels from the
          # center of the button with length and width
          # 4 pixels.
          new Spinner(
            position: 'relative'
            top: '.6em'
            lines: 10
            width: 4
            length: 4
            radius: 2
            trail: 80
            speed: 1
            color: 'Orange'
          )

        scope.$watch attrs.qiSpin, (value, oldValue) ->
          if value
            if not scope.spinner
              scope.spinner = createSpinner()
            scope.spinner.spin(element[0])
          else if scope.spinner
            scope.spinner.stop()
    
    
    directives.directive 'qiFocus', ['$timeout',
      ($timeout) ->
        restrict: 'A'
        scope:
          focus: '@qiFocus'
        link: (scope, element) ->
          scope.$watch 'focus', (value) ->
            if value is 'true'
              $timeout ->
                element[0].focus()
    ]


    # Displays the collection charts.
    #
    # TODO - Why is this not an entity (E) directive?
    #   Why is the attribute removed after rendering? The intent seems to
    #   be to disable the directive after the link. However, removing the
    #   attribute does not appear to have any effect. The directive is
    #   called on AngularJS compile. Once compiled, the element is not
    #   recompiled. Thus, removing the attribute is superfluous. Is this
    #   assessment correct?
    # TODO - why is there a config? test. Shouldn't config always exist?
    # TODO - Why is $compile called? This call does not appear to have any
    #   effect. The link is performed during $compile, so calling $compile
    #   here seems to be at best unnecessary and at worst dangerous.
    # TODO - same effect might be obtained more cleanly on each chart
    #   using the qiCollectionChart directive below.
    #
    directives.directive 'qiCollectionCharts', ['Collection', '$compile',
      (Collection, $compile) ->
        restrict: 'A'
        link: (scope, element) ->
          scope.$watch 'config', (config) ->
            if config?
              # The page must completely load before the chart rendering call
              # is made.
              # TODO - element should already be ready before link is called.
              #   Also, this element ready is no guarantee that the chart
              #   elements are ready.
              element.ready ->
                Collection.renderCharts(scope.config)
                element.removeAttr('qi-collection-charts')
                $compile(element)(scope)
    ]


    # TODO - try enabling this in conjunction with the TODO above.
    directives.directive 'qiCollectionChart', ['Collection',
      (Collection) ->
        restrict: 'E'
        link: (scope, element) ->
          # Here, the scope config is set on the individual chart, not
          # all of the charts.
          Collection.renderChart(scope.config)
    ]


    # Displays the slice.
    directives.directive 'qiSliceDisplay', ['SliceDisplay', '$compile',
      (SliceDisplay, $compile) ->
        restrict: 'A'
        link: (scope, element) ->
          # TODO - obtain the updateImage argument.
          # SliceDisplay.updateImage(???)
          # TODO - see qiCollectionCharts link TODO.
          element.removeAttr('qi-slice-display')
          $compile(element)(scope)
    ]


    # Displays a scan or registration series 3D volume.
    directives.directive 'qiVolumeDisplay', ->
      restrict: 'E'
      link: (scope, element) ->
        scope.$watch 'volume', (image) ->
          if volume.isLoaded()
            scope.volume.open(element)
