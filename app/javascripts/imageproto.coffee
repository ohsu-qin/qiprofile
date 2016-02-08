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

    updateTheImage: (imageId) ->
      # Update the DICOM image viewport.
      #
      # TO DO - "Angularize" the getElementById.
      dicomImage = cornerstone.enable(document.getElementById('qi-dicom-image'))
      cornerstone.loadAndCacheImage(imageId).then (image) ->
        cornerstone.displayImage dicomImage, image

    updateTheOverlay: (imageId) ->
      # Update the overlay image viewport.
      overlay = cornerstone.enable(document.getElementById('qi-overlay'))
      cornerstone.loadAndCacheImage(imageId).then (image) ->
        cornerstone.displayImage overlay, image
      # Apply the LUT.
      viewport = cornerstone.getViewport(overlay)
      viewport.modalityLUT = modalityLUT
      cornerstone.setViewport overlay, viewport
