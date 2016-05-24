define ['angular', 'lodash', 'underscore.string', 'spin', 'nouislider', 'helpers',
        'collection', 'timeline', 'intensityChart', 'modeling', 'SliceDisplay'],
  (ng, _, _s, Spinner, noUiSlider) ->
    directives = ng.module(
      'qiprofile.directives',
      ['qiprofile.helpers', 'qiprofile.collection', 'qiprofile.timeline',
       'qiprofile.intensitychart', 'qiprofile.modeling', 'qiprofile.slicedisplay']
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
            color: 'IndianRed'
            # TODO - moving the color to the common.styl class with definition:
            #     // The spinner style.
            #     .qi-spinner
            #     color: IndianRed
            #   then removing the color attribute and enabling the className
            #   attribute below has no effect. Why not?
            #className: 'qi-spinner'
          )

        scope.$watch attrs.qiSpin, (value, oldValue) ->
          if value
            if not scope.spinner
              scope.spinner = createSpinner()
            scope.spinner.spin(element[0])
          else if scope.spinner
            scope.spinner.stop()


    directives.directive 'qiSliderAxialPlane', ->
      (scope) ->

        sliderAxialPlane = document.getElementById('qi-slider-axial-plane')
        sliderAxialPlaneBack = document.getElementById('qi-slider-axial-plane-back')
        sliderAxialPlaneFwd = document.getElementById('qi-slider-axial-plane-fwd')

        # Configure the slider.
        #
        # TODO - Obtain the range max from the image object properties.
        #
        noUiSlider.create sliderAxialPlane,
          start: [ scope.slice.sliceNbr ]
          step: 1
          range:
            'min': 1
            'max': 12
          pips:
            mode: 'values'
            values: [
              1
              12
            ]
            density: 4

        updateImage = (sliderPos) ->
          # Update the image with the new slice number, which corresponds to
          # new slider position.
          scope.$apply ->
            scope.slice.sliceNbr = sliderPos

        # When the slider is dragged, get the new slider position and update
        # the image.
        sliderAxialPlane.noUiSlider.on 'slide', ->
          newVal = Math.floor sliderAxialPlane.noUiSlider.get()
          updateImage(newVal)

        # When the back button is clicked, reduce the slider position by one
        # and update the image.
        sliderAxialPlaneBack.addEventListener 'click', ->
          newVal = Math.floor(sliderAxialPlane.noUiSlider.get()) - 1
          # Do the update only if the new value does not fall below 1.
          if newVal >= 1
            sliderAxialPlane.noUiSlider.set(newVal)
            updateImage(newVal)

        # When the forward button is clicked, increase the slider position by
        # one and update the image.
        sliderAxialPlaneFwd.addEventListener 'click', ->
          newVal = Math.floor(sliderAxialPlane.noUiSlider.get()) + 1
          # Do the update only if the new value does not go above the number of
          # slices in the image axial plane.
          #
          # TODO - Obtain this value from the image object properties.
          #
          if newVal <= 12
            sliderAxialPlane.noUiSlider.set(newVal)
            updateImage(newVal)


    directives.directive 'qiSliderTimeSeries', ->
      (scope) ->

        sliderTimeSeries = document.getElementById('qi-slider-time-series')
        sliderTimeSeriesBack = document.getElementById('qi-slider-time-series-back')
        sliderTimeSeriesFwd = document.getElementById('qi-slider-time-series-fwd')

        # Configure the slider.
        #
        # TODO - Obtain the range max from the time series object properties.
        #
        noUiSlider.create sliderTimeSeries,
          start: [ scope.volume.volumeNbr ]
          step: 1
          range:
            'min': 1
            'max': 64
          pips:
            mode: 'values'
            values: [
              1
              64
            ]
            density: 4

        updateImage = (sliderPos) ->
          # Update the image with the new volume number, which corresponds to
          # new slider position.
          scope.$apply ->
            scope.volume.volumeNbr = sliderPos

        # When the slider is dragged, get the new slider position and update
        # the image.
        sliderTimeSeries.noUiSlider.on 'slide', ->
          newVal = Math.floor sliderTimeSeries.noUiSlider.get()
          updateImage(newVal)

        # When the back button is clicked, reduce the slider position by one
        # and update the image.
        sliderTimeSeriesBack.addEventListener 'click', ->
          newVal = Math.floor(sliderTimeSeries.noUiSlider.get()) - 1
          # Do the update only if the new value does not fall below 1.
          if newVal >= 1
            sliderTimeSeries.noUiSlider.set(newVal)
            updateImage(newVal)

        # When the forward button is clicked, increase the slider position by
        # one and update the image.
        sliderTimeSeriesFwd.addEventListener 'click', ->
          newVal = Math.floor(sliderTimeSeries.noUiSlider.get()) + 1
          # Do the update only if the new value does not go above the number of
          # volumes in the time series.
          #
          # TODO - Obtain this value from the time series object properties.
          #
          if newVal <= 64
            sliderTimeSeries.noUiSlider.set(newVal)
            updateImage(newVal)


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
