svcs = angular.module 'qiprofile.services', ['ngResource']

svcs.factory 'Subject', ['$q', '$resource', ($q, $resource) ->
  # The Subject resource recognizes a 'get' query method on the
  # subject id, but qiprofile does not call this in practice.
  # Fetching a Subject is done by a query on the subject project,
  # collection and number, which returns a singleton or empty
  # array.
  $resource '/api/subjects/:id', null,
    query:
      method: 'GET'
      isArray: true
      transformResponse: (data) -> angular.fromJson(data)._items
    detail:
      method: 'GET'
      url: '/api/subject-detail/:id/'
]


# Since the REST Session objects are embedded in SubjectDetail,
# this Session factory only operates on the session-detail
# REST objects. The preferred access method is detail, which
# is a SessionDetail get. The query and delete methods are not
# meaningful. Session delete is accomplished by the parent
# Subject delete, which cascades to its embedded sessions.
svcs.factory 'Session', ['$resource', ($resource) ->
  $resource '/api/session-detail/:id/', null,
    detail:
      method: 'GET'
      url: '/api/session-detail/:id/'
]


svcs.factory 'Helpers', ->
  # Copies the given source detail object properties into the
  # destination object, with the following exception:
  # * fields which begin with an underscore are not copied
  #   (including the _id field)
  copyDetail: (source, dest) ->
    # Copy the detail properties into the parent object.
    srcProps = Object.getOwnPropertyNames(source)
    destProps = Object.getOwnPropertyNames(dest)
    fields = _.difference(srcProps, destProps)
    for field in fields
      if field[0] != '_'
        dest[field] = source[field]

  # If the given attribute value is a string, then this function
  # resets it to the parsed date.
  fixDate: (obj, attr) ->
    date = obj[attr]
    # Silly Javascript idiom for string type testing.
    if typeof date == 'string' or date instanceof String
      # Reset the attribute to a date.
      obj[attr] = moment(date)
  
  
