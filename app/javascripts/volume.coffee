# TODO - dynamically load XTK. See, e.g.,
# http://www.bennadel.com/blog/2554-loading-angularjs-components-with-requirejs-after-application-bootstrap.htm
# and
# http://stackoverflow.com/questions/18591966/inject-module-dynamically-only-if-required
#
define ['angular', 'lodash', 'underscore.string', 'xtk', 'file', 'slider'], (ng, _, _s) ->
  volume = ng.module 'qiprofile.volume', ['qiprofile.file', 'qiprofile.modeling', 'vr.directives.slider']

  volume.factory 'Volume', ['$rootScope', '$q', 'File', 'Modeling', ($rootScope, $q, File, Modeling) ->
    class Image extends Loader
      # @param volume the REST Volume object
      constructor: (@volume) ->

      # Transfers the NiFTI file image data to the data property.
      # The state loading flag is set to true while the
      # file is being read.
      #
      # @returns a promise which resolves to this time series
      #   when the file is loaded
      load: ->
        super @location

    # @returns the image store time series file path
    Object.defineProperties Image.prototype,
      location:
        get: ->
          parent_dir = @volume.location
          if @imageSequence._cls is 'Scan'
            "#{ @volume.location }/scan_ts/scan_ts.nii.gz"
          else if  @imageSequence._cls is 'Registration'
            "#{ parent_dir }/#{ @imageSequence.resource }_ts.nii.gz"

    # The ImageSequenceMixin class adds helper properties to an
    # image collection 4D scan or registration object.
    #
    # This class is private within the ImageSequence service scope.
    class ImageSequenceMixin
      # @param source the REST Scan or Registration object
      # @returns a new ImageSequence extension object
      constructor: ->
        # The encapsulated 4D time series image.
        @timeSeries = new TimeSeries(this)

    Object.defineProperties ImageSequenceMixin.prototype,
      # The image sequence location is the XNAT image store archive
      # directory. The scan location relative to the parent session is
      # SCANS/<scan number>. The registration location relative to the
      # parent scan is the registration resource.
      #
      # TODO - generalize this by delegating to an ImageStore service.
      #
      # @returns the image store directory for this image sequence
      location: ->
        get: ->
          if @_cls is 'Scan'
            "#{ @session.location }/SCANS/#{ @number }"
          else if  @_cls is 'Registration'
            "#{ @scan.session.location }/SCANS/#{ @scan.number }/#{ @resource }/"
          else
            throw new TypeError("Unsupported ImageSequence type:" +
                                " #{ @_cls }")
    #
    # This class is broken after the imageSequence and slice changes.
    # TODO - adapt to the ImageSequence mixin pattern.
    #
    # The Volume class encapsulates a volume with the following properties:
    # * volume - the image scan or registration volume object
    # * number - the one-based image volume number
    # * state - one of 'unloaded', 'loading' or 'loaded'
    # * volume - the XTK volume object
    # * load() - read the image file
    # * open(element) - render the image
    # * isOverlayVisible() - whether there is an associated label map file
    # * selectOverlay() - show the overlay
    # * deselectOverlay() - hide the overlay
    #
    # This class is private within the Image service scope.
    class VolumeMixin
      # Transfers the file content to the data properties.
      # The image state loading flag is set to true while the
      # files are being read.
      #
      # @returns a promise which resolves to this image object
      #   when the file is loaded
      load: ->
        super().then (data) ->
          # The XTK image to render.
          @xtkVolume = new X.volume()
          @xtkVolume.file = @location
          @xtkVolume.filedata = data
          data

      # Renders the image in the given parent element.
      #
      # @param element the Angular jqLite element
      open: (element) ->
        # The XTK renderer for this volume.
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

        # Render the volume.
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
      # @param labelMap the selected label map {name, colorTable}
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
      #   image sequence protocol id and volume number separated
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
        $rootScope.images[volume.id] = image

      # The unique image id for caching.
      imageId = "#{ imageSequence.session.detail }" +
                ".#{ imageSequence.protocol }" +
                ".#{ volume.number }"
      # Get the cached image object or add a new image object.
      get(imageId) or add(create(volume, imageId))
    
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

    # Formats the image sequence title.
    #
    # Note: this formatting routine should be confined to the filter,
    # but must be placed in this helper for use by the intensity
    # chart configuration.
    #
    # @param imageSequence the imageSequence object
    # @returns the display title for the imageSequence
    imageSequenceTitle: (imageSequence) ->
      if imageSequence._cls is 'Scan'
        "#{ _s.capitalize(imageSequence.name) } #{ imageSequence._cls }"
      else if  imageSequence._cls is 'Registration'
        if not imageSequence.source?
          throw new ReferenceError("The scan source name was not found")
        reg_src = _s.capitalize(imageSequence.source)
        "#{ reg_src } #{ imageSequence.type } #{ name }"
      else
        throw new TypeError("Unsupported image imageSequence type:" +
                            " #{ imageSequence._cls }")
  ]
