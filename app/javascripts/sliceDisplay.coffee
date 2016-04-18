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

      imageData = (data, volumeIndex, sliceIndex) ->
        data[volumeIndex][sliceIndex]

      overlayData = (data, sliceIndex) ->
        data[sliceIndex]

      # @param data the binary image data
      displayImage = (data) ->
        cornerstone.displayImage(imageElt, data)

      # @param data the binary overlay data
      displayOverlay = (data) ->
        # The viewport option applies the LUT.
        opts = modalityLUT: INVERSION_LUT
        cornerstone.displayImage(overlayElt, data, opts)

      # Displays the slice image and overlay. The input *data* argument
      # is a {image, overlay} object, where:
      # * *image* is the required 4D time series image
      #   [volume, slice, x, y] intensity array
      # * *overlay* is the optional 3D [slice, x, y] overlay array
      #
      # Note: the array dimension order differs from the conventional
      # NIfTI ndarray order in the last three dimensions, which is
      # [x, y, slice] rather than [slice, x, y]. The caller is
      # responsible for transposing the array, e.g. using
      # ndarray.transpose(0, 3, 1, 2).
      #
      # The overlay can be a binary mask, e.g. ROI, or a scalar modeling
      # result, e.g. Ktrans.
      #
      # @param data the {image, overlay} associative object
      # @param volume the one-based volume number
      # @param slice the one-based slice number
      display: (data, volume, slice) ->
        imgData = imageData(data.image, volume - 1, slice - 1)
        cornerstone.displayImage(imgData)
        if data.overlay?
          ovlData = overlayData(data.overlay, slice - 1)
          cornerstone.displayOverlay(ovlData)
)