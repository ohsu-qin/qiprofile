# TODO - dynamically load XTK. See, e.g.,
# http://www.bennadel.com/blog/2554-loading-angularjs-components-with-requirejs-after-application-bootstrap.htm
# and
# http://stackoverflow.com/questions/18591966/inject-module-dynamically-only-if-required
#
define ['angular', 'lodash', 'underscore.string', 'xtk', 'file', 'slider',
        'cornerstone', 'exampleImageIdLoader'], (ng, _, _s) ->
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
        ERROR: 'error'

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
        @xtkVolume.file = @volume.name

        # Read the file into an ArrayBuffer. The CoffeeScript fat
        # arrow (=>) binds the this variable to the image object
        # rather than the $http request.
        File.readBinary(@volume.name).then (data) =>
          # Set the data property to the scan file content.
          @xtkVolume.filedata = data
          # Set the state to loaded.
          @state = Image.STATES.LOADED
        .catch (res) =>
          # Display an alert with the status text.
          alert("The image volume file load was unsuccessful: " +
                "#{ res.statusText } (#{ res.status }).")
          # Set the state to 'error'.
          @state = Image.STATES.ERROR

        # TODO - this load function should return the above promise,
        #   which should resolve to the loaded image.
        this

      isLoaded: ->
        @state == Image.STATES.LOADED

      isLoading: ->
        @state == Image.STATES.LOADING

      isError: ->
        @state == Image.STATES.ERROR

      # Renders the image in the given parent element.
      #
      # @param element the Angular jQueryLite element
      open: (element) ->
        # Note: The XTK renderer is disabled here. A demo image and overlay is
        #   rendered with Cornerstone instead. See:
        #   https://github.com/chafey/cornerstone

        # The XTK renderer for this image.
        #renderer = new X.renderer3D()
        # The image is rendered within the given element.
        #renderer.container = element[0]
        # Build the renderer.
        #renderer.init()
        #renderer.add(@xtkVolume)
    
        # Set the volume threshold levels to defaults.
        # These must be set here for the slider controls to load with the
        # correct values.
        #@xtkVolume.lowerThreshold = 0
        #@xtkVolume.upperThreshold = 445
    
        # Adjust the camera position.
        #renderer.camera.position = [0, 0, 240]

        # Render the image. A demo image and overlay are rendered with
        #   Cornerstone. The image data are contained in exampleImageIdLoader.
        #   For the purposes of the demo, these are brain images freely
        #   provided by the Cornerstone project.
        dicomImage = cornerstone.enable(document.getElementById('qi-dicom-image'))
        overlay = cornerstone.enable(document.getElementById('qi-overlay'))
        cornerstone.loadAndCacheImage('example://1').then (image) ->
          cornerstone.displayImage dicomImage, image
          return

        `var i`
        # Create an inverting LUT.
        modalityLUT = 
          id: '1'
          firstValueMapped: 0
          numBitsPerEntry: 8
          lut: []
        i = 0
        while i < 256
          modalityLUT.lut[i] = 255 - i
          i++
        # Create a VOI LUT.
        voiLUT = 
          id: '1'
          firstValueMapped: 0
          numBitsPerEntry: 8
          lut: []
        i = 0
        while i < 256
          voiLUT.lut[i] = i / 2 + 127
          i++

        # Toggle the inverting LUT.
        $('#toggle-modality-lut').on 'click', ->
          applyModalityLUT = $('#toggle-modality-lut').is(':checked')
          viewport = cornerstone.getViewport(overlay)
          if applyModalityLUT
            viewport.modalityLUT = modalityLUT
          else
            viewport.modalityLUT = undefined
          cornerstone.setViewport overlay, viewport
          return
        # Toggle the VOI LUT.
        $('#toggle-voi-lut').on 'click', ->
          applyVOILUT = $('#toggle-voi-lut').is(':checked')
          viewport = cornerstone.getViewport(overlay)
          if applyVOILUT
            viewport.voiLUT = voiLUT
          else
            viewport.voiLUT = undefined
          cornerstone.setViewport overlay, viewport
          return

        #renderer.render()

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
      # @param labelMap the selected label map {name, colorTable}
      #   object
      selectOverlay: (labelMap) ->
        # Load and display the overlay in Cornerstone.
        overlay = cornerstone.enable(document.getElementById('qi-overlay'))
        cornerstone.loadAndCacheImage('example://2').then (image) ->
          cornerstone.displayImage overlay, image
          return

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
        
        ###

        # The XTK volume labelmap file, or null if there is no labelmap.
        xtkLabelMapFile = @xtkVolume._labelmap.file if @xtkVolume._labelmap?
        # If the label map was not changed from the last value, then we only
        # need to set the visible flag.
        if xtkLabelMapFile is labelMap.name
          @xtkVolume.labelmap.visible = true
          return
        
        # The label map must have a color table.
        if not labelMap.colorTable?
          throw new ValueError("The label map is missing a color table:" +
                               " #{ labelMap.name } ")

        # Set the XTK volume labelmap visible flag to false.
        # See the function Note comment above.
        @xtkVolume.labelmap.visible = false
        # Set the volume label map file name property.
        @xtkVolume.labelmap.file = labelMap.name
        # Set the volume color table file name property.
        @xtkVolume.labelmap.colortable.file = labelMap.colorTable


        # Retrieve the overlay layer map and color table.
        loadLabelMap = File.readBinary(labelMap.name).then (data) ->
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
    
        ###

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
