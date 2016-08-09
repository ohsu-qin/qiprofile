`import * as _ from "lodash"`
`import moment from "moment"`

`import Registration from "./registration.data.coffee"`

###*
 * The {{#crossLink "Registration"}}{{/crossLink}} validator.
 *
 * @module session
 * @class RegistrationSpec
###
describe 'The Registration data utility', ->
  # The mock object.
  mock =
    scan:
      _cls: 'Scan'
      title: 'Breast Patient 1 Session 1 Scan 1'
      path: [{project: 'QIN_Test'}, {collection: 'Breast'}, {subject: 1},
             {session: 1}, {scan: 1}]
      registrations: [
        _cls: 'Registration'
        protocol: 'rp1'
      ]

  scan = null
  registration = null

  beforeEach ->
    scan = _.cloneDeep(mock.scan)
    registration = scan.registrations[0]
    # Extend the test registration.
    Registration.extend(registration, scan, 1)

  describe 'Path', ->
    it 'should have a path', ->
      expected = [{project: 'QIN_Test'}, {collection: 'Breast'}, {subject: 1},
                  {session: 1}, {scan: 1}, {registration: 1}]
      expect(registration.path, "The registration is missing a path").to.exist
      expect(
        registration.path,
        "The registration path is incorrect: #{ JSON.stringify(registration.path) }"
      ).to.eql(expected)

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
        .to.equal('Breast Patient 1 Session 1 Scan 1 Registration 1')
