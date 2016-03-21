define ['angular', 'underscore.string', 'image', 'nifti'], (ng, _s) ->
  timeSeries = ng.module 'qiprofile.timeseries', ['qiprofile.image', 'qiprofile.nifti'] 

  timeSeries.factory 'TimeSeries', ['Image', 'Nifti', (Image, Nifti) ->
    # Adds the following properties to the given REST TimeSeries object:
    # * the parent imageSequence reference
    # * resource - the image store resource name
    # * the location virtual property
    # * adds the load method
    #
    # @param timeSeries the REST TimeSeries object to extend
    # @param imageSequence the parent ImageSequence object
    # @return the extended TimeSeries
    extend: (timeSeries, imageSequence) ->
      # The generic parent reference property.
      timeSeries.imageSequence = imageSequence

      # The concrete parent reference (scan or registration).
      propertyName = _s.decapitalize(imageSequence._cls)
      Object.defineProperty timeSeries, propertyName,
        get: -> @imageSequence

      # Make the title virtual property.
      Object.defineProperties timeSeries,
        # @returns the display title
        title:
          get: -> "#{ @imageSequence.title } Time Series"
      
      # The image resource is the time series name.
      resource = timeSeries.name
      # Extend the image.
      Image.extend(timeSeries.image, imageSequence, resource)
  ]
