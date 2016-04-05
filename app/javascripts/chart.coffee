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
        if not value or Math.abs(value) > 1
          0
        else
          1 + minValuePrecision(value * 10)

      # The precision for each value.
      precisions = (minValuePrecision(value) for value in values)
      # Return the largest of the minimum value precision.
      _.max(precisions)

    # @param date the moment date integer
    # @returns the formatted date
    formatDate: (date) ->
      moment(date).format('MM/DD/YYYY')

    # Replaces the given text element with a ui-router ui-sref
    # hyperlink anchor element.
    #
    # Note: since this function modifies the DOM with an AngularJS
    # directive, the element returned by this function must be
    # compiled by AngularJS with the scope $compile function.
    #
    # @param text the text element
    # @param the ui-router ui-sef
    # @returns the new ui-sref anchor element
    d3Hyperlink: (text, sref) ->
      # The parent node wrapped by D3.
      p = d3.select(text.parentNode)
      # The D3 wrapper on this text element.
      t = d3.select(text)
      # Remove this text element from the DOM.
      t.remove()
      # Append a SVG anchor.
      a = p.append('svg:a')
      # Add the ui-sref.
      a.attr('ui-sref', sref)
      # Failure to set href to a non-null, non-empty value results in
      # an obscure AngularJS DOM insertion error and disables the link.
      # The href is not used, since the ui-sref hyperlink target takes
      # precedence.
      a.attr('href', '#')
      # Reattach the text element to the anchor.
      # The D3 selection append method takes either a string,
      # in which case it creates a new element as in the above
      # svg:a append, or a function which returns a DOM element.
      # In the call below, the text element is appended.
      a.append(-> text)
      # Return the anchor element
      a.node()
