define ['angular', 'xtk', 'file', 'slider', 'touch'], (ng) ->
  image = ng.module 'qiprofile.image', ['qiprofile.file', 'vr.directives.slider']

  image.factory 'Image', ['$rootScope', '$q', 'File', ($rootScope, $q, File) ->

    # The overlay and color table specification.
    # Note that some label map and color LUT must be specified for the initial
    # load even though by default no label map is shown. Otherwise the volume
    # will not load. For this reason, an overlay and LUT are specified for
    # the type "none".
    #
    # TODO - Replace hardcoded temp filepaths with proper references.
    #
    overlays =
      none:
        labelmap:
          accessor: () -> 'data/QIN_Test/delta_k_trans_map.nii.gz'
        colortable:
          accessor: () -> 'data/QIN_Test/generic-colors.txt'
      deltaKTrans:
        labelmap:
          accessor: () -> 'data/QIN_Test/delta_k_trans_map.nii.gz'
        colortable:
          accessor: () -> 'data/QIN_Test/generic-colors.txt'
      fxlKTrans:
        labelmap:
          accessor: () -> 'data/QIN_Test/fxl_k_trans_map.nii.gz'
        colortable:
          accessor: () -> 'data/QIN_Test/generic-colors.txt'
      fxrKTrans:
        labelmap:
          accessor: () -> 'data/QIN_Test/fxr_k_trans_map.nii.gz'
        colortable:
          accessor: () -> 'data/QIN_Test/generic-colors.txt'
      v_e:
        labelmap:
          accessor: () -> 'data/QIN_Test/v_e_map.nii.gz'
        colortable:
          accessor: () -> 'data/QIN_Test/generic-colors.txt'
      tau_i:
        labelmap:
          accessor: () -> 'data/QIN_Test/tau_i_map.nii.gz'
        colortable:
          accessor: () -> 'data/QIN_Test/generic-colors.txt'

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

      # Assign the default label map and color LUT to the filename
      # variables.
      type = 'none'
      labelmapFilename = overlays[type].labelmap.accessor()
      colortableFilename = overlays[type].colortable.accessor()

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
        @volume = new X.volume()
        @volume.file = @filename
        @volume.filedata = @data
        @volume.labelmap.file = @labelmapFilename
        @volume.labelmap.filedata = @labelmapData
        @volume.labelmap.colortable.file = @colortableFilename
        @volume.labelmap.colortable.filedata = @colortableData
        renderer.add(@volume)

        # Set the volume threshold levels to defaults.
        # These must be set here for the slider controls to load with the
        # correct values.
        @volume.lowerThreshold = 0
        @volume.upperThreshold = 445
        # Hide the label map by default.
        @volume.labelmap.visible = false

        # Adjust the camera position.
        renderer.camera.position = [0, 0, 240]

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

    # Changes the label map overlay and color lookup table. If the "No overlay"
    # button on the image detail page was clicked, the label map is set to be
    # not visible. If any of the buttons to view an overlay was clicked, the
    # image volume is modified with the appropriate label map and color LUT.
    # 
    # @param type the selected overlay type
    # @param volume the image volume
    # @returns the modified image object
    selectOverlay: (type, volume) ->
      # If type 'none' is selected, turn the label map off...
      if type == 'none'
        volume.labelmap.visible = false
      # ...and if an overlay type is selected, load the new label map
      # and color table.
      else
        # Read each file into an ArrayBuffer. The Coffeescript fat
        # arrow (=>) binds the this variable to the image object
        # rather than the $http request.
        newLabelmapFilename = overlays[type].labelmap.accessor()
        @newLabelmapFilename = newLabelmapFilename
        newColortableFilename = overlays[type].colortable.accessor()
        @newColortableFilename = newColortableFilename
        newLabelmapFile = File.read(newLabelmapFilename, responseType: 'arraybuffer').then (newLabelmapData) =>
          # Set the data property to the label map file content.
          @newLabelmapData = newLabelmapData
        newColortableFile = File.read(newColortableFilename, responseType: 'arraybuffer').then (newColortableData) =>
          # Set the data property to the color table file content.
          @newColortableData = newColortableData
        # Combine the promises into a single promise.
        allNewFilesLoaded = $q.all(newLabelmapFile, newColortableFile)
        allNewFilesLoaded.then =>
          # Modify the volume with the newly selected overlay files. Then turn
          # the label map on; this triggers a re-load of the volume with the
          # overlay.
          volume.labelmap.file = @newLabelmapFilename
          volume.labelmap.filedata = @newLabelmapData
          volume.labelmap.colortable.file = @newColortableFilename
          volume.labelmap.colortable.filedata = @newColortableData
          volume.labelmap.visible = true
  ]
