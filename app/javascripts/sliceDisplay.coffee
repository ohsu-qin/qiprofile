define(
  ['angular', 'lodash', 'cornerstone', 'slider'],
  (ng, _, cornerstone) ->
    sliceDisplay = ng.module 'qiprofile.slicedisplay', ['vr.directives.slider']

    sliceDisplay.factory 'SliceDisplay', ->
      # The image inversion color LUT flips the colors.
      # TODO - comment these settings.
      INVERSION_LUT =
        id: '1'
        firstValueMapped: 0
        numBitsPerEntry: 8
        # TODO - get the limit value from wherever it is defined.
        lut: _.range(255, 0, -1)

      # Enable the Cornerstone viewports.
      imageElt = document.getElementById('qi-slice-image')
      cornerstone.enable(imageElt)
      overlayElt = document.getElementById('qi-slice-overlay')
      cornerstone.enable(overlayElt)

      # @param data the binary image data
      displayImage = (data) ->
        cornerstone.displayImage(imageElt, data)

      # @param data the binary overlay data
      displayOverlay = (data) ->
        # The viewport option applies the LUT.
        opts = modalityLUT: INVERSION_LUT
        cornerstone.displayImage(overlayElt, data, opts)

      # Displays the slice image and overlay.
      #
      # @param volume the one-based volume number
      # @param slice the one-based slice number
      # @param overlayIndex the zero-based overlay index
      display: (volume, slice, overlayIndex) ->
        imgData = imageData(volume - 1, slice - 1)
        cornerstone.displayImage(imgData)
        if overlayIndex?
          ovlData = overlayData(overlayIndex)
          cornerstone.displayOverlay(ovlData)
)