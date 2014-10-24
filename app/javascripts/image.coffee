define ['angular', 'xtk', 'file', 'dat', 'slider', 'touch'], (ng) ->
  image = ng.module 'qiprofile.image', ['qiprofile.file', 'vr.directives.slider']

  image.factory 'Image', ['$rootScope', '$q', 'File', ($rootScope, $q, File) ->

    # The overlay and color table specification.
    # TODO - Replace hardcoded temp filepaths with proper references.
    overlays =
      # Note that some label map and color LUT must be specified for
      # the initial load even though by default no label map is shown.
      none:
        labelmap:
          accessor: (parent) -> 'data/QIN_Test/delta_k_trans_map.nii.gz'
          # Replace with accessor: (parent) -> parent.....filename
        colortable:
          accessor: (parent) -> 'data/QIN_Test/generic-colors.txt'
          # Replace with accessor: (parent) -> parent.....colorization.filename
      deltaKTrans:
        labelmap:
          accessor: (parent) -> 'data/QIN_Test/delta_k_trans_map.nii.gz'
        colortable:
          accessor: (parent) -> 'data/QIN_Test/generic-colors.txt'
      fxlKTrans:
        labelmap:
          accessor: (parent) -> 'data/QIN_Test/fxl_k_trans_map.nii.gz'
        colortable:
          accessor: (parent) -> 'data/QIN_Test/generic-colors.txt'
      fxrKTrans:
        labelmap:
          accessor: (parent) -> 'data/QIN_Test/fxr_k_trans_map.nii.gz'
        colortable:
          accessor: (parent) -> 'data/QIN_Test/generic-colors.txt'
      v_e:
        labelmap:
          accessor: (parent) -> 'data/QIN_Test/v_e_map.nii.gz'
        colortable:
          accessor: (parent) -> 'data/QIN_Test/generic-colors.txt'
      tau_i:
        labelmap:
          accessor: (parent) -> 'data/QIN_Test/tau_i_map.nii.gz'
        colortable:
          accessor: (parent) -> 'data/QIN_Test/generic-colors.txt'

    # Old specification used by the dat gui control.
    #overlays:
    #  [
    #    {
    #      label: 'None'
    #      labelmap:
    #        accessor: (parent) -> 'data/QIN_Test/delta_k_trans_map.nii.gz'
    #      colortable:
    #        accessor: (parent) -> 'data/QIN_Test/generic-colors.txt'
    #    }
    #    {
    #      label: 'delta Ktrans'
    #      labelmap:
    #        accessor: (parent) -> 'data/QIN_Test/delta_k_trans_map.nii.gz'
    #      colortable:
    #        accessor: (parent) -> 'data/QIN_Test/generic-colors.txt'
    #    }
    #    {
    #      label: 'FXR Ktrans'
    #      labelmap:
    #        accessor: (parent) -> 'data/QIN_Test/fxl_k_trans_map.nii.gz'
    #      colortable:
    #        accessor: (parent) -> 'data/QIN_Test/generic-colors.txt'
    #    }
    #    {
    #      label: 'FXL Ktrans'
    #      labelmap:
    #        accessor: (parent) -> 'data/QIN_Test/fxr_k_trans_map.nii.gz'
    #      colortable:
    #        accessor: (parent) -> 'data/QIN_Test/generic-colors.txt'
    #    }
    #    {
    #      label: 'v_e'
    #      labelmap:
    #        accessor: (parent) -> 'data/QIN_Test/v_e_map.nii.gz'
    #      colortable:
    #        accessor: (parent) -> 'data/QIN_Test/generic-colors.txt'
    #    }
    #    {
    #      label: 'tau_i'
    #      labelmap:
    #        accessor: (parent) -> 'data/QIN_Test/tau_i_map.nii.gz'
    #      colortable:
    #        accessor: (parent) -> 'data/QIN_Test/generic-colors.txt'
    #    }
    #  ]

    # The available label map types. Used by the dat gui control.
    #overlayTypes = []
    #overlayTypes.push overlay.label for overlay in overlays

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

      # Set the default label map and color LUT.
      type = 'none'
      labelmapFilename = overlays[type].labelmap.accessor(parent)
      colortableFilename = overlays[type].colortable.accessor(parent)

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
        # TODO - Change volume to @volume.
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

        # We need this loader as a container to keep track of the current overlay.
        #_loader = Type: "None"
        # Display no label map by default.
        volume.labelmap.visible = false

        # The rendering callback. This function is called after the
        # volume is initialized and prior to the first rendering.
        renderer.onShowtime = ->
          # The volume display controls. The element is manually
          # placed later in this function.
          #gui = new dat.GUI(autoplace: false)
          # The controls interact with the volume.
          #volumeCtls = gui.addFolder('Volume')
          # The opacity control.
          #opacityCtl = volumeCtls.add(volume, 'opacity', 0, 1).name('Opacity')
          # The threshold min and max range controls.
          #minCtl = volumeCtls.add(volume, 'lowerThreshold', volume.min, volume.max).name('Min Threshold')
          #maxCtl = volumeCtls.add(volume, 'upperThreshold', volume.min, volume.max).name('Max Threshold')
          # The slice dimension controls.
          #sliceXCtl = volumeCtls.add(volume, 'indexX', 0, volume.range[0] - 1).name('Sagittal')
          #sliceYCtl = volumeCtls.add(volume, 'indexY', 0, volume.range[1] - 1).name('Coronal')
          #sliceZCtl = volumeCtls.add(volume, 'indexZ', 0, volume.range[2] - 1).name('Axial')
          # The control is placed after the image display.
          #ctlElt = ng.element(gui.domElement)
          #element.after(ctlElt)
          # Display the controls.
          #volumeCtls.open()

          # Display the label map (overlay) controls.
          #labelmapCtls = gui.addFolder('Overlay')
          #labelmapTypeCtl = labelmapCtls.add(_loader, 'Type', overlayTypes).name('Type')
          #labelmapOpacityCtl = labelmapCtls.add(volume.labelmap, 'opacity', 0, 1).name('Opacity')
          #labelmapCtls.open()

          # Label map selection callback.
          #labelmapTypeCtl.onChange (value) ->
          #  selectOverlay(value, volume)
          #  # Destroy the old control...
          #  # ...it will be re-created.
          #  ctlElt.remove()

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

        # Overlay selection change callback function.
    selectOverlay: (type, volume) ->
      # TODO - Change volume to @volume.
      # Get the selected index value of the dat verlay menu.
      #_index = overlayTypes.indexOf(value)
      # If 'nonw' is selected, turn the label map off...
      if type == 'none'
        volume.labelmap.visible = false
      # ...and if an overlay option is selected, load the new label map
      # and color table.
      else
        # Read each file into an ArrayBuffer. The Coffeescript fat
        # arrow (=>) binds the this variable to the image object
        # rather than the $http request.
        newLabelmapFilename = overlays[type].labelmap.accessor(parent)
        @newLabelmapFilename = newLabelmapFilename
        newColortableFilename = overlays[type].colortable.accessor(parent)
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
          # Modify the volume with the newly selected overlay files.
          # This triggers a re-load of the volume with the new overlay.
          volume.labelmap.file = @newLabelmapFilename
          volume.labelmap.filedata = @newLabelmapData
          volume.labelmap.colortable.file = @newColortableFilename
          volume.labelmap.colortable.filedata = @newColortableData
          volume.labelmap.visible = true
  ]