svcs.factory 'Chart', ->
  # Builds the nvd3 chart format for the given input resource
  # objects and configuration.
  #
  # The input data is the resource objects which contain the
  # values to graph. The chart values are obtained by calling
  # the input format x-axis accessor for each chart data series. 
  #
  # The input dataSpec contains the follwing x and y attributes:
  # * x is the x-axis {label, accessor}
  # * y is the y-axis {[{label, accessor}, ...], precision},
  # where label is the data series chart label and accessor
  # is the data series value to chart, and precision is the
  # decimal precision to use for all data series values
  #   
  # The result contains the following attributes:
  # * data - the nvd3 chart data
  # * color - the nvd3 color function
  # * maxMin - the maximum and minimum chart y-axis display values
  #
  # @param data the resource objects to graph
  # @param dataSpec the data access specification
  # @returns the chart configuration
  configureChart: (data, dataSpec) ->
    # Note - nvd3 is undergoing a major version 2 rewrite.
    # Hopefully, version 2 will address the anomalies noted in
    # the modeling-discrete-chart template.
    # TODO - Adapt this function for version 2 when it is
    # completed.

    # @returns the y values for the given resource
    resourceYValues = (resource, dataSpec) ->
      ds.accessor(resource) for ds in dataSpec.y.data

    # @param data the graphed objects
    # @param dataSpec the y axis dataSpec
    # @returns the y axis {max, min} object
    getYValueRange = (data, dataSpec) ->
      # @param data the resource objects to graph
      # @param dataSpec the data access specification described
      #   in configureChart
      # @returns the result of first calling the accessor in the
      #   data specification to the given resoure, and then applying
      #   the given function
      applyToAllResourcesYValues = (data, dataSpec, fn) ->
        # @returns the result of applying the given function to the
        #   resource values of the given object
        applyToAResourceYValues = (resource, dataSpec, fn) ->
          values = resourceYValues(resource, dataSpec)
          fn(values)

        applyToAResourceYValues(rsc, dataSpec, fn) for rsc in data

      # Return the {max, min} range object.
      max: _.max(applyToAllResourcesYValues(data, dataSpec, _.max))
      min: _.min(applyToAllResourcesYValues(data, dataSpec, _.min))

    # @param data the input resource objects
    # @param dataSpec the dataSpec described in configureChart
    # @returns the [{key: label, values: coordinates}, ...]
    #   nvd3 configuration
    configureAllDataSeries = (data, dataSpec) ->
      # @param data the input resource objects
      # @param x the x-xaxis {accessor: function} object
      # @param y the y-axis  {accessor: function} object
      # @returns the {key, values} pair
      configureADataSeries = (data, x, y) ->
        # @returns the graph [x, y] coordinates
        coordinates = (data, xAccessor, yAccessor) ->
          [xAccessor(rsc), yAccessor(rsc)] for rsc in data
        
        key: dataSeries.label
        values: coordinates(data, x.accessor, y.accessor)
        color: dataSeries.color

      for dataSeries in dataSpec.y.data
       configureADataSeries(data, dataSpec.x, dataSeries)
    
    # Adds padding to the give value range as follows:
    # * the the chart max is the next higher significant
    #   tick mark
    # * if the value min is zero, then that is the chart
    #   min. Otherwise the chart min is the next lower
    #   significant tick mark
    #
    # @param range the chart values {max, min} range object
    # @param returns the chart axis {max, min} range object
    padRange = (range, precision) ->
      # The factor is 10**precision.
      factor = Math.pow(10, precision)

      ceiling = Math.ceil(range.max * factor)
      # Pad the graph max with the next higher significant tick mark.
      upperInt = if ceiling == 0 then ceiling else ceiling + 1
      upper = upperInt / factor

      # Round the minimum down to the nearest precision decimal.
      floor = Math.floor(range.min * factor)
      # If the floor is not at the origin, then pad the graph min with
      # the next lower significant tick mark.
      lowerInt = if floor == 0 then floor else floor - 1
      lower = lowerInt / factor

      # Return the chart{max, min} range object.
      max: upper
      min: lower
    
    # @param data the resource objects
    # @param dataSpec the data access specification
    # @returns the number of decimals to display on the y-axis
    defaultYPrecision = (data, dataSpec) ->
      # @param resource the resource object
      # @param dataSpec the data access specification
      defaultResourcePrecision = (resource, dataSpec) ->
        # Determine the default value precision as follows:
        # * If the value is zero or greater then one, then zero
        # * Otherwise, the number of significant decimal digits
        #
        # @param value the numeric value
        # @returns the number of decimals to display for the
        #   given value
        defaultValuePrecision = (value) ->
          if not value or value > 1
            0
          else
            1 + defaultValuePrecision(value * 10)
        
        # The resource data series y values.
        values = resourceYValues(resource, dataSpec)
        # The precision for each value.
        precisions =
          defaultValuePrecision(value) for value in values
        # Return the largest precision.
        _.max(precisions)
      
      # The precision for each resource.
      precisions =
        defaultResourcePrecision(rsc, dataSpec) for rsc in data
      # Return the largest precision.
      _.max(precisions)
    
    # This function is a work-around for the following missing
    # nv3d feature:
    # * allow different dataSpecs for y ticks and y tooltip
    #   values
    # This function allows for displaying the y-axis values
    # with two more precision digits than the y-axis ticks.
    #
    # @returns a function which formats the y axis
    #   ticks differently than the y tooltip values
    decimalFormatter = (precision) ->
      # The multiplicative factor.
      factor = Math.pow(10, precision)
      # The y-axis tick format. 
      formatTick = d3.format('.' + precision + 'f')
      # The y-axis value format allows for more precision than
      # the tick mark.
      formatValue = d3.format('.' + (precision + 2) + 'f')
      
      # @param value the value to format
      # @returns the d3 formatter function
      (value) ->
        # Shift the value to the left.
        shifted = value * factor
        # If there are no significant decimal digits in
        # the shifted value, then format the value as a
        # tick mark. Otherwise, format the value as a data
        # series value.
        if shifted - Math.floor(shifted) < .001
          formatTick(value)
        else
          formatValue(value)
    
    # The y-axis value range.
    valueYRange = getYValueRange(data, dataSpec)
    
    # Get the default precision, if necessary.
    if dataSpec.y.precision
      precision = dataSpec.y.precision
    else
      precision = defaultYPrecision(data, dataSpec)
    
    # The chart y-axis range.
    chartYRange = padRange(valueYRange, precision)

    # Return the graph configuration.
    data: configureAllDataSeries(data, dataSpec)
    yFormat: decimalFormatter(precision)
    yLabel: dataSpec.y.label
    yMaxMin: _.values(chartYRange)
  
  # @param date the moment date integer
  # @return the formatted date
  dateFormat: (date) ->
    moment(date).format('MM/DD/YYYY')

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


