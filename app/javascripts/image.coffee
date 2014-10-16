define ['angular', 'xtk', 'file', 'slider'], (ng) ->
  image = ng.module 'qiprofile.image', ['qiprofile.file']

  image.factory 'Image', ['$rootScope', '$q', 'File', ($rootScope, $q, File) ->
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

      # Temporary hard-coded filepaths to the label map and color table.
      labelmapFilename = 'data/QIN_Test/k_trans_map.nii.gz'
      colortableFilename = 'data/QIN_Test/generic-colors.txt'

      parent: parent
      filename: filename
      labelmapFilename: labelmapFilename
      colortableFilename: colortableFilename
      timePoint: timePoint

      # The image state loading flag is true if the files are being
      # loaded, false otherwise.
      state:
        loading: false
        loaded: false

      # The image, label map, and color table file content.
      data: null
      labelmapData: null
      colortableData: null

      # Transfers the file content to the data properties.
      # The image state loading flag is set to true while the
      # files are being read.
      #
      # @returns a promise which resolves when the file reads
      #   are completed
      load: ->
        # Set the loading flag.
        @state.loading = true

        # Read each file into an ArrayBuffer. The Coffeescript fat
        # arrow (=>) binds the this variable to the image object
        # rather than the $http request.
        scanFile = File.read(filename, responseType: 'arraybuffer').then (data) =>
          # Set the data property to the scan file content.
          @data = data
        labelmapFile = File.read(labelmapFilename, responseType: 'arraybuffer').then (labelmapData) =>
          # Set the data property to the label map file content.
          @labelmapData = labelmapData
        colortableFile = File.read(colortableFilename, responseType: 'arraybuffer').then (colortableData) =>
          # Set the data property to the color table file content.
          @colortableData = colortableData
        # Combine the multiple promises into a single promise.
        allImagesLoaded = $q.all(scanFile, labelmapFile, colortableFile)
        allImagesLoaded.then =>
          # Unset the loading flag.
          @state.loading = false
          @state.loaded = true
          # Set a flag indicating that all file reads are complete.
          @allImagesLoaded = true
      
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
        # The volume and label map to render.
        volume = new X.volume()
        volume.file = @filename
        volume.filedata = @data
        volume.labelmap.file = @labelmapFilename
        volume.labelmap.filedata = @labelmapData
        volume.labelmap.colortable.file = @colortableFilename
        volume.labelmap.colortable.filedata = @colortableData
        renderer.add(volume)

        # The rendering callback. This function is called after the
        # volume is initialized and prior to the first rendering.
        renderer.onShowtime = ->
          # The volume display controls. The element is manually
          # placed later in this function.
          #gui = new dat.GUI(autoplace: false)
          # The controls interact with the volume.
          #volumeCtls = gui.addFolder('Volume')
          # The opacity control.
          #opacityCtl = volumeCtls.add(volume, 'opacity', 0, 1).listen()
          # The threshold min and max range controls.
          #minCtl = volumeCtls.add(volume, 'lowerThreshold', volume.min, volume.max)
          #maxCtl = volumeCtls.add(volume, 'upperThreshold', volume.min, volume.max)
          # The slice dimension controls.
          #sliceXCtl = volumeCtls.add(volume, 'indexX', 0, volume.range[0] - 1)
          #sliceYCtl = volumeCtls.add(volume, 'indexY', 0, volume.range[1] - 1)
          #sliceZCtl = volumeCtls.add(volume, 'indexZ', 0, volume.range[2] - 1)
          # The control is placed after the image display.
          #ctlElt = ng.element(gui.domElement)
          #element.after(ctlElt)
          # Display the controls.
          #volumeCtls.open()

          # Display the label map (overlay) controls.
          labelmapGui = gui.addFolder('Label Map');
          labelmapVisibleCtl = labelmapGui.add(volume.labelmap, 'visible', volume.labelmap.visible = false)
          labelmapOpacityCtl = labelmapGui.add(volume.labelmap, 'opacity', 0, 1)
          labelmapGui.open()

        # Adjust the camera position.
        renderer.camera.position = [120, 20, 20]

        # Render the image.
        renderer.render()

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
