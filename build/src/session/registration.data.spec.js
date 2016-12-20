(function() {
  import * as _ from "lodash";
  import moment from "moment";
  import Registration from "./registration.data.coffee";

  /**
   * The {{#crossLink "Registration"}}{{/crossLink}} validator.
   *
   * @module session
   * @class RegistrationSpec
   */
  describe('The Registration data utility', function() {
    var mock, registration, scan;
    mock = {
      scan: {
        _cls: 'Scan',
        title: 'Breast Patient 1 Session 1 Scan 1',
        registrations: [
          {
            _cls: 'Registration',
            protocol: 'rp1'
          }
        ]
      }
    };
    scan = null;
    registration = null;
    beforeEach(function() {
      scan = _.cloneDeep(mock.scan);
      registration = scan.registrations[0];
      return Registration.extend(registration, scan, 1);
    });
    describe('find', function() {
      return it('should find the scan registration', function() {
        var target;
        target = Registration.find(scan, 1);
        expect(target, "The target was not found").to.exist;
        return expect(target, "The target is incorrect").to.equal(registration);
      });
    });
    return describe('extend', function() {
      it('should reference the parent scan', function() {
        expect(registration.scan, "The registration is missing the scan reference").to.exist;
        return expect(registration.scan, "The registration scan reference is incorrect").to.equal(scan);
      });
      it('should set the registration number', function() {
        expect(registration.number, "The scan number is missing").to.exist;
        return expect(registration.number, "The scan number is incorrect").to.equal(1);
      });
      return it('should have a virtual title property', function() {
        expect(registration.title, "The registration title is missing").to.exist;
        return expect(registration.title, "The registration title is incorrect").to.equal('Breast Patient 1 Session 1 Scan 1 Registration 1');
      });
    });
  });

}).call(this);
