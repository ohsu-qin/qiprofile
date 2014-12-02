define ['angular', 'lodash', 'underscore.string', 'xtk', 'file', 'slider'], (ng, _, _s) ->
  image = ng.module 'qiprofile.image', ['qiprofile.file', 'qiprofile.modeling', 'vr.directives.slider']

  image.factory 'Image', ['$rootScope', '$q', 'File', 'Modeling', ($rootScope, $q, File, Modeling) ->
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
    # * labelmapFilename - the label map (overlay) file name
    # * colortableFilename - the color lookup table file name
    # * state - contains the loading flag
    # * data - the binary image content
    # * labelmapData - the label map image content
    # * colortableData - the color table content
    # * load() - the function to read the image file
    #
    # @param parent the image parent container
    # @param filename the image file path, relative to the web app root
    # @param timePoint the series time point
    # @returns a new image object
    create = (parent, filename, timePoint) ->
      # The valid states.
      STATES =
        UNLOADED: 'unloaded'
        LOADING: 'loading'
        LOADED: 'loaded'

      # @param session the image parent session the session object
      # @return the image overlays
      #   {modeling result name: {modeling parameter name: overlay}}
      #   object
      overlays = (session) ->
        # @param mdlResult the modeling result
        # @returns the {param name: overlay} object
        modelingResultOverlays = (mdlResult) ->
          # @param mdlParam the PK modeling parameter object
          # @returns whether the parameter object has a label map
          #   with a color table
          hasOverlay = (mdlParam) ->
            mdlParam.labelMap? and mdlParam.labelMap.colorTable?

          # Filter the PK parameters on the presence of an overlay.
          pkParams = _.pick(mdlResult, Modeling.PK_PARAMS, hasOverlay)
          # Return the {param name: label map} object.
          mdlOverlays = {}
          for [key, mdlParam] in _.pairs(pkParams)
            mdlOverlays[key] = mdlParam.labelMap
          mdlOverlays

        # Validate the argument.
        if not session?
          throw new ReferenceError("The overlays session is missing.")
        # The modeling results.
        modeling = session.modeling
        if not modeling? or not modeling.length
          return null

        # Collect the overlays.
        imageOverlays = {}
        for mdl in modeling
          imageOverlays[mdl.name] = modelingResultOverlays(mdl)

        # Return the overlays.
        imageOverlays

      # Return the image object with the following data and
      # function properties.
      parent: parent
      timePoint: timePoint
      overlays: overlays(parent.session)
      state: STATES.UNLOADED

      # Transfers the file content to the data properties.
      # The image state loading flag is set to true while the
      # files are being read.
      #
      # @returns a promise which resolves when the file reads
      #   are completed
      load: ->
        # Set the loading flag.
        @state = STATES.LOADING
        # The volume to render.
        @volume = new X.volume()
        @volume.file = filename

        # Read the file into an ArrayBuffer. The CoffeeScript fat
        # arrow (=>) binds the this variable to the image object
        # rather than the $http request.
        File.readBinary(filename).then (data) =>
          # Set the data property to the scan file content.
          @volume.filedata = data
          # Set the state to loaded.
          @state = STATES.LOADED

      # Renders the image in the given parent element.
      #
      # @param element the Angular jQueryLite element
      open: (element) ->
        # The XTK renderer for this image.
        renderer = new X.renderer3D()
        # The image is rendered within the given element.
        renderer.container = element[0]
        # Build the renderer.
        renderer.init()
        renderer.add(@volume)
      
        # Set the volume threshold levels to defaults.
        # These must be set here for the slider controls to load with the
        # correct values.
        @volume.lowerThreshold = 0
        @volume.upperThreshold = 445
      
        # Adjust the camera position.
        renderer.camera.position = [0, 0, 240]

        # Render the image.
        renderer.render()

      # Returns whether the volume has a label map overlay.
      # This function is required by the image-controls.jade work-around for
      # a XTK bug.
      hasLabelMap: ->
        @volume._labelmap and @volume._labelmap._children and
        @volume._labelmap._children.length

      # Deselects an existing overlay as follows:
      # * If the image volume has a label map, then the label map visible
      #  flag is set to false.
      # Otherwise, this function is a no-op.
      #
      # @param image the selected PK modeling parameter name, or 'none' to 
      #  remove an existing overlay
      deselectOverlay: ->
         @volume.labelmap.visible = false if @volume.labelmap?

      # Changes the overlay label map and color lookup table as follows:
      # * Fetch the overlay files.
      # * Set the volume label map properties.
      # * Display the overlay.
      #
      # @param labelMap the selected label map {filename, colorTable}
      #   object
      selectOverlay: (labelMap) ->
        # Set the volume label map file name property.
        @volume.labelmap.file = labelMap.filename
        # Set the volume color table file name property.
        @volume.labelmap.colortable.file = labelMap.colorTable.filename

        # Retrieve the overlay layer map and color table.
        loadLabelMap = File.readBinary(labelMap.filename).then (data) =>
          # Set the volume label map data property.
          @volume.labelmap.filedata  = data
        loadColorTable = File.readBinary(labelMap.colorTable.filename)
          .then (data) =>
            # Set the volume color table data property.
            @volume.labelmap.colortable.filedata = data

        # Join the two promises into a single promise.
        loaded = $q.all(loadLabelMap, loadColorTable)
        loaded.then =>
          # Turn on the label map. This triggers a redisplay of the volume
          # with the new overlay.
          @volume.labelmap.visible = true

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

    # Formats the image container title.
    #
    # Note: this formatting routine should be confined to the filter,
    # but must be placed in this helper for use by the intensity
    # chart configuration.
    #
    # @param container the container object
    # @returns the display title for the container
    containerTitle: (container) ->
      if container._cls is 'Scan'
        "#{ _s.capitalize(container.name) } #{ container._cls }"
      else if  container._cls is 'Registration'
        if not container.source?
          throw new ReferenceError("The scan source name was not found")
        reg_src = _s.capitalize(container.source)
        "#{ reg_src } #{ container.type } #{ name }"
      else
        throw new TypeError("Unsupported image container type:" +
                            " #{ container._cls }")
  ]
