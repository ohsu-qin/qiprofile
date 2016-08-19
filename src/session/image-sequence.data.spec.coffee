`import * as _ from "lodash"`

`import Scan from "./scan.data.coffee"`

###*
 * The {{#crossLink "ImageSequence"}}{{/crossLink}} validator.
 *
 * @module session
 * @class ImageSequenceSpec
###
describe 'The ImageSequence data utility', ->
  # The mock session object.
  # Note: the scan number is a string because it is fetched as
  #  such from the REST database and transformed to a number
  #  by Scan.extend.
  mock =
    session:
      scans: [
        _cls: 'Scan'
        number: '1'
        volumes:
          name: 'NIFTI'
          images: [
            {name: 'volume001.nii.gz', averageIntensity: 2.4}
            {name: 'volume002.nii.gz', averageIntensity: 2.7}
            {name: 'volume003.nii.gz', averageIntensity: 2.3}
          ]
      ]
  
  scan = null

  beforeEach ->
    session = _.cloneDeep(mock.session)
    scan = session.scans[0]
    # Extend the test scan.
    Scan.extend(scan, session)

  describe 'Multi-volume', ->
    it 'should determine whether the sequence has more than one volume', ->
      expect(scan.isMultiVolume(), "The mult-volume flag is incorrect")
        .to.be.true

  describe 'Maximal intensity volume', ->
    it 'should find the maximal intensity volume', ->
      target = scan.maximalIntensityVolume()
      expect(target, "The scan is missing the maximal intensity volume")
        .to.exist
      expect(target, "The scan maximal intensity volume is incorrect")
        .to.equal(scan.volumes.images[1])
