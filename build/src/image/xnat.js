(function() {
  import { sprintf } from "sprintf";
  var IMAGE_STORE_ROOT, XNAT, projectLocation, scanFor;

  IMAGE_STORE_ROOT = 'data';


  /**
   * @method projectLocation
    * @protected
   * @param project the project name
   * @return the image store project directory
   */

  projectLocation = function(project) {
    return IMAGE_STORE_ROOT + "/" + project + "/arc001";
  };


  /**
   * If the image sequence is a scan, then this method
   * returns the image sequence. Otherwise, this method
   * returns the scan from which the image sequence is
   * derived.
   *
   * @method scanFor
    * @protected
   * @return the image sequence scan
   */

  scanFor = function(imageSequence) {
    if (imageSequence._cls === 'Scan') {
      return imageSequence;
    } else if (imageSequence.scan != null) {
      return imageSequence.scan;
    } else {
      throw new TypeError(("Cannot infer the " + imageSequence.title) + " parent scan");
    }
  };


  /**
   * The XNAT helper utility.
   *
   * @class XNAT
   * @static
   */

  XNAT = {

    /**
     * @method location
     * @param image the REST TimeSeries or Volume object
     * @return the image file path relative to the web app root
     */
    location: function(image) {
      var collection, expLabel, imageSequence, parentDir, project, projectDir, resource, scan, session, sessionNumberSuffix, subject, subjectLabel, subjectNumberSuffix;
      if (!image) {
        return;
      }
      resource = image.resource;
      imageSequence = image.imageSequence;
      if (imageSequence != null) {
        scan = scanFor(imageSequence);
        session = imageSequence.session;
      } else {
        session = image.session;
      }
      if (session == null) {
        throw new Error("The image " + image.name + " does not have a session");
      }
      subject = session.subject;
      collection = subject.collection;
      project = subject.project;
      projectDir = projectLocation(project);
      subjectNumberSuffix = sprintf.sprintf("%03d", subject.number);
      subjectLabel = "" + collection + subjectNumberSuffix;
      sessionNumberSuffix = sprintf.sprintf("%02d", session.number);
      expLabel = subjectLabel + "_Session" + sessionNumberSuffix;
      if (scan != null) {
        parentDir = expLabel + "/SCANS/" + scan.number;
      } else {
        parentDir = expLabel;
      }
      return projectDir + "/" + parentDir + "/" + resource + "/" + image.name;
    }
  };

  export { XNAT as default };

}).call(this);
