define ['angular', 'lodash', 'moment', 'd3'], (ng, _, moment) ->
  # Note: The d3 convention is to set a global variable d3 used to
  # build a chart. Consequently, the reference to d3 below is to this
  # global variable. A better d3 implementation would package d3
  # as an AMD module which we can bind to a d3 variable above. However,
  # we adhere to the d3 convention in the implementation below.

  chart = ng.module 'qiprofile.chart', []

  chart.factory 'Chart', ->
    # Returns the smallest number of significant decimals that
    # captures at least one non-zero digit for all non-zero values,
    # e.g.:
    # > Chart.minPrecision(1.373, 0.00542, -4, 0.0, 0.04)
    # > 3
    #
    # @param values the values to chart
    # @returns the smallest number of significant decimals
    #   that captures at least one non-zero digit for all values
    minPrecision: (values) ->
      # Determine the minimum value precision as follows:
      # * If the value is undefined, null, zero or greater then
      #   one, then zero
      # * Otherwise, the number of significant decimal digits
      #
      # @param value the numeric value
      # @returns the number of decimals to display for the
      #   given value
      minValuePrecision = (value) ->
        # * Zero has no precision.
        # * Otherwise, if the value is negative, then recurse on the
        #   absolute value.
        # * Otherwise, if we are not yet into the non-zero decimals,
        #   then shift left one decimal place and recurse.
        # * Otherwise, check the decimal residue as described below.
        if not value
          0
        else if value < 0
          minValuePrecision(Math.abs(value))
        else if value < 1
          1 + minValuePrecision(value * 10)
        else
          # The decimal portion. Rounding handles the case of an
          # insignificant negative delta, e.g. the iteration:
          # .234, 2.34, 3.4, 3.99999999 checks against the
          # residuals .234, .34, .4, .000000001. If floor were
          # used the last residual would be .99999999.
          residual = Math.abs(value - Math.round(value))
          # If the decimal portion is roughly zero, then we are done.
          # Otherwise, recurse.
          if residual < .0002
            0
          else
            1 + minValuePrecision(residual * 10)

      # The precision for each value.
      precisions = (minValuePrecision(value) for value in values)
      # Return the largest of the minimum value precision.
      _.max(precisions)

    # @param date the moment date integer
    # @returns the formatted date
    formatDate: (date) ->
      moment(date).format('MM/DD/YYYY')

    # Replaces the given text element with a  hyperlink anchor element.
    #
    # @param text the text D3 selection
    # @param handler the click event handler
    # @returns the new anchor element
    d3Hyperlink: (text, handler) ->
      # Unwrap the DOM element.
      textNode = text.node()
      # The parent selection.
      parent = d3.select(textNode.parentNode)
      # Remove the text element from the DOM.
      text.remove()
      # Append a SVG anchor.
      a = parent.append('svg:a')
      # Add the (unused) href.
      a.attr('href', '#')
      
      # Note: the anchor element is well-formed, but is only partially
      # recognized as such by the browser. The browser changes the cursor
      # on hover as if the anchor element was recognized, but clicking
      # has no effect and right mouse button click does not show the
      # expected hyperlink items. Perhaps this bug results from the element
      # as a svg:a rather than an a. In any case, the work-around is to
      # add an on click event that delegats to the event handler.
      a.on('click', handler)
      
      # Reattach the text element to the anchor.
      # The D3 selection append method takes either a string,
      # in which case it creates a new element as in the above
      # svg:a append, or a function which returns a DOM element.
      # In the call below, the text DOM element is appended.
      a.append(-> textNode)
      # Return the anchor D3 selection.
      a
