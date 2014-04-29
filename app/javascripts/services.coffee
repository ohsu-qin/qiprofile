svcs = angular.module 'qiprofile.services', ['ngResource']

svcs.factory 'Subject', ['$resource', ($resource) ->
  $resource '/api/subjects/:number/', null,
    detail:
      method: 'GET'
      url: '/api/subject_detail/:id/'
]

svcs.factory 'Session', ['$resource', ($resource) ->
  $resource '/api/session_detail/:id/', null,
    detail:
      method: 'GET'
      url: '/api/session_detail/:id/'
]

svcs.factory 'Helpers', [() ->
  # If the given attribute value is a string, then this function
  # resets it to the parsed date.
  fix_date: (obj, attr) ->
    date = obj[attr]
    # Silly Javascript idiom for string type testing.
    if typeof date == 'string' or date instanceof String
      # Reset the attribute to a date.
      obj[attr] = moment(date)
  
  # @param data the value array
  # @param offset an optional integer offset for the index, e.g.
  #   1 for a one-based index. The default is zero.
  # @returns a value -> index function that returns the index of
  #   the value in the data array
  indexFormatter: (data, offset) ->
    if offset == undefined
      offset = 0
    (value) ->
      _.indexOf(data, value) + offset
  
  # @param date the moment date integer
  # @return the formatted date
  dateFormat: (date) ->
    moment(date).format('MM/DD/YYYY')
  
  # Builds the nvd3 chart format for the given input resource
  # objects and configuration.
  #
  # The input configuration contains the attributes x and y, where:
  # * x is the x-axis {label, accessor}
  # * y is the y-axis {[data_series], precision}
  #   for the data series {label, accessor} specifications
  #
  # The result contains the following attributes:
  # * data - the nvd3 chart data
  # * color - the nvd3 color function
  # * maxMin - the maximum and minimum chart y-axis display values
  #
  # @param resources the resource objects to graph
  # @param config the data configuration
  # @returns the chart configuration
  configure_chart: (resources, config) ->
    # @returns the y values for the given resource
    resource_values = (resource, config) ->
      ds.accessor(resource) for ds in config.y.data

    # @returns the result of applying the given function to the
    #   values obtained from the y-axis configuration
    apply_to_resources = (resources, config, fn) ->

      # @returns the result of applying the given function to the
      #   resource values of the given object
      apply_to_resource = (resource, config, fn) ->
        values = resource_values(resource, config)
        fn(values)

      apply_to_resource(rsc, config, fn) for rsc in resources
    
    # @param resources the graphed objects
    # @param config the y axis configuration
    # @returns the y axis {max, min} object
    value_range = (resources, config) ->

      # Return the {max, min} range object.
      max: _.max(apply_to_resources(resources, config, _.max))
      min: _.min(apply_to_resources(resources, config, _.min))

    # @returns the [{key: label, values: coordinates}] nvd3 data
    chart_data = (resources, config) ->
      
      # @returns the {key, values} pair
      format_data_series = (resources, x_accessor, data_series) ->
      
        # @returns the graph [x, y] coordinates
        coordinates = (resources, x_accessor, y_accessor) ->
          [x_accessor(rsc), y_accessor(rsc)] for rsc in resources
        
        key: data_series.label
        values: coordinates(resources, x_accessor, data_series.accessor)

      format_data_series(resources, config.x.accessor, ds) for ds in config.y.data
    
    # @param value_range the y values {max, min} range object
    # @param returns the chart y axis {max, min} range object
    y_range = (value_range, precision) ->
      # The factor is 10**precision.
      factor = Math.pow(10, precision)

      ceiling = Math.ceil(value_range.max * factor)
      # Pad the graph max with the next higher significant tick mark.
      upper = (ceiling + 1) / factor

      # Round the minimum down to the nearest precision decimal.
      floor = Math.floor(value_range.min * factor)
      # If the floor is not at the origin, then pad the graph min with
      # the next lower significant tick mark.
      lower_int = if floor == 0 then floor else floor - 1
      lower = lower_int / factor

      # Return the chart{max, min} range object.
      max: upper
      min: lower
    
    default_precision = (resources, config) ->
      default_resource_precision = (resource, config) ->
        # @returns the number of decimals to display for the given
        #   value
        default_value_precision = (value) ->
          if value == 0 or value > 1
            0
          else
            1 + default_value_precision(value * 10)
        
        rsc_values = resource_values(resource, config)
        value_precisions =
          default_value_precision(value) for value in rsc_values
        _.max(value_precisions)
      
      rsc_precisions =
        default_resource_precision(rsc, config) for rsc in resources
      _.max(rsc_precisions)
    
    # The value range.
    val_range = value_range(resources, config)
    
    # Get the default precision, if necessary.
    if config.y.precision
      precision = config.y.precision
    else
      precision = default_precision(resources, config)
    
    # The chart range.
    chart_y_range = y_range(val_range, precision)
    
    # This function is a work-around for the following missing
    # nv3d feature:
    # * allow different formats for y ticks and y tooltip values
    #
    # @returns a function which formats the y axis
    #   ticks differently than the y tooltip values
    decimal_formatter = (precision) ->
      factor = Math.pow(10, precision)
      format_tick = d3.format('.' + precision + 'f')
      format_value = d3.format('.' + (precision + 2) + 'f')
      
      (value) ->
        shifted = value * factor
        if shifted - Math.floor(shifted) < .001
          format_tick(value)
        else
          format_value(value)

    # Return the graph configuration.
    data: chart_data(resources, config)
    multiSeries: config.y.data.length > 1
    yFormat: decimal_formatter(precision)
    yLabel: config.y.label
    yMaxMin: _.values(chart_y_range)
    color: (d, i) ->
      config.y.data[i].color
    
  # Replaces the given text elements with hyperlinks.
  d3Hyperlink: (element, hrefs, style) ->  
    element.selectAll('text').each (item, i) ->
      # The parent node wrapped by D3.
      p = d3.select(this.parentNode)
      # The JQuery wrapper on this text element.
      t = $(this)
      # Remove this text element from the DOM.
      t.detach()
      # Append a SVG anchor.
      a = p.append('svg:a')
      # Format the link.
      link = hrefs[i]
      # Add the href.
      a.attr('xlink:href', link)
      # Add link style to the SVG text element.
      for [k, v] in _.pairs(style)
        d3.select(this).attr(k, v)
      # Reattach the text element to the anchor.
      t.appendTo(a)
]