svcs.factory 'Modeling', ['Chart', (Chart) ->
  # The common modeling x-axis specification.
  x =
    label: 'Visit Date'
    accessor: (session) -> session.acquisition_date.valueOf()

  # The chart-specific y-axis specifications.
  y =
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
  
  # The chart data access specifications.
  DATA_SPECS =
    ktrans: {x: x, y: y.ktrans}
    ve: {x: x, y: y.ve}
    taui: {x: x, y: y.taui}
  
  # @param sessions the session array 
  # @param chart the chart name
  # @returns the nvd3 chart dataSpec
  configureChart: (sessions, chart) ->
    # @returns the nvd3 tooltip HTML
    tooltip = (key, x, y, e, graph) ->
      "<b>#{ key }</b>: #{ y }"
    
    # The nvd3 data configuration.
    dataSpec = DATA_SPECS[chart]
    # Return the standard chart configuration extended
    # with the following:
    # * the xValues and xFormat properties
    # * the tooltip function
    _.extend Chart.configureChart(sessions, dataSpec),
      xValues: (dataSpec.x.accessor(sess) for sess in sessions)
      xFormat: Chart.dateFormat
      tooltip: tooltip

  # Configures the modeling tables.
  configureTable: (sessions) ->
    sessionsWithChangeProperties = (sessions) ->
      # @param current the current modeling parameters
      # @param previous the previous modeling parameters
      # @returns the session objects extended to include
      #   the percent change properties for all but the
      #   first session
      addSessionChangeProperties = (current, previous) ->
        # @param current the current modeling parameters
        # @param previous the previous modeling parameters
        # @returns the percent change properties object
        extension = (current, previous) ->
          # @param current the current value
          # @param previous the previous value
          # @returns the percent change
          percent_change = (current, previous) ->
            (current - previous)/previous * 100
          
          # Return an object with the change properties.
          delta_k_trans_pct_change: percent_change(current.delta_k_trans, previous.delta_k_trans)
          fxl_k_trans_pct_change: percent_change(current.fxl_k_trans, previous.fxl_k_trans)
          fxr_k_trans_pct_change: percent_change(current.fxr_k_trans, previous.fxr_k_trans)
          v_e_pct_change: percent_change(current.v_e, previous.v_e)
          tau_i_pct_change: percent_change(current.tau_i, previous.tau_i)
        
        # If this is not the first session's modeling object,
        # then extend the object with the percent change properties,
        # otherwise, return the first modeling object unchanged. 
        if previous
          _.extend current, extension(current, previous)
        else
          current

      # The previous modeling object.
      prev = null
      # The modeling objects extended with change properties.
      result = []
      # Extend all but the first modeling object with change properties.
      for sess in sessions
        curr = sess.modeling
        if curr
          result.push addSessionChangeProperties(curr, prev)
          prev = curr
      # Return the result.
      result

    # Return the configuration object.
    data: sessionsWithChangeProperties(sessions)
    # The accordian controls.
    ktransOpen: true
    veOpen: true
    tauiOpen: true
    # The table size.
    ktransTableSize: "qi-full-width-table"
    veTableSize: "qi-half-width-table"
    tauiTableSize: "qi-half-width-table"
]


svcs.factory 'VisitDateline', ['Chart', (Chart) ->
  # @param data the session array
  # @returns the nvd3 chart configuration
  configureChart: (sessions) ->
    # Adds the session hyperlinks above the timeline.
    # The template sets the callback attribute to this
    # function. 
    #
    # @param chart the timeline chart
    addSessionDetailLinks = (sessions, chart) ->
      # @returns the link to detail page for the given session
      sessionDetailLink = (session) ->
        "/quip/#{ session.subject.collection.toLowerCase() }/subject/" +
        "#{ session.subject.number }/session/#{ session.number }?" +
        "project=#{ session.subject.project }&detail=#{ session.detail }"
      
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
        session = sessions[i]
        # Make a new SVG text element.
        text = d3.select(tick).append('text')
        text.attr('dx', '-.2em').attr('dy', '-.5em')
        text.style('text-anchor: middle')
        # The text content is the session number.
        text.text(session.number)
        # The hyperlink target.
        href = sessionDetailLink(session)
        # Wrap the text element in a hyperlink.
        Chart.d3Hyperlink(text.node(), href)

    # The chart data specification.
    dataSpec =
      x:
        accessor: (session) -> session.acquisition_date.valueOf()
      y:
        # The y coordinate is always zero.
        data: [ accessor: (session) -> 0 ]

    # Return the standard chart configuration extended
    # with the following:
    # * the xValues and xFormat properties
    # * the addSessionDetailLinks function
    _.extend Chart.configureChart(sessions, dataSpec),
      xValues: (dataSpec.x.accessor(sess) for sess in sessions)
      xFormat: Chart.dateFormat
      addSessionDetailLinks: (chart) ->
        addSessionDetailLinks(sessions, chart)
]


