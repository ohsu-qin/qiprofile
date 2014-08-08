define ['angular', 'file', 'xtk'], (ng) ->
  image = ng.module 'qiprofile.image', ['qiprofile.file']

  image.factory 'Image', ['$rootScope', 'File', ($rootScope, File) ->
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
    # @param timePoint the series time point
    # @returns a new image object
    create = (parent, filename, timePoint) ->
      parent: parent
      filename: filename
      timePoint: timePoint

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
      # @returns a promise which resolves when the image file
      #   read is completed
      load: () ->
        # Set the loading flag.
        @state.loading = true
        # Read the file into an ArrayBuffer. The Coffeescript fat
        # arrow (=>) binds the this variable to the image object
        # rather than the $http request.
        File.read(filename).then (data) =>
          # Unset the loading flag.
          @state.loading = false
          # Set the data property to the file content.
          @data = data

      # Builds an XTK renderer for this image.
      createRenderer: ->
        # The XTK renderer.
        renderer = new X.renderer3D()
        renderer.init()

        # The volume to render.
        volume = new X.volume()
        # XTK seems to expect a .gz filename to have compressed
        # data. However, Express and most servers uncompress
        # content on the fly. Therefore, fool XTK into accepting
        # the file content by stripping the .gz extension.
        # TODO - is there a better approach?
        if @filename[-3..] == '.gz'
          volume.file = @filename[0..-3]
        else
          volume.file = @filename
        # FIXME - XTK throws the following:
        #   Uncaught RangeError: byte length of Uint16Array should be a multiple of 2 
        # This occurs whether or not the filedata property is set
        # below.
        # TODO - Why does it fail even when filedata is not set?
        # TODO - Walk through the XTK io code again to emulate their
        # approach.
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
