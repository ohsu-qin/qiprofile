define ['angular', 'loader', 'imageStore'], (ng, Loader) ->
  image = ng.module 'qiprofile.image', ['qiprofile.imagestore']

  image.factory 'Image', ['ImageStore', (ImageStore) ->
    # An image representation which can load an image file.
    class Image extends Loader
      # @param store the image store
      constructor: ->
        super
        @data = @header = null
      
      # Loads this image file and parses it with the given parser.
      # The isLoading() method will return true while the file is being
      # read.
      #
      # @returns a promise which resolves to the parsed {header, data}
      #   content object
      load: (parser) ->
        # Delegate to Loader.
        super(this, ImageStore).then (content) ->
          parsed = parser.parse(content)
          @header = parsed.header 
          @data = parsed.data
          # Resolve to the parsed content.
          parsed

    # Return the Image class.
    Image
  ]
