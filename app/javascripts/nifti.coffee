define ['angular'], (ng) ->
  nifti = ng.module 'qiprofile.nifti', []

  nifti.factory 'Nifti', ->
    # Parses the file content into the meta-data header and image
    # data.
    #
    # @returns a promise which resolves to the {header, data}
    #   associative object
    parse: (content) ->
      # TODO - get the binary image data
      content
