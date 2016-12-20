(function() {
  import * as _ from "lodash";
  import Scan from "./scan.data.coffee";

  /**
   * The {{#crossLink "ImageSequence"}}{{/crossLink}} validator.
   *
   * @module session
   * @class ImageSequenceSpec
   */
  describe('The ImageSequence data utility', function() {
    var mock, scan;
    mock = {
      session: {
        scans: [
          {
            _cls: 'Scan',
            number: '1',
            volumes: {
              name: 'NIFTI',
              images: [
                {
                  name: 'volume001.nii.gz',
                  averageIntensity: 2.4
                }, {
                  name: 'volume002.nii.gz',
                  averageIntensity: 2.7
                }, {
                  name: 'volume003.nii.gz',
                  averageIntensity: 2.3
                }
              ]
            }
          }
        ]
      }
    };
    scan = null;
    beforeEach(function() {
      var session;
      session = _.cloneDeep(mock.session);
      scan = session.scans[0];
      return Scan.extend(scan, session);
    });
    describe('Multi-volume', function() {
      return it('should determine whether the sequence has more than one volume', function() {
        return expect(scan.isMultiVolume(), "The mult-volume flag is incorrect").to.be["true"];
      });
    });
    return describe('Maximal intensity volume', function() {
      return it('should find the maximal intensity volume', function() {
        var target;
        target = scan.maximalIntensityVolume();
        expect(target, "The scan is missing the maximal intensity volume").to.exist;
        return expect(target, "The scan maximal intensity volume is incorrect").to.equal(scan.volumes.images[1]);
      });
    });
  });

}).call(this);
