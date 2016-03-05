define ['angular', 'lodash', 'underscore.string', 'sprintf'], (ng, _, _s, sprintf) ->
  imageSequence = ng.module 'qiprofile.imageSequence', []

  imageSequence.factory 'ImageSequence', ->
    class TimeSeries
      # The valid image sequence load states.
      @STATES =
        UNLOADED: 'unloaded'
        LOADING: 'loading'
        LOADED: 'loaded'
        ERROR: 'error'

      constructor: (@imageSequence)->
        @state = TimeSeries.STATES.UNLOADED
        @data = null

      isLoaded: ->
        @state is ImageSequence.STATES.LOADED

      isLoading: ->
        @state is ImageSequence.STATES.LOADING

      isError: ->
        @state is ImageSequence.STATES.ERROR
      
      # Transfers the NiFTI file image data to the data property.
      # The state loading flag is set to true while the
      # file is being read.
      #
      # @returns a promise which resolves to this time series
      #   when the file is loaded
      load: ->
        # Set the loading flag.
        @state = ImageSequence.STATES.LOADING

        # Read the file into an ArrayBuffer. The CoffeeScript fat
        # arrow (=>) binds the this variable to the image sequence object
        # rather than the $http request.
        File.readBinary(@location).then (data) =>
          # Capture the data.
          @data = data
          # Set the state to loaded.
          @state = ImageSequence.STATES.LOADED
        .catch (res) =>
          # Display an alert with the status text.
          alert("The imageSequence volume file load was unsuccessful: " +
                "#{ res.statusText } (#{ res.status }).")
          # Set the state to 'error'.
          @state = ImageSequence.STATES.ERROR

      # Note: The time series location is specific to XNAT. The scan
      # location relative to the parent session is
      # SCANS/<scan number>. The registration location relative to the
      # parent scan is the registration resource.
      # TODO - generalize this by delegating to an ImageStore service.
      #
      # @returns the image store time series file path
      Object.defineProperties @timeSeries,
        location:
          get: ->
            parent_dir = @imageSequence.location
            if @imageSequence._cls is 'Scan'
              "#{ parent_dir }/scan_ts/scan_ts.nii.gz"
            else if  @imageSequence._cls is 'Registration'
              "#{ parent_dir }/#{ @imageSequence.resource }_ts.nii.gz"

    # The ImageSequenceMixin class adds helper properties to an
    # image collection 4D scan or registration object.
    #
    # This class is private within the ImageSequence service scope.
    class ImageSequenceMixin

      # Creates an object which encapsulates an image sequence.
      #
      # @param source the REST Scan or Registration object
      # @returns a new imageSequence object
      constructor: ->
        # The initial state is unloaded.
        @timeSeries = new TimeSeries(this)

    Object.defineProperties ImageSequence.prototype,
      # The image sequence location is the XNAT image store archive
      # directory. The scan location relative to the parent session is
      # SCANS/<scan number>. The registration location relative to the
      # parent scan is the registration resource.
      # @returns the image store directory for this image sequence
      location: ->
        get: ->
          if @_cls is 'Scan'
            "#{ @session.location }/SCANS/#{ @number }"
          else if  @_cls is 'Registration'
            "#{ @scan.session.location }/SCANS/#{ @scan.number }/#{ @resource }/"
          else
            throw new TypeError("Unsupported ImageSequence type:" +
                                " #{ @_cls }")

    # @param imageSequence the scan or registration ImageSequence
    #   to extend
    # @return the extended ImageSequence
    extend = (imageSequence) ->
      mixin = new ImageSequenceMixin()
      _.extend(imageSequence, mixin)

    # The imageSequence load states.
    STATES: ImageSequence.STATES
