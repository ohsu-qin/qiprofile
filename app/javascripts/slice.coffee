define ['angular', 'lodash', 'cornerstone', 'exampleImageIdLoader', 'slider'],
       (ng, _, cornerstone) ->
  slice = ng.module 'qiprofile.slice', ['vr.directives.slider']

  slice.factory 'Slice', ->
    # The image inversion color LUT flips the colors.
  	INVERSION_LUT =
      id: '1'
      firstValueMapped: 0
      numBitsPerEntry: 8
      # TODO - get the limit value from wherever it is defined.
      lut: _.range(255, 0, -1)

    # Enable the Cornerstone viewports.
    sliceViewport = cornerstone.enable(document.getElementById('qi-slice'))
    overlayViewport = cornerstone.enable(document.getElementById('qi-overlay'))

    # Loads and displays an image in a viewport. The binary data served
    # up by ImageSequence.load() are referenced by the imageId.
    #
    # @param imageId the image ID
    # @param viewport the enabled viewport element
    loadAndDisplayImage = (imageId, viewport) ->
      cornerstone.loadAndCacheImage(imageId).then (data) ->
        cornerstone.displayImage(viewport, data)

    # Updates the slice image.
    #
    # @param imageId the image ID
    updateSlice: (imageId) ->
      loadAndDisplayImage(imageId, sliceViewport)

    # Updates the overlay image.
    #
    # @param overlayIds the overlay IDs
    # @param overlayIndex the overlay index value
    updateOverlay: (overlayIds, overlayIndex) ->
      # Parse and disaggregate the composite index.
      # Note: See the explanation in the Slice controller.
      index = overlayIndex.split('.').map(Number)[1]
      loadAndDisplayImage(overlayIds[index], overlayViewport)
      # Apply the LUT.
      viewport = cornerstone.getViewport(overlayViewport)
      viewport.modalityLUT = INVERSION_LUT
      cornerstone.setViewport(overlay, viewport)
