(function() {
  import * as _ from "lodash";
  import TimeSeries from "./time-series.data.coffee";
  import Volume from "../volume/volume.data.coffee";

  /**
   * The ImageSequence REST data object extension utility.
   *
   * @module session
   * @class ImageSequence
   * @static
   */
  var ImageSequence;

  ImageSequence = {

    /**
     * Recursively extends the image sequence time series and
     * volumes.
     *
     * @method extend
     * @param imageSequence the scan or registration REST object
     *   to extend
     * @return the extended REST image sequence object
     */
    extend: function(imageSequence) {
      var i, image, index, len, ref;
      if (!imageSequence) {
        return imageSequence;
      }
      if (imageSequence.timeSeries != null) {
        TimeSeries.extend(imageSequence.timeSeries, imageSequence);
      }
      if (imageSequence.volumes != null) {
        ref = imageSequence.volumes.images;
        for (index = i = 0, len = ref.length; i < len; index = ++i) {
          image = ref[index];
          Volume.extend(image, imageSequence, index + 1);
        }
      }

      /**
       * @method isMultiVolume
       * @return whether this image sequence contain more than one
       *   volume
       */
      imageSequence.isMultiVolume = function() {
        return (this.volumes != null) && this.volumes.images.length > 1;
      };

      /**
       * Determines the volume with maximal intensity, determined as
       * follows:
       * * If there is only one volume, then return that volume.
       * * Otherwise, if at least one volume has an `averageIntensity`
       *   property value, then return the volume with the maximal
       *   intensity value.
       * * Otherwise, return null.
       *
       * @method maximalIntensityVolume
       * @return the  volume with maximal intensity, or null if
       *   such a volume could not be determined
       */
      imageSequence.maximalIntensityVolume = function() {
        var intensity, j, len1, ref1, target, volume;
        if (!this.volumes) {
          return;
        }
        if (!this.isMultiVolume()) {
          return this.volumes.images[0];
        }
        target = null;
        ref1 = this.volumes.images;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          volume = ref1[j];
          intensity = volume.averageIntensity;
          if (intensity != null) {
            if ((target == null) || intensity > target.averageIntensity) {
              target = volume;
            }
          }
        }
        return target;
      };
      return imageSequence;
    }
  };

  export { ImageSequence as default };

}).call(this);
