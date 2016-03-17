define ['angular', 'lodash', 'timeSeries', 'volume'], (ng, _) ->
  imageSequence = ng.module('qiprofile.imagesequence',
                            ['qiprofile.timeseries', 'qiprofile.volume'])
  
  imageSequence.factory 'ImageSequence', [
    'TimeSeries', 'Volume', (TimeSeries, Volume) ->
      # Recursively extends the image sequence time series and
      # volumes.
      #
      # @param imageSequence the scan or registration REST object
      #   to extend
      # @returns the extended REST image sequence object
      extend: (imageSequence) ->
        # Extend the time series.
        if imageSequence.timeSeries?
          TimeSeries.extend(imageSequence.timeSeries)
        # Extend each volume.
        if imageSequence.volumes?
          for volume, index in imageSequence.volumes.images
            Volume.extend(volume, imageSequence, index + 1)

        # Return the augmented image sequence.
        imageSequence
  ]
