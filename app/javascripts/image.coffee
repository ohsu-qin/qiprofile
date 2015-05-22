define ['angular', 'lodash', 'underscore.string', 'xtk', 'file', 'slider'], (ng, _, _s) ->
  image = ng.module 'qiprofile.image', ['qiprofile.file', 'qiprofile.modeling', 'vr.directives.slider']

  image.factory 'Image', ['$rootScope', '$q', 'File', 'Modeling', ($rootScope, $q, File, Modeling) ->
    # The root scope {parent id: [Image objects]} cache.
    if not $rootScope.images
      $rootScope.images = {}

    # The Image class encapsulates a volume image with the following properties:
    # * volume - the image scan or registration volume object
    # * number - the one-based image volume number 
    # * state - one of 'unloaded', 'loading' or 'loaded'
    # * xtkVolume - the XTK volume object
    # * load() - read the image file
    # * open(element) - render the image
    # * isOverlayVisible() - whether there is an associated label map file
    # * selectOverlay() - show the overlay
    # * deselectOverlay() - hide the overlay
    #
    # This class is private within the Image service scope.
    class Image
      # The valid image load states.
      @STATES =
        UNLOADED: 'unloaded'
        LOADING: 'loading'
        LOADED: 'loaded'
        NOT_FOUND: 'not found'

      # Creates an object which encapsulates an image.
      #
      # @param volume the image parent scan volume
      #   (not the XTK volume)
      # @param id the unique image id
      # @returns a new image object
      constructor: (@volume, @id) ->
        # The initial state is unloaded.
        @state = Image.STATES.UNLOADED
        # The overlays convenience property delegates to the volume
        # session.
        #
        # @returns the session modeling label map objects which have
        #   a color table
        Object.defineProperty this, 'overlays',
          get: ->
            @volume.container.session.overlays
      
      # Transfers the file content to the data properties.
      # The image state loading flag is set to true while the
      # files are being read.
      #
      # @returns a promise which resolves to this image object
      #   when the file is loaded 
      load: ->
        # Set the loading flag.
        @state = Image.STATES.LOADING
        # The volume to render.
        @xtkVolume = new X.volume()
        @xtkVolume.file = @volume.filename

        # Read the file into an ArrayBuffer. The CoffeeScript fat
        # arrow (=>) binds the this variable to the image object
        # rather than the $http request.
        File.readBinary(@volume.filename).then (res) =>
          # If the file is not found, display an alert and set the
          #   state to not found.
          if res.status is 404
            alert "Image volume not found."
            @state = Image.STATES.NOT_FOUND
          else
            # Set the data property to the scan file content.
            @xtkVolume.filedata = res.data
            # Set the state to loaded.
            @state = Image.STATES.LOADED
            # Return the loaded image.
          this

      isLoaded: ->
        @state == Image.STATES.LOADED

      isLoading: ->
        @state == Image.STATES.LOADING

      isNotFound: ->
        @state == Image.STATES.NOT_FOUND

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
        renderer.add(@xtkVolume)
    
        # Set the volume threshold levels to defaults.
        # These must be set here for the slider controls to load with the
        # correct values.
        @xtkVolume.lowerThreshold = 0
        @xtkVolume.upperThreshold = 445
    
        # Adjust the camera position.
        renderer.camera.position = [0, 0, 240]

        # Render the image.
        renderer.render()

      # Returns whether the XTK volume has a visible label map. This
      # function is required to work around the XTK bug described in
      # image-controls.jade.
      isOverlayVisible: ->
        @xtkVolume._labelmap? and @xtkVolume._labelmap._children? and
        @xtkVolume._labelmap._children.length and @xtkVolume._labelmap.visible

      # Deselects an existing overlay as follows:
      # * If the image volume has a label map, then the label map visible
      #  flag is set to false.
      # Otherwise, this function is a no-op.
      #
      # @param image the selected PK modeling parameter name, or 'none' to 
      #  remove an existing overlay
      deselectOverlay: ->
        @xtkVolume.labelmap.visible = false if @isOverlayVisible()

      # Changes the overlay label map and color lookup table as follows:
      # * Fetch the overlay files.
      # * Set the volume label map properties.
      # * Display the overlay.
      #
      # @param labelMap the selected label map {filename, colorTable}
      #   object
      selectOverlay: (labelMap) ->
        # Note: XTK labelmaps are treacherous territory; proceed with caution.
        # Specifically, XTK places the renderer in the browser event loop, so
        # that XTK renders and rerenders continuously and asynchronously.
        # Hopefully, the XTK render function checks for a state change and
        # only schedules a browser paint if necessary. Whether this state
        # change check is performed is unknown.
        #
        # Furthermore, XTK implicitly expects that its volume is complete and
        # consistent when it is rendered. For a labelmap, XTK checks the XTK
        # volume._labelmap. If it exists and the labelmap visible flag is set,
        # then XTK expects the labelmap data to be fully loaded and renders
        # the labelmap.
        #
        # However, simply checking the existing XTK volume.labelmap
        # property automatically creates the XTK volume._labelmap object.
        # Furthermore, the newly created empty XTK volume._labelmap.visible
        # flag is set to true by default. Thus, a naive implementation that
        # checks for an existing labelmap and then asynchronously loads the
        # labelmap file results in the following XTK render error:
        #
        #   Uncaught TypeError: Cannot read property '_id' of null 
        #
        # The work-around is as follows:
        # * If checking for an existing labelmap, bypass accessing the
        #   XTK volume.labelmap property and check the XTK volume._labelmap
        #   variable instead.
        # * If an overlay is selected which differs from the existing overlay,
        #   then set the XTK volume.labelmap.visible property to false before
        #   anything else. Although referencing the XTK volume.labelmap property
        #   creates the XTK volume._labelmap object with incomplete and
        #   inconsistent content, the visible flag set to false prevents XTK
        #   from attempting to render the incomplete labelmap.
        # * Set the XTK volume.labelmap content as appropriate, e.g. the file
        #   and colortable.file.
        # * Load the label map and color table asynchronously.
        # * When both are loaded, then finally set the XTK volume.labelmap.visible
        #   property to true. Setting visible to true triggers a repaint with the
        #   overlay.
        
        # The XTK volume labelmap file, or null if there is no labelmap.
        xtkLabelMapFile = @xtkVolume._labelmap.file if @xtkVolume._labelmap?
        # If the label map was not changed from the last value, then we only
        # need to set the visible flag.
        if xtkLabelMapFile is labelMap.filename
          @xtkVolume.labelmap.visible = true
          return
        
        # The label map must have a color table.
        if not labelMap.colorTable?
          throw new ValueError("The label map is missing a color table:" +
                               " #{ labelMap.filename } ")

        # Set the XTK volume labelmap visible flag to false.
        # See the function Note comment above.
        @xtkVolume.labelmap.visible = false
        # Set the volume label map file name property.
        @xtkVolume.labelmap.file = labelMap.filename
        # Set the volume color table file name property.
        @xtkVolume.labelmap.colortable.file = labelMap.colorTable


        # Retrieve the overlay layer map and color table.
        loadLabelMap = File.readBinary(labelMap.filename).then (data) ->
          # Set the volume label map data property.
          @xtkVolume.labelmap.filedata = data
        loadColorTable = File.readBinary(labelMap.colorTable).then (data) ->
          # Set the volume color table data property.
          @xtkVolume.labelmap.colortable.filedata = data

        # Join the two promises into a single promise.
        loaded = $q.all(loadLabelMap, loadColorTable)
        loaded.then ->
          # Turn on the label map. This triggers a redisplay of the volume
          # with the new overlay.
          @xtkVolume.labelmap.visible = true
    
    # @param volume the scan or registration image volume
    #   (not the XTK volume)
    # @param id the unique image id
    create = (volume, id) ->
      new Image(volume, id)
    
    # Caches the image for the given volume on demand.
    #
    # @parent the image scan or registration volume object
    # @returns the cached image object
    cache = (volume) ->
      # @param the image id, formatted as the session detail id,
      #   image container protocol id and volume number separated
      #   by periods
      # @returns the cached image object with the given id,
      #   or null if the image is not yet cached
      get = (imageId) ->
        $rootScope.images[imageId]
      
      # Adds the parent images to the cache.
      #
      # @param image the image object
      # @returns the image object
      add = (image) ->
        $rootScope.images[image.id] = image

      # The unique image id for caching.
      imageId = "#{ volume.container.session.detail }" +
                ".#{ volume.container.protocol }" +
                ".#{ volume.number }"
      # Get the cached image object or add a new image object.
      get(imageId) or add(create(volume, imageId))

    # The image load states.
    STATES: Image.STATES
    
    # Obtains image objects for the given volume object. The image
    # object content is described in the create() function.
    #
    # This function caches the volume object to preserve the fetched
    # image content. If the image object is already cached,
    # then this function returns the cached objects. Otherwise, this
    # function creates, caches and returns new image objects. The
    # cached object image content data is not loaded until the image
    # object load() function is called.
    #
    # @param parent the scan or registration volume object
    # @returns the image object
    forVolume: (volume) ->
      cache(volume)

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
