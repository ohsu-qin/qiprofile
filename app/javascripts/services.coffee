svcs = angular.module 'qiprofile.services', ['ngResource']

svcs.factory 'Subject', ['$resource', ($resource) ->
  $resource '/api/subjects/:number/', null,
    detail:
      method: 'GET'
      url: '/api/subject-detail/:id/'
]

svcs.factory 'Session', ['$resource', ($resource) ->
  $resource '/api/session-detail/:id/', null,
    detail:
      method: 'GET'
      url: '/api/session-detail/:id/'
]

svcs.factory 'Helpers', [->
  # If the given attribute value is a string, then this function
  # resets it to the parsed date.
  fixDate: (obj, attr) ->
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
  # * y is the y-axis {[dataSeries], precision}
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
  configureChart: (resources, config) ->
    # @returns the y values for the given resource
    resourceValues = (resource, config) ->
      ds.accessor(resource) for ds in config.y.data

    # @returns the result of applying the given function to the
    #   values obtained from the y-axis configuration
    applyToResources = (resources, config, fn) ->

      # @returns the result of applying the given function to the
      #   resource values of the given object
      applyToResource = (resource, config, fn) ->
        values = resourceValues(resource, config)
        fn(values)

      applyToResource(rsc, config, fn) for rsc in resources
    
    # @param resources the graphed objects
    # @param config the y axis configuration
    # @returns the y axis {max, min} object
    valueRange = (resources, config) ->

      # Return the {max, min} range object.
      max: _.max(applyToResources(resources, config, _.max))
      min: _.min(applyToResources(resources, config, _.min))

    # @returns the [{key: label, values: coordinates}] nvd3 data
    chartData = (resources, config) ->
      # @returns the {key, values} pair
      formatDataSeries = (resources, xAccessor, dataSeries) ->
        # @returns the graph [x, y] coordinates
        coordinates = (resources, xAccessor, yAccessor) ->
          [xAccessor(rsc), yAccessor(rsc)] for rsc in resources
        
        key: dataSeries.label
        values: coordinates(resources, xAccessor, dataSeries.accessor)
        color: dataSeries.color

      formatDataSeries(resources, config.x.accessor, ds) for ds in config.y.data
    
    # @param valueRange the y values {max, min} range object
    # @param returns the chart y axis {max, min} range object
    yRange = (valueRange, precision) ->
      # The factor is 10**precision.
      factor = Math.pow(10, precision)

      ceiling = Math.ceil(valueRange.max * factor)
      # Pad the graph max with the next higher significant tick mark.
      upperInt = if ceiling == 0 then ceiling else ceiling + 1
      upper = upperInt / factor

      # Round the minimum down to the nearest precision decimal.
      floor = Math.floor(valueRange.min * factor)
      # If the floor is not at the origin, then pad the graph min with
      # the next lower significant tick mark.
      lowerInt = if floor == 0 then floor else floor - 1
      lower = lowerInt / factor

      # Return the chart{max, min} range object.
      max: upper
      min: lower
    
    defaultPrecision = (resources, config) ->
      defaultResourcePrecision = (resource, config) ->
        # @returns the number of decimals to display for the given
        #   value
        defaultValuePrecision = (value) ->
          if value == 0 or value > 1
            0
          else
            1 + defaultValuePrecision(value * 10)
        
        rscValues = resourceValues(resource, config)
        valuePrecisions =
          defaultValuePrecision(value) for value in rscValues
        _.max(valuePrecisions)
      
      rscPrecisions =
        defaultResourcePrecision(rsc, config) for rsc in resources
      _.max(rscPrecisions)
    
    # The value range.
    valRange = valueRange(resources, config)
    
    # Get the default precision, if necessary.
    if config.y.precision
      precision = config.y.precision
    else
      precision = defaultPrecision(resources, config)
    
    # The chart range.
    chartYRange = yRange(valRange, precision)
    
    # This function is a work-around for the following missing
    # nv3d feature:
    # * allow different formats for y ticks and y tooltip values
    #
    # @returns a function which formats the y axis
    #   ticks differently than the y tooltip values
    decimalFormatter = (precision) ->
      factor = Math.pow(10, precision)
      formatTick = d3.format('.' + precision + 'f')
      formatValue = d3.format('.' + (precision + 2) + 'f')
      
      (value) ->
        shifted = value * factor
        if shifted - Math.floor(shifted) < .001
          formatTick(value)
        else
          formatValue(value)

    # Return the graph configuration.
    data: chartData(resources, config)
    yFormat: decimalFormatter(precision)
    yLabel: config.y.label
    yMaxMin: _.values(chartYRange)

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
  xConfig =
    label: 'Visit Date'
    accessor: (session) -> session.acquisition_date.valueOf()

  # The y axis data configuration.
  yConfigs =
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
    ktrans: {x: xConfig, y: yConfigs.ktrans}
    ve: {x: xConfig, y: yConfigs.ve}
    taui: {x: xConfig, y: yConfigs.taui}
  
  # @param sessions the session array 
  # @param chart the chart name
  # @returns the nvd3 chart format
  configureChart: (sessions, chart) ->
    # @returns the tooltip HTML
    tooltip = (key, x, y, e, graph) ->
      "<b>#{ key }</b>: #{ y }"
    
    # The nvd3 data configuration.
    dataCfg = configs[chart]
    # The nvd3 chart configuration.
    chartCfg = Helpers.configureChart(sessions, dataCfg)
    # Additional nvd3 directive attribute values.
    chartCfg.xValues = dataCfg.x.accessor(sess) for sess in sessions
    chartCfg.xFormat = Helpers.dateFormat
    chartCfg.tooltip = tooltip

    chartCfg
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
  configureChart: (sessions, href) ->
    chartCfg = Helpers.configureChart(sessions, config)
    chartCfg.xValues =
      config.x.accessor(sess) for sess in sessions
    chartCfg.xFormat = Helpers.dateFormat
    chartCfg
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
  imagesFor: (obj) ->
    cache(obj.id) or cache(obj.id, obj.files...)
]
