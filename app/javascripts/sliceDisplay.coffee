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
    
    # @returns a unique id for the given image
    imageIdFor = (timeSeries, volumeIndex, sliceIndex) ->
      # Append the volume and slice numbers to the time series image path.
      "#{ LOADER_SCHEME }:#{ timeSeries.image.path }/#{ volumeIndex + 1 }/#{ sliceIndex + 1 }"
    
    # @returns a unique id for the given overlay slice
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

    # @param data the binary image data
    displayImage = (data) ->
      cornerstone.displayImage(imageElt, data)

    # @param data the binary overlay data
    displayOverlay = (data) ->
      # The viewport option applies the LUT.
      opts = modalityLUT: INVERSION_LUT
      cornerstone.displayImage(overlayElt, data, opts)

    # Converts the given 2D ndarray to a 1D array.
    #
    # @param data the 2D ndarray
    # @param datumSize the intensity value size in bytes
    # @returns the {data, min, max} object containing
    #   the flattened 1D data array and the minimum
    #   and maximum values
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
    
    # @param imageId the caching id
    # @param sliceIndex the zero-based slice index
    # @param header the parsed {nifti, dicom} object
    # @param data the NIfTI image byte array
    # @returns the Cornerstone image object
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
    
    # @param imageId the image id built by the imageIdFor function
    # @returns the image hierarchy array
    parseImageId = (imageId) ->
      path = imageId.split('/')
      [project, subject, session, scan] = path[...4]
      rest = path[4..]
    
    # The Cornerstone image loader callback function.
    loadImage = (imageId) ->
      parseImageId(imageId)
    
    cornerstone.registerImageLoader(LOADER_SCHEME, loadImage)

    # Displays the slice image and overlay. The input *data* argument
    # is a {image, overlay} object, where:
    # * *image* is the required 4D time series image [x, y, z, t]
    #   intensity array
    # * *overlay* is the optional 3D [x, y, z] overlay array
    #
    # The overlay can be a binary mask, e.g. ROI, or a scalar modeling
    # result, e.g. Ktrans.
    #define ['angular', 'stacktrace'], (ng, stacktrace) ->
  # Print the full error message in an alert box. This is a work-around
  # for Chrome bug 331971
  # (cf. https://code.google.com/p/chromium/issues/detail?id=331971)
  # which truncates long error messages. This code is copied from
  # http://stackoverflow.com/a/22218280/674326.
  #
  # TODO - The handler breaks with error:
  #     sourceMappingURL not found
  #   Uncomment, induce an error and fix. See following TODO and FIXME items.
  #
  # window.onerror = (errorMsg, url, lineNumber, columnNumber, errorObject) ->
  #   # Check the errorObject as IE and FF don't pass it through (yet).
  #   if errorObject?
  #     errMsg = errorObject.message
  #   else
  #     errMsg = errorMsg
  #   alert('Error: ' + errMsg)
  #
  # # The error handler module.
  # #
  # # Note: testing this module is prohibitively difficult. Suggestions for
  # # disabling the Mocha error trap don't work. ngMockE2E could be used to
  # # build a pseudo-app and HTML test harness, but that is not worth the
  # # trouble. The work-around to test this module is to introduce an error
  # # in the qiprofile code and check that it is logged on the server.
  # error = ng.module 'qiprofile.error', []
  #
  # # Augment the Angular exception handler to print an error on both
  # # the console (the default behavior) and the server.
  # error.factory '$exceptionHandler', ['$log', '$window', ($log, $window) ->
  #   (exception, cause) ->
  #     # Print the error on the console.
  #     $log.error.apply($log, arguments)
  #     # Send the error to the server.
  #     # TODO - given the FIXMEs below, revisit this module, look for good
  #     #   usage examples and either fix or kill it.
  #     try
  #       message = "#{ exception }"
  #       # FIXME - stacktrace.fromError returns an empty string in
  #       #   E2E Session Detail testing when the download.isDisplayed
  #       #   function is not found, with the following message:
  #       #     Client error: TypeError: download.isDisplayed is not a function.
  #       #   Don't know if that is always the case.
  #       # TODO - Induce an error by replacing download.isDisplayed with
  #       #   download.fooBar and isolate the problem.
  #       #
  #       # FIXME - after the AngularJS 1.4.9 upgrade, an error fetching
  #       #   a REST object results in a JSON parser error which in turn
  #       #   causes a secondary stackTrace.fromError error with the following
  #       #   message:
  #       #      TypeError('Given line number must be a positive integer')
  #       #   deep in the obscure stackTrace code. Work-around is to pass
  #       #   over the stack trace and handle the failed failure handler
  #       #   gracefully.
  #       try
  #         stackTrace = stacktrace.fromError(exception)
  #       catch TypeError
  #         stackTrace = null
  #       # The object to send.
  #       payload =
  #         url: $window.location.href
  #         name: exception.name
  #         message: message
  #         stackTrace: stackTrace
  #         cause: cause or ''
  #       # Send the object to the server.
  #       # Note: can't use the File service, since File depends on
  #       # $exceptionHandler.
  #       xhr = new window.XMLHttpRequest()
  #       xhr.open('POST', '/error', true)
  #       xhr.setRequestHeader('Content-type', 'application/json')
  #       # The XHR request is retransmitted several times.
  #       # Consequently, the error is logged multiple times on the server.
  #       # Prevent this by throttling the send back to once per second
  #       # (which usually means only once).
  #       #
  #       # FIXME - the lodash throttle below has no effect. Why not?
  #       #   send = -> xhr.send(ng.toJson(payload))
  #       #   throttled = _.throttle(send, 1000)
  #       #   throttled()
  #       # TODO - fix above to replace below and remove the guard in the
  #       #   server.coffee /error handler.
  #       xhr.send(ng.toJson(payload))
  #     catch loggingError
  #       # Can't send the error to the server;
  #       # Log to the client only.
  #       $log.warn 'Error logging failed'
  #       $log.log loggingError
  # ]

    # @param timeSeries the 4D TimeSeries object to display
    # @param volume the one-based volume number
    # @param slice the one-based slice number
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
