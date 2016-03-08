define ['angular', 'lodash', 'loader'], (ng, _, Loader) ->
  imageSequence = ng.module 'qiprofile.imagesequence', []

  imageSequence.factory 'ImageSequence', ->
    class TimeSeries extends Loader
      # @param imageSequence the REST Scan or Registration object
      constructor: (@imageSequence) ->
        super

      # Transfers the NiFTI file image data to the data property.
      # The state loading flag is set to true while the
      # file is being read.
      #
      # @returns a promise which resolves to this time series
      #   when the file is loaded
      load: ->
        super @location

    # @returns the image store time series file path
    Object.defineProperties TimeSeries.prototype,
      location:
        get: ->
          imageSequenceDir = @imageSequence.location
          basename = "#{ @imageSequence.time_series }"
          if @imageSequence._cls is 'Scan'
            resource = "#{ @imageSequence.image_resources.time_series }"
          else if @imageSequence._cls is 'Registration'
            resource = "#{ @imageSequence.resource }"
          else
            throw new TypeError("Unsupported ImageSequence type:" +
                                " #{ @_cls }")
          "#{ imageSequenceDir }/#{ resource }/#{ basename }"

    # The ImageSequenceMixin class adds helper properties to an
    # image collection 4D scan or registration object.
    #
    # This class is private within the ImageSequence service scope.
    class ImageSequenceMixin
      # @param source the REST Scan or Registration object
      # @returns a new ImageSequence extension object
      constructor: ->
        # The encapsulated 4D time series image.
        @timeSeries = new TimeSeries(this)

    Object.defineProperties ImageSequenceMixin.prototype,
      # The image sequence location is the image store directory which
      # contains the image files.
      #
      # @returns the image store directory for this image sequence
      location: ->
        get: ->
          # The scan object.
          if @_cls is 'Scan'
            scan = this
          else if @_cls is 'Registration'
            scan = @scan
          else
            throw new TypeError("Unsupported ImageSequence type:" +
                                " #{ @_cls }")
          # The image store resource which contains the image files.
          resource = @volumes.name

          # TODO - generalize the template below by delegating to an
          #   ImageStore service.
          "#{ scan.session.location }/SCANS/#{ scan.number }/#{ resource }"

        # Formats the image sequence title.
        #
        # Note: this formatting routine should be confined to the filter,
        # but must be placed in this helper for use by the intensity
        # chart configuration.
        #
        # @param imageSequence the imageSequence object
        # @returns the display title for the imageSequence
        title: ->
          get: ->
            if @_cls is 'Scan'
              "#{ _s.capitalize(@name) } #{ @_cls }"
            else if  imageSequence._cls is 'Registration'
              if not imageSequence.source?
                throw new ReferenceError("The scan source name was not found")
              reg_src = _s.capitalize(imageSequence.source)
              "#{ reg_src } #{ imageSequence.type } #{ name }"
            else
              throw new TypeError("Unsupported image imageSequence type:" +
                                  " #{ imageSequence._cls }")
    
    # @param imageSequence the scan or registration ImageSequence
    #   to extend
    # @return the extended ImageSequence
    extend: (imageSequence) ->
      mixin = new ImageSequenceMixin()
      _.extend(imageSequence, mixin)
