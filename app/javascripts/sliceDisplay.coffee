define ['angular', 'lodash', 'cornerstone'], (ng, _, cornerstone) ->
  sliceDisplay = ng.module('qiprofile.slicedisplay', [])

  sliceDisplay.factory 'SliceDisplay', ->
    # The Cornerstone loader scheme.
    LOADER_SCHEME = 'qiprofile'
    # The image inversion color LUT flips the colors.
    # TODO - comment these settings.
    INVERSION_LUT =
      id: '1'
      firstValueMapped: 0
      numBitsPerEntry: 8
      # TODO - get the limit value from wherever it is defined.
      lut: _.range(255, 0, -1)

    # The integer data type pattern matcher.
    INT_DATATYPE_REGEX = /^u?int(\d\d?)$/

    # Enable the Cornerstone viewports.
    #
    # TODO - this should be done in a directive link which has the
    #   element already. A service should not dip into the view by
    #   searching the page. Similarly, the display functions below
    #   should be part of the directive link.
    #
    imageElt = document.getElementById('qi-slice-image')
    cornerstone.enable(imageElt)
    # TODO - see slice-display overlay TODO.
    # overlayElt = document.getElementById('qi-slice-overlay')
    # cornerstone.enable(overlayElt)

    ###*
     * @method imageIdFor
     * @return a unique id for the given image
    ###
    imageIdFor = (timeSeries, volumeIndex, sliceIndex) ->
      # Append the volume and slice numbers to the time series image path.
      "#{ LOADER_SCHEME }:#{ timeSeries.image.path }/#{ volumeIndex + 1 }/#{ sliceIndex + 1 }"

    ###*
     * @method overlayIdFor
     * @return a unique id for the given overlay slice
    ###
    overlayIdFor = (overlay, sliceIndex) ->
      # Append the slice number to the overlay title.
      "#{ LOADER_SCHEME }:#{ overlay.parameterResult.title }/#{ sliceIndex + 1 }"

    # Selects the [x, y] view of the time series [time, x, y, z] ndarray.
    imageData = (timeSeries, volumeIndex, sliceIndex) ->
      # The unique slice image id.
      imageId = imageIdFor(timeSeries, sliceIndex, volumeIndex)
      # The image header.
      header = timeSeries.image.contents.header
      # The slice image data subarray.
      data = timeSeries.image.contents.data.pick(sliceIndex, null, null, volumeIndex)
      # Return the data adapted for Cornerstone.
      adaptImage(imageId, sliceIndex, header, data)

    overlayData = (overlay, sliceIndex) ->
      # The unique slice overlay id.
      imageId = overlayIdFor(overlay, sliceIndex)
      # The image header.
      header = overlay.contents.header
      # The slice overlay data subarray.
      # TODO - is the argument order correct? Should slice be first?
      #   Check this before any overlay functionality is committed.
      data = overlay.contents.data.pick(null, null, sliceIndex)
      # Return the data adapted for Cornerstone.
      adaptImage(imageId, sliceIndex, header, data)

    ###*
     * @method displayImage
     * @param data the binary image data
    ###
    displayImage = (data) ->
      cornerstone.displayImage(imageElt, data)

    ###*
     * @method displayOverlay
     * @param data the binary overlay data
    ###
    displayOverlay = (data) ->
      # The viewport option applies the LUT.
      opts = modalityLUT: INVERSION_LUT
      cornerstone.displayImage(overlayElt, data, opts)

    ###*
     * Converts the given 2D ndarray to a 1D array.
     *
     * @method flatten
     * @param data the 2D ndarray
     * @param datumSize the intensity value size in bytes
     * @return the {data, min, max} object containing
     *   the flattened 1D data array and the minimum
     *   and maximum values
    ###
    flatten = (data, datumSize) ->
      colCnt = data.shape[0]
      rowCnt = data.shape[1]
      length = colCnt * rowCnt
      # Determine the min and max during the iteration.
      minValue = Math.pow(2, 15) - 1
      maxValue = -minValue
      # The 1D array content.
      buffer = new ArrayBuffer(length * datumSize)

      # Flatten the ndarray.
      shape = [data.shape.reduce(_.multiply)]
      stride = data.stride[..0]
      flat = ndarray(data.data, shape=shape, stride=stride, offset=data.offset)
      # Alias the size property as length.
      Object.defineProperties flat,
        length:
          get: -> @size
      # Add a map function.
      flat.map = (fn) ->
        (fn(@get(i), i, this) for i in [0...@length])

      # TODO - calculate the min/max in pipeline.
      for i in [0...flat.length]
        minValue = Math.min(minValue, flat.get(i))
        maxValue = Math.max(maxValue, flat.get(i))

      # Return the {data, min, max} object
      data: flat
      min: minValue
      max: maxValue

    ###*
     * @method adaptImage
     * @param imageId the caching id
     * @param sliceIndex the zero-based slice index
     * @param header the parsed {nifti, dicom} object
     * @param data the NIfTI image byte array
     * @return the Cornerstone image object
    ###
    adaptImage = (imageId, sliceIndex, header, data) ->
      # The datum size in bytes.
      match = INT_DATATYPE_REGEX.exec(header.nifti.datatype)
      if match?
        datumSize = parseInt(match[1])
      else if header.nifti.datatype is 'float'
        datumSize = 4
      else if header.nifti.datatype is 'double'
        datumSize = 8
      else
        throw new Error("The NIfTI datatype is not recognized:" +
                        " #{ header.nifti.datatype }")
      # The 1D intensity array.
      flat = flatten(data, datumSize)
      if not header.dicom?
        throw new Error("The NIfTI file is missing the embedded" +
                        " DICOM meta-data extension")
      if not header.dicom.WindowCenter?
        throw new Error("The image is missing an embedded DICOM meta-data" +
                        " WindowCenter tag")
      windowCenter = header.dicom.WindowCenter[sliceIndex]
      if not header.dicom.WindowWidth?
        throw new Error("The image is missing an embedded DICOM meta-data" +
                        " WindowWidth tag")
      windowWidth = header.dicom.WindowWidth[sliceIndex]

      slope = header.nifti.scl_slope
      intercept = header.nifti.scl_inter

      # The columns and rows are the NIfTI shape first and
      # second items, resp.
      colCnt = data.shape[0]
      rowCnt = data.shape[1]

      # The column/row pixel spacing is the NRRD spacings
      # second and third items, resp.
      spacing =
        column: header.nrrd.spacings[1]
        row: header.nrrd.spacings[2]
      # The number of bytes in the image data.
      byteCnt = colCnt * rowCnt * datumSize

      imageId: imageId
      minPixelValue : flat.min
      maxPixelValue : flat.max
      slope: slope
      intercept: intercept
      windowCenter : windowCenter
      windowWidth : windowWidth
      render: cornerstone.renderGrayscaleImage
      getPixelData: -> flat.data
      columns: colCnt
      rows: rowCnt
      width: colCnt
      height: rowCnt
      color: false
      columnPixelSpacing: spacing.column
      rowPixelSpacing: spacing.row
      sizeInBytes: byteCnt

    ###*
     * @method parseImageId
     * @param imageId the image id built by the imageIdFor function
     * @return the image hierarchy array
    ###
    parseImageId = (imageId) ->
      path = imageId.split('/')
      [project, subject, session, scan] = path[...4]
      rest = path[4..]

    # The Cornerstone image loader callback function.
    loadImage = (imageId) ->
      parseImageId(imageId)

    cornerstone.registerImageLoader(LOADER_SCHEME, loadImage)

    ###*
     * Displays the slice image and overlay. The input *data* argument
     * is a {image, overlay} object, where:
     * * *image* is the required 4D time series image [x, y, z, t]
     *   intensity array
     * * *overlay* is the optional 3D [x, y, z] overlay array
     *
     * The overlay can be a binary mask, e.g. ROI, or a scalar modeling
     * result, e.g. Ktrans.
     *
     * @method display
     * @param timeSeries the 4D TimeSeries object to display
     * @param volume the one-based volume number
     * @param slice the one-based slice number
    ###
    display: (timeSeries, volume, slice) ->
      displayLoaded = ->
        # Display the image.
        imgData = imageData(timeSeries, volume - 1, slice - 1)
        displayImage(imgData)

        # If there is an overlay, then display it on top of the image.
        if timeSeries.overlay?
          ovlData = overlayData(timeSeries.overlay, slice - 1)
          displayOverlay(ovlData)

      # Load the image, if necessary.
      # TODO - cache the image in Cornerstone. Register a loader which
      #   calls imageData by parsing the image id.
      if not timeSeries.image.isLoaded()
        timeSeries.image.load().then(displayLoaded)
      else
        displayLoaded()
