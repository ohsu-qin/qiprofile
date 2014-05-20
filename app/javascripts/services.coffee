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

svcs.factory 'Helpers', [->
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
        color: data_series.color

      format_data_series(resources, config.x.accessor, ds) for ds in config.y.data
    
    # @param value_range the y values {max, min} range object
    # @param returns the chart y axis {max, min} range object
    y_range = (value_range, precision) ->
      # The factor is 10**precision.
      factor = Math.pow(10, precision)

      ceiling = Math.ceil(value_range.max * factor)
      # Pad the graph max with the next higher significant tick mark.
      upper_int = if ceiling == 0 then ceiling else ceiling + 1
      upper = upper_int / factor

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
    yFormat: decimal_formatter(precision)
    yLabel: config.y.label
    yMaxMin: _.values(chart_y_range)

  # Replaces the given text elements with hyperlinks.
  d3Hyperlink: (element, href, style) ->  
    # The parent node wrapped by D3.
    p = d3.select(element.parentNode)
    # The JQuery wrapper on this text element.
    t = $(element)
    # Remove this text element from the DOM.
    t.detach()
    # Append a SVG anchor.
    a = p.append('svg:a')
    # Add the href.
    a.attr('xlink:href', href)
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
            color: 'BurlyWood'
            accessor: (session) -> session.modeling.fxl_k_trans
          }
          {
            label: 'FXR Ktrans'
            color: 'OliveDrab'
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
  
  # @param sessions the session array 
  # @param chart the chart name
  # @returns the nvd3 chart format
  configure_chart: (sessions, chart) ->
    # @returns the tooltip HTML
    tooltip = (key, x, y, e, graph) ->
      "<b>#{ key }</b>: #{ y }"
    
    # The nvd3 data configuration.
    data_cfg = configs[chart]
    # The nvd3 chart configuration.
    chart_cfg = Helpers.configure_chart(sessions, data_cfg)
    # Additional nvd3 directive attribute values.
    chart_cfg.xValues = data_cfg.x.accessor(sess) for sess in sessions
    chart_cfg.xFormat = Helpers.dateFormat
    chart_cfg.tooltip = tooltip

    chart_cfg
]


svcs.factory 'VisitDateline', ['Helpers', (Helpers) ->
  # The data configuration.
  config =
    x:
      accessor: (session) -> session.acquisition_date.valueOf()
    y:
      data:
        [
          # The y coordinate is always zero.
          {
            accessor: (session) -> 0
          }
        ]
  # @param data the session array
  # @returns the nvd3 chart format
  configure_chart: (sessions, href) ->
    chart_cfg = Helpers.configure_chart(sessions, config)
    chart_cfg.xValues =
      config.x.accessor(sess) for sess in sessions
    chart_cfg.xFormat = Helpers.dateFormat
    chart_cfg
]


svcs.factory 'File', ['$http', ($http) ->
  # Helper function to read the given server file.
  # @param path the file path relative to the web app root
  # @returns the Angular $http request
  read: (path) ->
    # Remove the leading slash, if necessary.
    if path[0] == '/'
      path = path[1..]
    # Read the file.
    $http
      method: 'GET'
      url: '/static/' + path
]


svcs.factory 'Image', ['$rootScope', 'File', ($rootScope, File) ->
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

  # Creates an object which encapsulates an image. The object has
  # the following properties:
  # * filename - the image file name
  # * state - contains the loading flag
  # * data - the binary image content
  # * load() - the function to read the image file
  #
  # @param filename the image file path
  # @returns a new image object
  create = (filename) ->
    # The image file path, relative to the web app root.
    filename: filename
    
    # The image state loading flag is true if the file is being
    # loaded, false otherwise.
    state:
      loading: false
    
    # The image binary content.
    data: null
    
    # Transfers the image file content to the data attribute.
    # The image state loading flag is set to true while the
    # file is read.
    #
    # @returns the Angular $http request
    load: () ->
      # Set the loading flag.
      @state.loading = true
      # Read the file. The Coffeescript fat arrow (=>) binds the
      # this variable to the image object rather than the $http
      # request.
      File.read(filename).success (data, args...) =>
        # Unset the loading flag.
        @state.loading = false
        # Set the data property to the file content.
        @data = data

  # Obtains image objects for the given ImageContainer. The image
  # object content is described in the create() function.
  #
  # This function caches the fetched image objects. If the image
  # objects are already cached for the given image container,
  # then this function returns the cached objects. Otherwise, this
  # function creates, caches and returns new image objects. The
  # cached object image content data is not loaded until the image
  # object load() function is called.
  #
  # @param image the ImageContainer scan or registration object
  # @returns the image objects
  images_for: (obj) ->
    cache(obj.id) or cache(obj.id, obj.files...)
]
