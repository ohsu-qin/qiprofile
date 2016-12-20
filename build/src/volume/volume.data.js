(function() {
  import * as _ from "lodash";
  import * as _s from "underscore.string";
  import Image from "../image/image.data.coffee";

  /**
   * The Volume REST data object extension utility.
   *
   * @class Volume
   * @static
   */
  var Volume;

  Volume = {

    /**
     * Adds the following volume properties to the given volume
     * image:
     * * resource - the image store resource name
     * * number - the one-based volume number
     * * scan, if the volume parent is a scan, or
     * * registration, if the volume parent is a registration
     * * imageSequence - the parent scan or registration
     *
     * @method extend
     * @param image the volume image object to extend
     * @param imageSequence the parent object
     * @param number the one-based volume number
     */
    extend: function(volume, imageSequence, number) {
      var propertyName;
      if (volume == null) {
        return volume;
      }

      /**
       * The one-based volume index relative to the parent image sequence.
       *
       * @property number {number}
       */
      volume.number = number;

      /**
       * The parent scan or registration.
       *
       * @property imageSequence {ImageSequence}
       */
      volume.imageSequence = imageSequence;

      /**
       * The scan which contains this volume. If the parent
       * {{#crossLink "ImageSequence"}}{{/crossLink}} is a
       * {{#crossLink "Registration"}}{{/crossLink}}, then
       * this volume's scan is the parent registration's scan.
       *
       * @property scan {Scan}
       */
      Object.defineProperties(volume, {
        scan: {
          get: function() {
            if (this.imageSequence._cls === 'Scan') {
              return this.imageSequence;
            } else {
              return this.imageSequence.scan;
            }
          }
        }
      });
      Image.extend(volume);
      propertyName = _s.decapitalize(imageSequence._cls);
      Object.defineProperty(volume, propertyName, {
        get: function() {
          return this.imageSequence;
        }
      });
      Object.defineProperties(volume, {

        /**
         * @property title {string} the display title
         */
        title: {
          get: function() {
            return this.imageSequence.title + " Volume " + this.number;
          }
        },

        /**
         * @property resource {string} the volume resource name
         */
        resource: {
          get: function() {
            return this.imageSequence.volumes.name;
          }
        }
      });
      return volume;
    },

    /**
     * @method find
     * @param imageSequence the parent scan or registration to search
     * @param number the volume number
     * @return the volume object
     * @throws ReferenceError if the parent image sequence does not
     *   have the volume
     */
    find: function(imageSequence, number) {
      var target;
      if (imageSequence.volumes != null) {
        target = imageSequence.volumes.images[number - 1];
      }
      if (target == null) {
        throw new ReferenceError((imageSequence.title + " does not have a volume with number") + (" " + number));
      }
      return target;
    }
  };

  export { Volume as default };

}).call(this);
