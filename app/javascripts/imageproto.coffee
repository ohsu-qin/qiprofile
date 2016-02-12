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

    # Displays images in the DICOM image and/or overlay viewports.
    #
    # @param image the image and overlay ID object
    # @param updateDicom the update DICOM image flag (Boolean)
    # @param ovrIndex the overlay index
    updateViewports: (image, updateDicom, ovrIndex) ->
      # Loads the images with Cornerstone.
      #
      # @param imageId the image ID
      # @param imageElem the enabled viewport
      loadAndDisplayImage = (imageId, imageElem) ->
        cornerstone.loadAndCacheImage(imageId).then (img) ->
          cornerstone.displayImage imageElem, img

      # Update the DICOM image viewport if the flag set to true.
      if updateDicom
        # TO DO - "Angularize" the getElementById.
        dicomImage = cornerstone.enable(document.getElementById('qi-dicom-image'))
        loadAndDisplayImage(image.dicomImageId, dicomImage)

      # Update the overlay image viewport if there is one.
      if ovrIndex?
        overlay = cornerstone.enable(document.getElementById('qi-overlay'))
        loadAndDisplayImage(image.overlayIds[ovrIndex], overlay)
        # Apply the LUT.
        viewport = cornerstone.getViewport(overlay)
        viewport.modalityLUT = modalityLUT
        cornerstone.setViewport overlay, viewport
