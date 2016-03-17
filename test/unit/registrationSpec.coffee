# The Session unit test.
#
# Note: image load cannot be unit-tested, since it requires an
# active browser.
define ['ngmocks', 'lodash', 'expect', 'moment', 'registration', 'helpers'],
  (ng, _, expect, moment) ->
    # The mock objects.
    mock =
      scan:
        title: 'Breast Subject 1 Session 1 Scan 1'
        registrations: [
          protocol: 'rp1'
        ]

    describe.only 'Unit Testing the Registration Service', ->
      Registration = null
      registration = null
      scan = null

      beforeEach ->
        # Fake the session service module.
        ng.module('qiprofile.registration')
        inject ['Registration', (_Registration_) ->
          Registration = _Registration_
        ]
        scan = _.cloneDeep(mock.scan)
        registration = scan.registrations[0]
        # Extend the test registration.
        Registration.extend(registration, mock.scan, 1)

      describe 'find', ->
        it 'should find the scan registration', ->
          target = Registration.find(scan, 1)
          expect(target, "The target was not found").to.exist
          expect(target, "The target is incorrect").to.equal(registration)

      describe 'extend', ->
        it 'should reference the parent scan', ->
          expect(registration.scan, "The registration is missing the scan reference")
            .to.exist
          expect(registration.scan, "The registration scan reference is incorrect")
            .to.equal(scan)
        it 'should set the registration number', ->
          expect(registration.number, "The scan number is missing").to.exist
          expect(registration.number, "The scan number is incorrect").to.equal(1)
        it 'should have a virtual title property', ->
          expect(registration.title, "The registration title is missing").to.exist
          expect(registration.title, "The registration title is incorrect")
            .to.equal('Breast Subject 1 Session 1 Scan 1 Registration 1')
