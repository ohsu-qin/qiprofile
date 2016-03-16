define ['angular', 'lodash', 'timeSeries', 'volume'], (ng, _) ->
  imageSequence = ng.module('qiprofile.imagesequence',
                            ['qiprofile.timeseries', 'qiprofile.volume'])
  
  imageSequence.factory 'ImageSequence', ['TimeSeries', 'Volume', (TimeSeries, Volume) ->
    # @param imageSequence the scan or registration ImageSequence
    #   to extend
    # @returns the extended ImageSequence
    extend: (imageSequence) ->
      # Extend the time series.
      if imageSequence.timeSeries?
        TimeSeries.extend(imageSequence.timeSeries)
      # Extend each volume.
      for volume, index in imageSequence.volumes.images
        Volume.extend(volume, imageSequence, index + 1)

      # Return the augmented image sequence.
      imageSequence
  ]