svcs.factory 'Intensity', ['Chart', (Chart) ->
  # Highlights the bolus arrival tick mark.
  #
  # @param session the session object
  # @param chart the intensity chart
  highlightBolusArrival = (session, chart) ->
    # Select the SVG element.
    svg = d3.select(chart.container)
    # The x axis element.
    xAxis = svg.select('.nv-x')
    # The tick elements.
    ticks = xAxis.selectAll('.tick')[0]
    # The bolus tick element.
    bolusTick = ticks[session.bolus_arrival_index]
    # The bolus tick child line element.
    bolusTickLine = $(bolusTick).children('line')[0]
    highlight = $(bolusTickLine).clone()
    # Set the class attribute directly, since neither the d3 nor
    # the jquery add class utility has any effect. d3 has the
    # following bug:
    # * In the d3 source, the function named 'classed' has a
    #   condition:
    #       if (value = node.classList) {
    #   which should read:
    #       if (value == node.classList) {
    # It is unknown why the jquery addClass doesn't work.
    $(highlight).attr('class', 'qi-bolus-arrival')
    # Insert the highlight SVG element after the tick line.
    # The highlight will display centered over the tick line.
    $(highlight).insertAfter(bolusTickLine)
    # Add the legend.
    legend = svg.select('.nv-legend')
    legendGroup = legend.select(':first-child')
    bolusGroup = legendGroup.insert('svg:g', ':first-child')
    bolusGroup.attr('transform', 'translate(-30, 5)')
    filter = bolusGroup.append('svg:filter')
    filter.attr('width', 1.2).attr('height', 1)
    filter.attr('id', 'boluslegendbackground')
    filter.append('feFlood').attr('class', 'qi-bolus-flood')
    filter.append('feComposite').attr('in', 'SourceGraphic')
    bolusLegend = bolusGroup.append('svg:text')
    bolusLegend.attr('class', 'qi-bolus-legend')
    bolusLegend.attr('dy', '.32em')
    bolusLegend.attr('filter', 'url(#boluslegendbackground)')
    bolusLegend.text('Bolus Arrival')

  # The y-axis format function. If the given intensity value
  # is integral, then this function returns the integer.
  # Otherwise, the value is truncated to two decimal places. 
  #
  # nvd3 unfortunately uses this function to format both the tick
  # values and the tooltip y values. Therefore, this function
  # formats the integral tick values as an integer and the float
  # y values as floats. Thus, both the y tick values and the
  # tooltip are more readable.
  #
  # @param value the intensity value
  # @returns the chart display value
  yFormat = (value) ->
    # ~~ is the obscure Javascript idiom for correctly converting
    # a float to an int. Math.ceil does not correctly truncate
    # negative floats.
    intValue = ~~value
    if value == intValue
      intValue
    else
      value.toFixed(2)

  # Makes the intensity chart configuration for the given session.
  #
  # The result includes two data series, Scan and Realigned.
  # The chart x-axis labels are the one-based series indexes,
  # e.g. ['1', '2', ..., '12'] for 12 series.
  #
  # @param session the session object
  # @returns the nvd3 chart configuration
  configureChart: (session) ->
    # @param intensities the intensity value array
    # @returns the intensity chart [x, y] coordinates
    coordinates = (intensities) ->
      [i + 1, intensities[i]] for i in [0...intensities.length]

    # Makes the data series {key, color} format object for the
    # given registration.
    #
    # The key is 'Realigned' if there is exactly one registration,
    # otherwise the registration name
    #
    # @param registration the registration object
    # @param index the index of the registration in the registrations array
    # @returns the data series {key, color, values} format object
    registration_data_series = (registration, index) ->
      # The registration image select button colors.
      COLORS = ['LightGreen', 'LightYellow', 'LightCyan', 'LemonChiffon']
      
      key = registration.title
      
      # TODO - Wrap the key in a registration parameters pop-up hyperlink.
      # Return the data series format object.
      key: key
      color: COLORS[index % COLORS.length]
      values: coordinates(registration.intensity.intensities)

    # The scan data series configuration.
    scan_data =
      key: session.scan.title
      values: coordinates(session.scan.intensity.intensities)
      color: 'Indigo'

    # The registration data series configuration.
    for reg, i in session.registrations
      # Set the data series property so the partial can use the data
      # series key.
      reg.data_series = registration_data_series(reg, i)
    reg_data = ((reg.data_series for reg in session.registrations))
    
    # Return the chart configuration.
    data: [scan_data].concat(reg_data)
    xValues: (coord[0] for coord in scan_data.values)
    yFormat: yFormat
    highlightBolusArrival: (chart) ->
      highlightBolusArrival(session, chart)
]


