(function() {
  import * as _ from "lodash";
  import Scan from "./scan.data.coffee";

  /**
   * The {{#crossLink "Scan"}}{{/crossLink}} validator.
   *
   * @module session
   * @class ScanSpec
   */
  describe('The Scan data utility', function() {
    var mock, scan, session;
    mock = {
      session: {
        title: 'Breast Patient 1 Session 1',
        scans: [
          {
            _cls: 'Scan',
            number: '1',
            protocol: 'sp1',
            time_series: {
              name: 'scan_ts',
              image: 'scan_ts.nii.gz'
            },
            volumes: {
              name: 'NIFTI',
              images: [
                {
                  name: 'volume001.nii.gz',
                  average_intensity: 2.4
                }
              ]
            },
            registrations: []
          }
        ]
      }
    };
    session = null;
    scan = null;
    beforeEach(function() {
      session = _.cloneDeep(mock.session);
      scan = session.scans[0];
      return Scan.extend(scan, session);
    });
    describe('find', function() {
      return it('should find the session scan', function() {
        var target;
        target = Scan.find(session, 1);
        expect(target, "The target was not found").to.exist;
        return expect(target, "The target is incorrect").to.equal(scan);
      });
    });
    return describe('extend', function() {
      it('should reference the parent session', function() {
        expect(scan.session, "The scan is missing the session reference").to.exist;
        return expect(scan.session, "The scan session reference is incorrect").to.equal(session);
      });
      it('should convert the number to an integer', function() {
        return expect(scan.number, "The scan number is incorrect").to.equal(1);
      });
      return it('should have a virtual title property', function() {
        expect(scan.title, "The scan title is missing").to.exist;
        return expect(scan.title, "The scan title is incorrect").to.equal('Breast Patient 1 Session 1 Scan 1');
      });
    });
  });

}).call(this);
