define ['angular', 'lodash', 'loader', 'imageStore', 'nifti'], (ng, _, Loader) ->
  image = ng.module 'qiprofile.image', ['qiprofile.imagestore', 'qiprofile.nifti']

  image.factory 'Image', ['ImageStore', 'Nifti', (ImageStore, Nifti) ->
    # Matches a NIfTI file extension.
    NIFTI_REGEX = /\.nii(\.gz)?$/

    # An image representation which can load an image file.
    class ImageMixin extends Loader
      # @param imageSequence the parent object
      constructor: (imageSequence) ->
        super
        @imageSequence = imageSequence
        @data = @header = null
      
      parser: ->
        if NIFTI_REGEX.test(@name)
          Nifti
        else
          throw new Error("The image format could not be inferred from" +
                          " the image file extension for file #{ @name }")

      # Loads the image file and parses it with the given parser.
      # This method delegates to Loader.load to load the file
      # and the parser to parse the file.
      #
      # @returns a promise which resolves to this image object
      #   with the parsed header and data properties
      load: ->
        # The image content parser service.
        parser = @parser()
        # Delegate to the Loader.load function.
        super(this, ImageStore).then (content) ->
          parsed = parser.parse(content)
          @header = parsed.header 
          @data = parsed.data
          # Resolve to this image object.
          this

    # Makes the following changes to the given REST Image object:
    # * adds the generic parent imageSequence reference
    # * adds the concrete parent scan or registration reference
    # * adds the Loader functionality
    #
    # @param image the REST Image object to extend
    # @param imageSequence the parent ImageSequence object
    # @param the image store resource identifier
    # @return the extended Image object
    extend: (image, imageSequence, resource) ->
      # The parent reference property.
      image.imageSequence = imageSequence
      # The image resource.
      image.resource = resource
      
      # Add the loader functionality.
      _.extend(image, new ImageMixin(imageSequence))
  ]
