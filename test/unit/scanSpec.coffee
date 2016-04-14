# The Session unit test.
#
# Note: image load cannot be unit-tested, since it requires an
# active browser.
define ['ngmocks', 'lodash', 'expect', 'moment', 'session', 'helpers'],
  (ng, _, expect, moment) ->
    # The mock objects.
    # Note: the scan REST object number is fetched as a string
    #  and transformed to a number by Scan.extend.
    mock =
      session:
        title: 'Breast Patient 1 Session 1'
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

    describe 'Unit Testing the Scan Service', ->
      Scan = null
      scan = null
      session = null

      beforeEach ->
        # Fake the session service module.
        ng.module('qiprofile.scan')
        inject ['Scan', (_Scan_) ->
          Scan = _Scan_
        ]
        session =  _.cloneDeep(mock.session)
        scan = session.scans[0]
        # Extend the test scan.
        Scan.extend(scan, session)

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
