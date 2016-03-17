define ['angular', 'lodash', 'image', 'nifti'], (ng, _) ->
  timeSeries = ng.module 'qiprofile.timeseries', ['qiprofile.image', 'qiprofile.nifti'] 

  timeSeries.factory 'TimeSeries', ['Image', 'Nifti', (Image, Nifti) ->
    # The time series mix-in.
    class TimeSeriesMixin extends Image
      # Loads and parses this time series image file.
      # The isLoading() method will return true while the file is being
      # read.
      #
      # @returns a promise which resolves to the parsed {header, data}
      #   content object
      load: ->
        # Delegate to Image with the Nifti parser.
        super(@location, Nifti)
      
    # Makes the following changes to the given REST TimeSeries object:
    # * adds the parent imageSequence reference
    # * adds the location virtual property
    # * adds the load method
    #
    # @param timeSeries the REST TimeSeries object to extend
    # @param imageSequence the parent ImageSequence object
    # @return the extended TimeSeries
    extend: (timeSeries, imageSequence) ->
      # Set the parent reference.
      timeSeries.imageSequence = imageSequence

      # Make the virtual properties.
      Object.defineProperties timeSeries,
        # @returns the time series name
        resource:
          get: -> @name

        title:
          get: -> "#{ @imageSequence.title } Time Series"
      
      # Add the load function.
      _.extend(timeSeries, new TimeSeriesMixin())
  ]
