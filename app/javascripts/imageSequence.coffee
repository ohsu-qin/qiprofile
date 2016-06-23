define ['angular', 'lodash', 'timeSeries', 'volume'], (ng, _) ->
  imageSequence = ng.module('qiprofile.imagesequence',
                            ['qiprofile.timeseries', 'qiprofile.volume'])

  imageSequence.factory 'ImageSequence', [
    'TimeSeries', 'Volume', (TimeSeries, Volume) ->
      ###*
       * Recursively extends the image sequence time series and
       * volumes.
       *
       * @method extend
       * @param imageSequence the scan or registration REST object
       *   to extend
       * @return the extended REST image sequence object
      ###
      extend: (imageSequence) ->
        # Extend the time series.
        if imageSequence.timeSeries?
          TimeSeries.extend(imageSequence.timeSeries, imageSequence)

        # Extend each volume.
        if imageSequence.volumes?
          for image, index in imageSequence.volumes.images
            Volume.extend(image, imageSequence, index + 1)

        ###*
         * @method imageSequence
         * @return whether this image sequence contain more than one
         *   volume
        ###
        imageSequence.isMultiVolume = ->
          imageSequence.volumes? and imageSequence.volumes.images.length > 1

        # Return the augmented image sequence.
        imageSequence
  ]
