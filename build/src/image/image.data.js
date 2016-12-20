
/**
 * The Image REST data object extension service utility.
 *
 * @class Image
 * @module image
 * @static
 */

(function() {
  var Image;

  Image = {

    /**
     * Makes the following changes to the given REST Image object:
     * * adds the *identifier* virtual property
     *
     * @method extend
     * @param image the REST Image object to extend
     * @return the extended Image object
     */
    extend: function(image) {
      if (image == null) {
        return image;
      }
      Object.defineProperties(image, {

        /**
         * A string that uniquely and durably identifies this image
         * in the scope of the database. The path is the image
         * hierarchy, e.g.
         * `QIN_Test/Breast/1/1/1/reg_7ka3z/volume001.nii.gz`
         * for the first volume of the Subject 1 Session 1 Scan 1
         * registration with name `reg_7ka3z`.
         *
         * @property identifier {string}
         */
        identifier: {
          get: function() {
            var collection, prefix, project, session, subject;
            session = this.imageSequence.session;
            subject = session.subject;
            project = subject.project;
            collection = subject.collection;
            prefix = "/" + project + "/" + collection + "/" + subject.number + "/" + session.number;
            return prefix + "/" + this.scan.number + "/" + this.resource + "/" + this.name;
          }
        }
      });
      return image;
    }
  };

  export { Image as default };

}).call(this);
