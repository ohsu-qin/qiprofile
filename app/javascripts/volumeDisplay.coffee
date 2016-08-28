# TODO - capture this file on a xtk branch and delete it from
#   the mainline.

# TODO - if XTK is resurrected, then uncomment this.
# define ['angular', 'file', 'slider', 'xtk'], (ng) ->
#   volumeDisplay = ng.module 'qiprofile.volumedisplay', ['qiprofile.file', 'vr.directives.slider']
#
#   volumedisplay.factory 'VolumeDisplay', ['$rootScope', '$q', 'File', ($rootScope, $q, File) ->
#     ### This class is broken after the AngularJS 1.4.9 update. ###
#     # TODO - revisit if XTK is resurrected.
#     #
#     # TODO - dynamically load XTK. See, e.g.,
#     # http://www.bennadel.com/blog/2554-loading-angularjs-components-with-requirejs-after-application-bootstrap.htm
#     # and
#     # http://stackoverflow.com/questions/18591966/inject-module-dynamically-only-if-required
#     #
#     # The Volume class encapsulates a volume with the following properties:
#     # * volume - the image scan or registration volume object
#     # * number - the one-based image volume number
#     # * state - one of 'unloaded', 'loading' or 'loaded'
#     # * volume - the XTK volume object
#     # * load() - read the image file
#     # * open(element) - render the image
#     # * isOverlayVisible() - whether there is an associated label map file
#     # * selectOverlay() - show the overlay
#     # * deselectOverlay() - hide the overlay
#     #
#     # This class is private within the VolumeDisplay service scope.
#     class VolumeDisplay
#       # Transfers the file content to the data properties.
#       # The image state loading flag is set to true while the
#       # files are being read.
#       #
#       # @return a promise which resolves to this image object
#       #   when the file is loaded
#       load: ->
#         super().then (data) ->
#           # The XTK image to render.extendImageSequence
#           @xtkVolume = new X.volume()
#           @xtkVolume.file = @location
#           @xtkVolume.filedata = data
#           data
#
#       # Renders the image in the given parent element.
#       #
#       # @param element the Angular jqLite element
#       open: (element) ->
#         # The XTK renderer for this volume.
#         renderer = new X.renderer3D()
#         # The image is rendered within the given element.
#         renderer.container = element[0]
#         # Build the renderer.
#         renderer.init()
#         renderer.add(@xtkVolume)
#
#         # Set the volume threshold levels to defaults.
#         # These must be set here for the slider controls to load with the
#         # correct values.
#         @xtkVolume.lowerThreshold = 0
#         @xtkVolume.upperThreshold = 445
#
#         # Adjust the camera position.
#         renderer.camera.position = [0, 0, 240]
#
#         # Render the volume.
#         renderer.render()
#
#       # Returns whether the XTK volume has a visible label map. This
#       # function is required to work around the XTK bug described in
#       # image-controls.jade.
#       isOverlayVisible: ->
#         @xtkVolume._labelmap? and @xtkVolume._labelmap._children? and
#         @xtkVolume._labelmap._children.length and @xtkVolume._labelmap.visible
#
#       # Deselects an existing overlay as follows:
#       # * If the image volume has a label map, then the label map visible
#       #  flag is set to false.
#       # Otherwise, this function is a no-op.
#       #
#       # @param image the selected PK modeling parameter name, or 'none' to
#       #  remove an existing overlay
#       deselectOverlay: ->
#         @xtkVolume.labelmap.visible = false if @isOverlayVisible()
#
#       # Changes the overlay label map and color lookup table as follows:
#       # * Fetch the overlay files.
#       # * Set the volume label map properties.
#       # * Display the overlay.
#       #
#       # @param labelMap the selected label map {name, colorTable}
#       #   object
#       selectOverlay: (labelMap) ->
#         # Note: XTK labelmaps are treacherous territory; proceed with caution.
#         # Specifically, XTK places the renderer in the browser event loop, so
#         # that XTK renders and rerenders continuously and asynchronously.
#         # Hopefully, the XTK render function checks for a state change and
#         # only schedules a browser paint if necessary. Whether this state
#         # change check is performed is unknown.
#         #
#         # Furthermore, XTK implicitly expects that its volume is complete and
#         # consistent when it is rendered. For a labelmap, XTK checks the XTK
#         # volume._labelmap. If it exists and the labelmap visible flag is set,
#         # then XTK expects the labelmap data to be fully loaded and renders
#         # the labelmap.
#         #
#         # However, simply checking the existing XTK volume.labelmap
#         # property automatically creates the XTK volume._labelmap object.
#         # Furthermore, the newly created empty XTK volume._labelmap.visible
#         # flag is set to true by default. Thus, a naive implementation that
#         # checks for an existing labelmap and then asynchronously loads the
#         # labelmap file results in the following XTK render error:
#         #
#         #   Uncaught TypeError: Cannot read property '_id' of null
#         #
#         # The work-around is as follows:
#         # * If checking for an existing labelmap, bypass accessing the
#         #   XTK volume.labelmap property and check the XTK volume._labelmap
#         #   variable instead.
#         # * If an overlay is selected which differs from the existing overlay,
#         #   then set the XTK volume.labelmap.visible property to false before
#         #   anything else. Although referencing the XTK volume.labelmap property
#         #   creates the XTK volume._labelmap object with incomplete and
#         #   inconsistent content, the visible flag set to false prevents XTK
#         #   from attempting to render the incomplete labelmap.
#         # * Set the XTK volume.labelmap content as appropriate, e.g. the file
#         #   and colortable.file.
#         # * Load the label map and color table asynchronously.
#         # * When both are loaded, then finally set the XTK volume.labelmap.visible
#         #   property to true. Setting visible to true triggers a repaint with the
#         #   overlay.
#
#         # The XTK volume labelmap file, or null if there is no labelmap.
#         xtkLabelMapFile = @xtkVolume._labelmap.file if @xtkVolume._labelmap?
#         # If the label map was not changed from the last value, then we only
#         # need to set the visible flag.
#         if xtkLabelMapFile is labelMap.name
#           @xtkVolume.labelmap.visible = true
#           return
#
#         # The label map must have a color table.
#         if not labelMap.colorTable?
#           throw new Error("The label map is missing a color table:" +
#                                " #{ labelMap.name } ")
#
#         # Set the XTK volume labelmap visible flag to false.
#         # See the function Note comment above.
#         @xtkVolume.labelmap.visible = false
#         # Set the volume label map file name property.
#         @xtkVolume.labelmap.file = labelMap.name
#         # Set the volume color table file name property.
#         @xtkVolume.labelmap.colortable.file = labelMap.colorTable
#
#         # Retrieve the overlay layer map and color table.
#         loadLabelMap = File.readBinary(labelMap.name).then (data) ->
#           # Set the volume label map data property.
#           @xtkVolume.labelmap.filedata = data
#         loadColorTable = File.readBinary(labelMap.colorTable).then (data) ->
#           # Set the volume color table data property.
#           @xtkVolume.labelmap.colortable.filedata = data
#
#         # Join the two promises into a single promise.
#         loaded = $q.all(loadLabelMap, loadColorTable)
#         loaded.then ->
#           # Turn on the label map. This triggers a redisplay of the volume
#           # with the new overlay.
#           @xtkVolume.labelmap.visible = true
#
#     # @param volume the scan or registration image volume
#     #   (not the XTK volume)
#     extend: (volume) ->
#       throw new Error("Not yet implemented")
#   ]
