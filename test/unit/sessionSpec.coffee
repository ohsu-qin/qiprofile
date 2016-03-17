# The Session unit test.
#
# Note: image load cannot be unit-tested, since it requires an
# active browser.
define ['ngmocks', 'lodash', 'expect', 'moment', 'session', 'helpers'],
  (ng, _, expect, moment) ->
    # The mock objects.
    mock =
      subject:
        title: 'Breast Subject 1'

      session:
        acquisitionDate: moment('Jul 1, 2013', 'MMM DD, YYYY').valueOf()
        detail: 'sd1'
        modelings: [
          resource: 'pk_01'
          protocol: 'mp1'
          source:
            registration: 'rp1'
          result:
            deltaKTrans:
              name: "path/to/first/delta_k_trans.nii.gz"
              average: 2.3
              labelMap:
                name: "path/to/first/delta_k_trans_color.nii.gz"
                colorTable: "path/to/color_table.txt"
        ]

      session_detail:
        sd1:
          _id: 'sd1'
          scans: [
            _cls: 'Scan'
            number: 1
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
            registrations: [
              _cls: 'Registration'
              protocol: 'rp1'
              time_series:
                name: 'reg_01'
                image: 'reg_01_ts.nii.gz'
              volumes:
                name: 'reg_01'
                images:  [
                  name: 'volume001.nii.gz'
                  average_intensity: 3.1
                ]
            ]
          ]

    describe 'Unit Testing the Session Service', ->
      Session = null
      session = null

      beforeEach ->
        # Fake the session service module.
        ng.module('qiprofile.session')
        inject ['Session', (_Session_) ->
          Session = _Session_
        ]
        session = _.cloneDeep(mock.session)
        # Extend the mock session.
        Session.extend(session, mock.subject, 1)

      describe 'ModelingChart', ->
        modeling = null

        beforeEach ->
          try
            modeling = session.modelings[0]
          catch TypeError
            # There is not a modelings array.

        it 'should have one session modeling object', ->
          expect(session.modelings, "Session is missing modeling")
            .to.exist
          expect(session.modelings.length,
                 "Session modeling count is incorrect").to.equal(1)

        it 'should have a session reference', ->
          expect(modeling.session,
                 "Modeling does not reference the session").to.exist
          expect(modeling.session,
                 "Modeling session reference is incorrect")
            .to.equal(session)

        it 'should have one modeling overlay', ->
          expect(modeling.overlays, "Modeling is missing overlays")
            .to.exist
          expect(modeling.overlays.length,
                 "Modeling overlays count is incorrect").to.equal(1)

        it 'should recapitulate the modeling result delta Ktrans overlay', ->
          expect(modeling.overlays[0],
                 "Modeling result overlays is incorrect")
            .to.equal(modeling.result.deltaKTrans.overlay)

        describe 'Result', ->
          modelingResult = null

          beforeEach ->
            if modeling
              modelingResult = modeling.result

          it 'should reference the modeling object', ->
            expect(modelingResult.modeling,
                   "Modeling result does not reference the parent" +
                   " modeling object").to.exist
            expect(modelingResult.modeling,
                   "Modeling result parent reference is incorrect")
              .to.equal(modeling)

          describe 'Parameter', ->
            paramResult = null

            beforeEach ->
              if modelingResult
                paramResult = modelingResult.deltaKTrans

            it 'should reference the modeling result object', ->
              expect(paramResult.modelingResult,
                     "Modeling parameter result does not reference" +
                     " the parent modeling result object").to.exist
              expect(paramResult.modelingResult,
                     "Modeling parameter result parent reference" +
                     " is incorrect").to.equal(modelingResult)

            describe 'Overlay', ->
              overlay = null

              beforeEach ->
                if paramResult
                  overlay = paramResult.overlay

              it 'should have a modeling parameter result overlay', ->
                expect(overlay,
                       "Modeling parameter result does not reference an" +
                       " overlay").to.exist
                expect(overlay,
                       "Modeling parameter result overlay is not the" +
                       " label map").to.equal(paramResult.labelMap)

              it 'should reference the parent modeling parameter result', ->
                expect(overlay.parameterResult,
                       "Overlay does not reference the parent modeling" +
                       " parameter result").to.exist
                expect(overlay.parameterResult,
                       "Overlay parameter result reference is incorrect")

                  .to.equal(paramResult)

      describe 'Detail', ->
        $httpBackend = null
        $rootScope = null
        $timeout = null
        detail = null

        beforeEach ->
          inject [
            '$httpBackend', '$rootScope', '$timeout',
            (_$httpBackend_, _$rootScope_, _timeout_) ->
              $httpBackend = _$httpBackend_
              $rootScope = _$rootScope_
              $timeout = _timeout_

              # The mock session-detail http calls.
              url = encodeURI('/api/session-detail/sd1')
              $httpBackend.whenGET(url).respond(JSON.stringify(mock.session_detail.sd1))
          ]
          # Fetch the detail.
          Session.detail(session).then (fetched) ->
             detail = fetched
          $httpBackend.flush()

        afterEach ->
          # Note: Angular 1.2.5 and after issue a 'Digest in progress' message
          # unless the digest argment is set to false as shown below.
          $httpBackend.verifyNoOutstandingExpectation(false)
          $httpBackend.verifyNoOutstandingRequest()

        it 'should return a result', ->
          expect(detail, "Session detail did not return a value").to.exist

        it 'should return the augmented session object', ->
          expect(detail, "Session detail did not return the session")
            .to.equal(session)

        it 'should have scans', ->
          expect(session.scans, "Session is missing the scans")
            .to.exist.and.not.be.empty

        describe 'Scan', ->
          scan = null
          mockScan = mock.session_detail.sd1.scans[0]

          beforeEach ->
            try
              scan = Session.getScan(session, 1)
            catch ReferenceError
              # Session couldn't resolve the scan.
              # This is caught in the first test case.

          it 'should have a session scan', ->
            expect(scan, "The session is missing the scan").to.exist

          it 'should reference the session', ->
            expect(scan.session, "The scan is missing the session" +
                                 " reference").to.exist
            expect(scan.session, "The scan session reference is incorrect")
               .to.equal(session)

          describe 'Volume', ->
            volume = null
            mockVolume = mockScan.volumes.images[0]

            beforeEach ->
              try
                volume = scan.volumes.images[0]
              catch TypeError
                # There is not a volumes array.

            it 'should have a scan volume', ->
              expect(scan.volumes, "The scan is missing volumes").to.exist
              expect(scan.volumes.images.length, "The scan volumes length" +
                                                 " is incorrect")
                .to.equal(1)

            it 'should reference the scan', ->
              expect(volume.scan, "The volume is missing the scan reference")
                .to.exist
              expect(volume.scan, "The volume scan reference is incorrect")
                 .to.equal(scan)

            it 'should alias the imageSequence reference to the scan', ->
              expect(volume.imageSequence, "The volume is missing the" +
                                           " imageSequence alias")
                .to.exist
              expect(volume.imageSequence, "The volume imageSequence alias" +
                                           " is incorrect")
                .to.equal(scan)

            it 'should have a volume number', ->
              expect(volume.number, "The volume number is missing").to.exist
              expect(volume.number, "The volume number is incorrect")
                .to.equal(1)

            it 'should have a name', ->
              expect(volume.name, "The name is missing").to.exist
              expect(volume.name, "The name is incorrect")
                .to.equal(mockVolume.name)

            it 'should have an intensity', ->
              expect(volume.averageIntensity, "The voume intensity is missing")
                .to.exist
              expect(volume.averageIntensity, "The scan intensity is incorrect")
                .to.equal(mockVolume.average_intensity)

          describe 'Registration', ->
            registration = null

            beforeEach ->
              try
                registration = Session.getRegistration(scan, 'reg_01')
              catch ReferenceError
                # Session couldn't resolve the registration.

            it 'should have a scan registration', ->
              expect(registration, "The scan is missing the registration")
                .to.exist

            it 'should reference the scan', ->
              expect(registration.scan, "The registration is missing the" +
                                        " scan reference").to.exist
              expect(registration.scan, "The registration scan reference" +
                                        " is incorrect").to.equal(scan)

            describe 'Volume', ->
              volume = null
              mockVolume = mockScan.registrations[0].volumes.images[0]

              beforeEach ->
                try
                  volume = registration.volumes.images[0]
                catch TypeError
                  # There is not a volumes array.

              it 'should have a registration volume', ->
                expect(registration.volumes, "The registration is missing volumes")
                  .to.exist
                expect(registration.volumes.images.length,
                       "The registration volumes length is incorrect").to.equal(1)

              it 'should reference the registration', ->
                expect(volume.registration,
                       "The volume is missing the registration reference").to.exist
                expect(volume.registration,
                       "The volume registration reference is incorrect")
                  .to.equal(registration)

              it 'should alias the imageSequence reference to the registration', ->
                expect(volume.imageSequence,
                       "The volume is missing the imageSequence alias").to.exist
                expect(volume.imageSequence,
                       "The volume imageSequence alias is incorrect")
                   .to.equal(registration)

              it 'should have a volume number', ->
                expect(volume.number, "The volume number is missing").to.exist
                expect(volume.number, "The volume number is incorrect")
                  .to.equal(1)

              it 'should have a name', ->
                expect(volume.name, "The name is missing").to.exist
                expect(volume.name, "The name is incorrect")
                  .to.equal(mockVolume.name)

              it 'should have an intensity', ->
                expect(volume.averageIntensity, "The voume intensity is missing")
                  .to.exist
                expect(volume.averageIntensity,
                       "The registration intensity is incorrect")
                  .to.equal(mockVolume.average_intensity)
