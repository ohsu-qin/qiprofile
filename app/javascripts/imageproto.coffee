define ['angular', 'cornerstone', 'exampleImageIdLoader', 'slider'], (ng) ->
  imageproto = ng.module 'qiprofile.imageproto', ['vr.directives.slider']

  imageproto.factory 'ImageProto', ->

    # Create an inversion LUT.
  	modalityLUT =
      id: '1'
      firstValueMapped: 0
      numBitsPerEntry: 8
      lut: []
    i = 0
    while i < 256
      modalityLUT.lut[i] = 255 - i
      i++

    # Enable the Cornerstone viewports.
    dicomImage = cornerstone.enable(document.getElementById('qi-dicom-image'))
    overlay = cornerstone.enable(document.getElementById('qi-overlay'))

    # Loads and displays an image in a viewport. The binary data contained in
    #   exampleImageIdLoader.js are referenced by the imageId.
    #
    # @param imageId the image ID
    # @param imageElem the enabled viewport
    loadAndDisplayImage = (imageId, imageElem) ->
      cornerstone.loadAndCacheImage(imageId).then (img) ->
        cornerstone.displayImage imageElem, img

    # Updates the DICOM image.
    #
    # @param imageId the image ID
    updateDicomImage: (imageId) ->
      loadAndDisplayImage(imageId, dicomImage)

    # Updates the overlay image.
    #
    # @param overlayIds the overlay IDs
    # @param ovrIndex the overlay index value
    updateOverlay: (overlayIds, ovrIndex) ->
      # Parse and disaggregate the composite index.
      #   Note: See the explanation in the Image Detail controller.
      index = ovrIndex.split('.').map(Number)[1]
      loadAndDisplayImage(overlayIds[index], overlay)
      # Apply the LUT.
      viewport = cornerstone.getViewport(overlay)
      viewport.modalityLUT = modalityLUT
      cornerstone.setViewport overlay, viewport
