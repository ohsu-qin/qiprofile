`import { sprintf } from "sprintf"`

# The image store location relative to the web app root.
# This is a symbolic link to the image store root directory
# on the server.
IMAGE_STORE_ROOT = '/data'

###*
 * @method projectLocation
 # @protected
 * @param project the project name
 * @return the image store project directory
###
projectLocation = (project) ->
  "#{ IMAGE_STORE_ROOT }/#{ project }/arc001"

###*
 * If the image sequence is a scan, then this method
 * returns the image sequence. Otherwise, this method
 * returns the scan from which the image sequence is
 * derived.
 *
 * @method scanFor
 # @protected
 * @return the image sequence scan
###
scanFor = (imageSequence) ->
  if imageSequence._cls is 'Scan'
    imageSequence
  else if imageSequence.scan?
    imageSequence.scan
  else
    throw new TypeError("Cannot infer the #{ imageSequence.title }" +
                        " parent scan")

###*
 * The XNAT helper utility.
 *
 * @class XNAT
 * @static
###
XNAT =
  ###*
   * @method location
   * @param image the REST TimeSeries or Volume object
   * @return the image file path relative to the web app root
  ###
  location: (image) ->
    # The image parent is either a scan or registration image
    # sequence.
    resource = image.resource
    imageSequence = image.imageSequence
    scan = scanFor(imageSequence)
    session = imageSequence.session
    subject = session.subject
    collection = subject.collection
    project = subject.project
    # The XNAT project directory.
    projectDir = projectLocation(project)
    # The scan subdirectory.
    scanDir = "SCANS/#{ scan.number }"
    # The zero-padded subject label number suffix, e.g. "003".
    subjectNumberSuffix = sprintf.sprintf("%03d", subject.number)
    # The subject label, e.g. "Breast003".
    subjectLabel = "#{ collection }#{ subjectNumberSuffix }"
    # The zero-padded session label number suffix, e.g. "01".
    sessionNumberSuffix = sprintf.sprintf("%02d", session.number)
    # The XNAT experiment label, e.g. "Breast003_Session02".
    expLabel = "#{ subjectLabel }_Session#{ sessionNumberSuffix }"

    # Return the formatted image file path.
    "#{ projectDir }/#{ expLabel }/#{ scanDir }/#{ resource }/#{ image.name }"

`export { XNAT as default }`
