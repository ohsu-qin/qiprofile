`import * as _ from "lodash"`

`import Scan from "./scan.data.coffee"`

###*
 * The {{#crossLink "Scan"}}{{/crossLink}} validator.
 *
 * Note: image load cannot be unit-tested, since it requires an
 *   active browser.
 *
 * @module session
 * @class ScanSpec
###
describe 'The Scan utility', ->
  # The mock session object.
  # Note: the scan number is a string because it is fetched as
  #  such from the REST database and transformed to a number
  #  by Scan.extend.
  mock =
    session:
      title: 'Breast Patient 1 Session 1'
      path: [{project: 'QIN_Test'}, {collection: 'Breast'}, {subject: 1}, {session: 1}]
      scans: [
        _cls: 'Scan'
        number: '1'
        protocol: 'sp1'
        time_series:
          name: 'scan_ts'
          image: 'scan_ts.nii.gz'
        volumes:
          name: 'NIFTI'
          images: [
            name: 'volume001.nii.gz'
            average_intensity: 2.4
          ]
        registrations: []
      ]
  
  session = null
  scan = null

  beforeEach ->
    session = _.cloneDeep(mock.session)
    scan = session.scans[0]
    # Extend the test scan.
    Scan.extend(scan, session)

  describe 'Path', ->
    it 'should have a path', ->
      expected = [{project: 'QIN_Test'}, {collection: 'Breast'}, {subject: 1},
                  {session: 1}, {scan: 1}]
      expect(scan.path, "The scan is missing a path").to.exist
      expect(
        scan.path,
        "The scan path is incorrect: #{ JSON.stringify(scan.path) }"
      ).to.eql(expected)

  describe 'find', ->
    it 'should find the session scan', ->
      target = Scan.find(session, 1)
      expect(target, "The target was not found").to.exist
      expect(target, "The target is incorrect").to.equal(scan)

  describe 'extend', ->
    it 'should reference the parent session', ->
      expect(scan.session, "The scan is missing the session reference")
        .to.exist
      expect(scan.session, "The scan session reference is incorrect")
        .to.equal(session)

    it 'should convert the number to an integer', ->
      expect(scan.number, "The scan number is incorrect").to.equal(1)

    it 'should have a virtual title property', ->
      expect(scan.title, "The scan title is missing").to.exist
      expect(scan.title, "The scan title is incorrect")
        .to.equal('Breast Patient 1 Session 1 Scan 1')
