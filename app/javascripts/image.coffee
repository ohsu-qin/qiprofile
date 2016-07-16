define ['angular', 'lodash', 'loader', 'imageStore', 'nifti'], (ng, _, Loader) ->
  image = ng.module 'qiprofile.image', ['qiprofile.imagestore', 'qiprofile.nifti']

  image.factory 'Image', ['ImageStore', 'Nifti', (ImageStore, Nifti) ->
    # Matches a NIfTI file extension.
    NIFTI_REGEX = /\.nii(\.gz)?$/

    # An image representation which can load an image file.
    class ImageMixin extends Loader
      parser: ->
        if NIFTI_REGEX.test(@name)
          Nifti
        else
          throw new Error("The image format could not be inferred from" +
                          " the image file extension for file #{ @name }")

      ###*
       * Loads the image file and parses it with the given parser.
       * This method delegates to Loader.load to load the file
       * and the parser to parse the file.
       *
       * @method load
       * @return a promise which resolves to this image object
       *   extended with the parsed {header, data} *contents* property
      ###
      load: ->
        # The image content parser service.
        parser = @parser()
        # Delegate to the Loader.load function.
        super(this, ImageStore)
          .then (raw) =>
            parser.parse(raw)
          .then (parsed) =>
            @contents = parsed

    Object.defineProperties ImageMixin.prototype,
      ###*
       * Returns the <parent>/image path, where:
       * * <parent> is the parent scan or registration image
       *   sequence path
       * * *image* is the time series image name
       *
       * @method path
       * @return the ancestor path
      ###
      path:
        get: ->
          # Make and cache the title on demand, since it is
          # potentially called frequently as the basis for
          # an image id.
          if not @_path?
            @_path = "#{ @imageSequence.path }/#{ @resource }/#{ @name }"
          @_path

    ###*
     * Makes the following changes to the given REST Image object:
     * * adds the generic parent imageSequence reference
     * * adds the concrete parent scan or registration reference
     * * adds the Loader functionality
     *
     * @method extend
     * @param image the REST Image object to extend
     * @return the extended Image object
    ###
    extend: (image) ->
      # Add the loader functionality.
      _.extend(image, new ImageMixin)
  ]
