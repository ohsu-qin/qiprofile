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

svcs.factory 'Helpers', () ->
  # If the given attribute value is a string, then this function
  # resets it to the parsed date.
  fix_date: (obj, attr) ->
    date = obj[attr]
    # Silly Javascript idiom for string type testing.
    if typeof date == 'string' or date instanceof String
      # Reset the attribute to a date.
      obj[attr] = moment(date)
      
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
  # @param config the input configuration
  # @returns the chart format
  format_chart: (resources, config) ->

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
    
    # @returns the chart y-axis formatting max and min values
    chart_max_min = (resources, config) ->
      
      # @returns the result of applying the given function to the
      #   values obtained from the y-axis configuration
      apply_to_resources = (resources, config, fn) ->

        # @returns the result of applying the given function to the
        #   resource values of the given object
        apply_to_resource = (resource, config, fn) ->
          values =
            ds.accessor(resource) for ds in config.y.data
          fn(values)

        apply_to_resource(rsc, config, fn) for rsc in resources

      # The factor is 10**precision.
      precision = config.y.precision
      factor = if precision then Math.pow(10, precision) else 1
      
      # The max rounded up to the nearest precision decimal.
      max = _.max(apply_to_resources(resources, config, _.max))
      ceiling = Math.ceil(max * factor)
      # Pad the graph max with the next higher significant tick mark.
      upper = (ceiling + 1) / factor

      # The min rounded down to the nearest precision decimal.
      min = _.min(apply_to_resources(resources, config, _.min))
      floor = Math.floor(min * factor)
      # If the floor is not at the origin, then pad the graph min with
      # the next lower significant tick mark.
      lower_int = if floor == 0 then floor else floor - 1
      lower = lower_int / factor

      [upper, lower]
    
    # Return the graph configuration.
    data: chart_data(resources, config)
    color: (d, i) ->
      config.y.data[i].color
    maxMin: () ->
      chart_max_min(resources, config)


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