svcs.factory 'Modeling', ['Helpers', (Helpers) ->
  # The x axis data configuration.
  x_config =
    label: 'Visit Date'
    accessor: (session) -> session.acquisition_date.valueOf()

  # The y axis data configuration.
  y_configs =
    ktrans:
      label: 'Ktrans'
      data:
        [
          {
            label: 'FXL Ktrans'
            color: 'OliveDrab'
            accessor: (session) -> session.modeling.fxl_k_trans
          }
          {
            label: 'FXR Ktrans'
            color: 'BurlyWood'
            accessor: (session) -> session.modeling.fxr_k_trans
          }
        ]
    ve:
      label: 'v_e'
      data:
        [
          {
            label: 'v_e'
            color: 'MediumSeaGreen'
            accessor: (session) -> session.modeling.v_e
          }
        ]
    taui:
      label: 'tau_i'
      data:
        [
          {
            label: 'tau_i'
            color: 'PaleVioletRed'
            accessor: (session) -> session.modeling.tau_i
          }
        ]
  
  # The data configurations.
  configs =
    ktrans: {x: x_config, y: y_configs.ktrans}
    ve: {x: x_config, y: y_configs.ve}
    taui: {x: x_config, y: y_configs.taui}
  
  # @param chart the chart name
  # @return the nvd3 chart format
  configure_chart: (data, chart) ->
    # Extracts the x values from the given nvd3 chart data.
    # This function assumes that the chart data series share common
    # x values.
    #
    # @param data the chart data
    # @returns the chart x values
    xValues = (data) ->
      data_series = data[0]
      coords = data_series.values
      coord[0] for coord in coords
    
    data_cfg = configs[chart]
    chart_cfg = Helpers.configure_chart(data, data_cfg)
    chart_cfg.xValues = xValues
    chart_cfg.xFormat = Helpers.dateFormat
    chart_cfg
]


svcs.factory 'Image', ['$rootScope', '$timeout', ($rootScope, $timeout) ->
  # A root scope {parent id: {filename: content} image cache.
  $rootScope.images = {}
  
  # If there are file arguments, then this function
  # caches the images for the given id.
  # Otherwise, this function returns the cached images,
  # or undefined if there is no cache entry for the id.
  cache = (id, files...) ->
    if files.length
      $rootScope.images[id] =
        create(filename) for filename in files
    else
      $rootScope.images[id]
  
  # Helper function to load the given file.
  load_data = (path) ->
    # Placeholder testing function to simulate data transfer.
    $timeout(
      () -> 'loaded'
      5000
    )
    
    # TODO - replace the mock $timeout pseudo-load by the following:
    # $http
    #   method: 'GET'
    #   url: '/static/' + path

  create = (filename) ->
    # Returns a new image object.
    filename: filename
    state:
      loading: false
    data: null
    load: () ->
      # Transfers the image file content to the data attribute.
      this.state.loading = true
      image = this
      load_data(filename)
      .then (data) ->
        image.data = data
        image.state.loading = false
        data

  # Return the Image service singleton object which implements
  # the images_for function.
  images_for: (obj) ->
    # If images are cached for given image file container object,
    # then return the cached image objects.
    # Otherwise, create, cache and return the new image objects.
    cache(obj.id) or cache(obj.id, obj.files...)
]
