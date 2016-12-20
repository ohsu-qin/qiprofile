(function() {
  import * as _ from "lodash";
  import moment from "moment";
  import Session from "./session.data.coffee";

  /**
   * The {{#crossLink "Session"}}{{/crossLink}} validator.
   *
   * Note: image load cannot be unit-tested, since it requires an
   *   active browser.
   *
   * @module session
   * @class SessionSpec
   */
  describe('The Session data utility', function() {
    var mock, session, subject;
    mock = {
      subject: {
        title: 'Breast Patient 1'
      },
      session: {
        acquisitionDate: moment('Jul 1, 2013', 'MMM DD, YYYY').valueOf(),
        modelings: [
          {
            resource: 'pk_01',
            protocol: 'mp1',
            source: {
              registration: 'rp1'
            },
            result: {
              deltaKTrans: {
                name: "delta_k_trans.nii.gz",
                average: 2.3,
                labelMap: {
                  name: "delta_k_trans_color.nii.gz",
                  colorTable: "/etc/color_table.txt"
                }
              }
            }
          }
        ]
      },
      detail: {
        scans: [
          {
            _cls: 'Scan',
            number: 1,
            protocol: 'sp1',
            time_series: {
              name: 'scan_ts',
              image: {
                name: 'scan_ts.nii.gz'
              }
            },
            volumes: {
              name: 'NIFTI',
              images: [
                {
                  name: 'volume001.nii.gz'
                }
              ]
            }
          }
        ]
      }
    };
    subject = mock.subject;
    session = null;
    beforeEach(function() {
      session = _.cloneDeep(mock.session);
      return Session.extend(session, subject, 1);
    });
    return describe('extend', function() {
      it('should reference the parent subject', function() {
        expect(session.subject, "The session does not reference the" + " parent subject").to.exist;
        return expect(session.subject, "The session subject reference is" + " incorrect").to.equal(subject);
      });
      it('should set the session number', function() {
        expect(session.number, "The session is missing a number").to.exist;
        return expect(session.number, "The session number is incorrect").to.equal(1);
      });
      describe('Overlays', function() {
        var overlays;
        overlays = null;
        beforeEach(function() {
          return overlays = session.overlays;
        });
        it('should have one modeling overlay', function() {
          expect(overlays, "Modeling is missing overlays").to.exist;
          return expect(overlays.length, "Modeling overlays count is" + " incorrect").to.equal(1);
        });
        return it('should recapitulate the modeling result delta Ktrans overlay', function() {
          return expect(overlays[0], "Modeling result overlays is incorrect").to.equal(session.modelings[0].result.deltaKTrans.labelMap);
        });
      });
      describe('Modeling', function() {
        var modelingResult;
        modelingResult = null;
        beforeEach(function() {
          return modelingResult = session.modelings[0].result;
        });
        return describe('Parameter', function() {
          var paramResult;
          paramResult = null;
          beforeEach(function() {
            if (modelingResult) {
              return paramResult = modelingResult.deltaKTrans;
            }
          });
          it('should reference the modeling result object', function() {
            expect(paramResult.modelingResult, "Modeling parameter result does not reference" + " the parent modeling result object").to.exist;
            return expect(paramResult.modelingResult, "Modeling parameter result parent reference" + " is incorrect").to.equal(modelingResult);
          });
          return describe('Overlay', function() {
            var overlay;
            overlay = null;
            beforeEach(function() {
              if (paramResult) {
                return overlay = paramResult.overlay;
              }
            });
            it('should have a modeling parameter result overlay', function() {
              expect(overlay, "The modeling parameter result does not reference" + " an overlay").to.exist;
              return expect(overlay, "The modeling parameter result overlay" + " is not the label map").to.equal(paramResult.labelMap);
            });
            return it('should reference the parent modeling parameter result', function() {
              expect(overlay.parameterResult, "The overlay does not reference the parent" + " modeling parameter result").to.exist;
              return expect(overlay.parameterResult, "The overlay parameter result reference is incorrect").to.equal(paramResult);
            });
          });
        });
      });
      return describe('detail', function() {
        var extended;
        extended = null;
        beforeEach(function() {
          return extended = session.extendDetail(mock.detail);
        });
        it('should return a result', function() {
          return expect(extended, "Session extendDetail did not return a value").to.exist;
        });
        it('should return the augmented session object', function() {
          return expect(extended, "Session extendDetail did not return the session").to.equal(session);
        });
        it('should have scans', function() {
          return expect(session.scans, "Session is missing the scans").to.exist.and.not.be.empty;
        });
        return it('should have empty registrations', function() {
          return expect(session.scans[0].registrations, "Session extendDetail did not create the empty registrations").to.exist.and.be.empty;
        });
      });
    });
  });

}).call(this);