svcs.factory 'File', ['$http', ($http) ->
  # Helper function to read the given server file.
  # @param path the file path relative to the web app root
  # @returns a promise which resolves to the file content
  read: (path) ->
    # Remove the leading slash, if necessary.
    if path[0] == '/'
      path = path[1..]
    # Read the file and resolve to the content.
    $http(method: 'GET', url: '/static/' + path).then (response) ->
      response.data
]


svcs.factory 'Image', ['$rootScope', 'File', ($rootScope, File) ->
  # The root scope {parent id: [Image objects]} cache.
  if not $rootScope.images
    $rootScope.images = {}
  
  # If there are file arguments, then this function
  # caches the Image objects for the given parent object.
  # Otherwise, this function returns the cached image objects,
  # or undefined if there is no cache entry for the object.
  cache = (parent, files...) ->
    if files.length
      $rootScope.images[parent.id] =
        create(parent, filename, i+1) for filename, i in files
    else
      $rootScope.images[parent.id]

  # Creates an object which encapsulates an image. The object has
  # the following properties:
  # * filename - the image file name
  # * state - contains the loading flag
  # * data - the binary image content
  # * load() - the function to read the image file
  #
  # @param parent the image parent container
  # @param filename the image file path, relative to the web app root
  # @param time_point the series time point
  # @returns a new image object
  create = (parent, filename, time_point) ->
    parent: parent
    filename: filename
    time_point: time_point
    
    # The image state loading flag is true if the file is being
    # loaded, false otherwise.
    state:
      loading: false
    
    # The image binary content.
    data: null
    
    # Transfers the image file content to the data property.
    # The image state loading flag is set to true while the
    # file is read.
    #
    # @returns a promise which resolves to this image when
    #   the image file file content is loaded into the data
    #   property
    load: () ->
      # Set the loading flag.
      @state.loading = true
      # Read the file. The Coffeescript fat arrow (=>) binds the
      # this variable to the image object rather than the $http
      # request.
      File.read(filename).then (data) =>
        # Unset the loading flag.
        @state.loading = false
        # Set the data property to the file content.
        @data = data
        # Return the image.
        this
    
    # Builds an XTK renderer for this image.
    createRenderer: =>
      # The XTK renderer.
      renderer = new X.renderer3D()
      renderer.init()
      
      # The volume to render.
      volume = new X.volume()
      volume.file = @filename
      volume.filedata = @data
      renderer.add volume
      
      # The rendering callback. This function is called after the
      # volume is initialized and prior to the first rendering.
      renderer.onShowtime = ->
        # The volume display controls.
        volumeCtls = new dat.GUI()
        # The controls interact with the volume.
        volumeCtls = gui.addFolder('Volume')
        # The rendering control.
        renderingCtl = volumeCtls.add(volume, 'volumeRendering')
        # The opacity control.
        opacityCtl = volumeCtls.add(volume, 'opacity', 0, 1).listen()
        # The threshold min and max range controls.
        minCtl = volumeCtls.add(volume, 'lowerThreshold', volume.min, volume.max)
        maxCtl = volumeCtls.add(volume, 'upperThreshold', volume.min, volume.max)
        # The slice dimension controls.
        sliceXCtl = volumeCtls.add(volume, 'indexX', 0, volume.range[0] - 1)
        sliceYCtl = volumeCtls.add(volume, 'indexY', 0, volume.range[1] - 1)
        sliceZCtl = volumeCtls.add(volume, 'indexZ', 0, volume.range[2] - 1)
        # Display the controls.
        volumeCtls.open();

      # Adjust the camera position.
      renderer.camera.position = [120, 80, 160]
      
      # Return the renderer.
      renderer

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
  # @param parent the Scan or Registration object
  # @returns the image objects
  imagesFor: (parent) ->
    cache(parent) or cache(parent, parent.files...)
]
