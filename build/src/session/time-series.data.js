(function() {
  import * as _s from "underscore.string";
  import Image from "../image/image.data.coffee";

  /**
   * Adds the following properties to the given REST Image
   * object:
   * * the Image.extend properties
   * * _timeSeries_ - the parent time series
   * * _resource_ - the parent time series name
   *
   * @method extendImage
   * @protected
   * @param image the child Image object
   * @param timeSeries the parent TimeSeries object
   */
  var TimeSeries, extendImage;

  extendImage = function(image, timeSeries) {
    image.timeSeries = timeSeries;
    Image.extend(timeSeries.image);
    return Object.defineProperties(image, {

      /**
       * @method resource
       * @return the parent time series name
       */
      resource: {
        get: function() {
          return this.timeSeries.name;
        }
      },

      /**
       * @method imageSequence
       * @return the parent time series parent image sequence
       */
      imageSequence: {
        get: function() {
          return this.timeSeries.imageSequence;
        }
      }
    });
  };


  /**
   * The TimeSeries REST data object extension utility.
   *
   * @module session
   * @class TimeSeries
   * @static
   */

  TimeSeries = {

    /**
     * Adds the following properties to the given REST TimeSeries
     * object:
     * * _imageSequence_ - the abstract parent image sequence
     *   reference
     * * the concrete parent *scan* or *registration* reference
     *
     * The time series *image* is also extended as described in
     * `extendImage`.
     *
     * @method extend
     * @param timeSeries the REST TimeSeries object to extend
     * @param imageSequence the parent ImageSequence object
     * @return the extended TimeSeries
     */
    extend: function(timeSeries, imageSequence) {
      var propertyName;
      if (timeSeries == null) {
        return timeSeries;
      }
      timeSeries.imageSequence = imageSequence;
      propertyName = _s.decapitalize(imageSequence._cls);
      Object.defineProperty(timeSeries, propertyName, {
        get: function() {
          return this.imageSequence;
        }
      });
      Object.defineProperties(timeSeries, {

        /**
         * @method title
         * @return the display title
         */
        title: {
          get: function() {
            return this.imageSequence.title + " Time Series";
          }
        }
      });
      extendImage(timeSeries.image, timeSeries);
      if (timeSeries.overlay != null) {
        extendImage(timeSeries.overlay, timeSeries);
      }
      return timeSeries;
    }
  };

  export { TimeSeries as default };

}).call(this);
