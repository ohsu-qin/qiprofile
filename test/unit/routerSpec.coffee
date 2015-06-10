# The Router unit test.
#
# Note: image load cannot be unit-tested, since it requires an
# active browser.
define ['ngmocks', 'lodash', 'expect', 'moment', 'router', 'helpers'],
  (ng, _, expect, moment, router) ->
    describe 'Unit Testing the Router', ->

      # The mock Router service module.
      Router = null

      # The mock Angular $http service provider.
      $httpBackend = null

      $rootScope = null

      # The mock objects.
      mock =
        protocol:
          scan:
            _id: 'sp1'
            scan_type: 'T1'
            orientation: 'axial'
          registration:
            _id: 'rp1'
            technique: 'ANTS'
          modeling:
            _id: 'mp1'
            technique: 'Tofts'
        subject:
          _id: 's1'
          project: 'QIN_Test'
          collection: 'Breast'
          number: 1
          birth_date: moment('August 21, 1986').valueOf()
          encounters: [
            {
              _cls: 'Session'
              number: 1
              acquisition_date: moment('July 1, 2013').valueOf()
              detail: 'sd1'
              modelings: [
                {
                  resource: 'pk_01'
                  protocol: 'mp1'
                  source:
                    registration: 'rp1'
                  result:
                    delta_k_trans:
                      filename: "path/to/first/delta_k_trans.nii.gz"
                      average: 2.3
                      label_map:
                        filename: "path/to/first/delta_k_trans_color.nii.gz"
                        color_table: "path/to/color_table.txt"
                }
              ]
            }
            {
              _cls: 'Session'
              number: 2
              acquisition_date: moment('August 1, 2013').valueOf()
              detail: 'sd2'
              modelings: [
                {
                  resource: 'pk_02'
                  protocol: 'mp1'
                  source:
                    registration: 'rp1'
                  result:
                    delta_k_trans:
                      filename: "path/to/second/delta_k_trans.nii.gz"
                      average: 2.4
                      label_map:
                        filename: "path/to/second/delta_k_trans_color.nii.gz"
                        color_table: "path/to/color_table.txt"
                }
              ]
            }
            {
              _cls: 'Biopsy'
              date: moment('July 12, 2013').valueOf()
              pathology:
                _cls: 'BreastPathology'
                tnm:
                  size: 'T3'
            }
          ]
          treatments: [
            treatment_type: 'neodjuvant'
            begin_date: moment('June 4, 2013').valueOf()
            end_date: moment('July 16, 2013').valueOf()
          ]

        session_detail:
          sd1:
            _id: 'sd1'
            scans: [
              {
                _cls: 'Scan'
                number: 1
                protocol: 'sp1'
                volumes: [
                  {
                    filename: 'path/to/first/scan/volume001.nii.gz'
                    average_intensity: 2.4
                  }
                ]  
                registrations: [
                  {
                    _cls: 'Registration'
                    resource: 'reg_01'
                    protocol: 'rp1'
                    volumes: [
                      {
                        filename: 'path/to/first/registration/volume001.nii.gz'
                        average_intensity: 3.1
                      }
                    ]
                  }
                ]
              }
            ]
          sd2:
            _id: 'sd2'
            scans: [
              {
                _cls: 'Scan'
                number: 1
                protocol: 'sp1'
                volumes: [
                  {
                    filename: 'path/to/second/scan/volume001.nii.gz'
                    average_intensity: 2.5
                  }
                ]  
                registrations: [
                  {
                    _cls: 'Registration'
                    resource: 'reg_02'
                    protocol: 'rp1'
                    volumes: [
                      {
                        filename: 'path/to/second/registration/volume001.nii.gz'
                        average_intensity: 2.7
                      }
                    ]
                  }
                ]
              }
            ]

      beforeEach ->
        # Fake the router service module.
        ng.module('qiprofile.router')

        inject ['Router', '$httpBackend', '$rootScope',
          (_Router_, _$httpBackend_, _$rootScope_) ->
            Router = _Router_
            $httpBackend = _$httpBackend_
            $rootScope = _$rootScope_

            # The mock subjects http call.
            url = encodeURI('/api/subject?where=' +
                            '{"project":"QIN_Test","collection":"Breast","number":1}')
            $httpBackend.whenGET(url).respond(JSON.stringify(_items: [mock.subject]))

            # The mock subject http call.
            url = encodeURI('/api/subject/s1')
            $httpBackend.whenGET(url).respond(JSON.stringify(mock.subject))

            # The mock session-detail http call.
            url = encodeURI('/api/session-detail/sd1')
            $httpBackend.whenGET(url).respond(JSON.stringify(mock.session_detail.sd1))
            url = encodeURI('/api/session-detail/sd2')
            $httpBackend.whenGET(url).respond(JSON.stringify(mock.session_detail.sd2))

            # The mock scan protocol http call.
            url = encodeURI('/api/scan-protocol/sp1')
            $httpBackend.whenGET(url).respond(JSON.stringify(mock.scan_protocol))

            # The mock registration protocol http call.
            url = encodeURI('/api/registration-protocol/rp1')
            $httpBackend.whenGET(url).respond(JSON.stringify(mock.registration_protocol))

            # The mock modeling protocol http call.
            url = encodeURI('/api/modeling-protocol/mp1')
            $httpBackend.whenGET(url).respond(JSON.stringify(mock.modeling_protocol))
        ]

      afterEach ->
        $httpBackend.verifyNoOutstandingExpectation()
        $httpBackend.verifyNoOutstandingRequest()

      describe.only 'Subject', ->
        subject = null

        beforeEach ->
          condition = id: mock.subject._id
          Router.getSubject(condition).then (fetched) ->
            subject = fetched
          $httpBackend.flush()

        it 'should fetch the subject by id', ->
          expect(subject, "Subject not fetched").to.exist

        it 'should fetch the subject by _id', ->
          condition = _id: mock.subject._id
          subject = Router.getSubject(condition)
          expect(subject, "Subject not fetched").to.eventually.exist
          $httpBackend.flush()

        it 'should fetch the subject by secondary key', ->
          condition =
            project: mock.subject.project
            collection: mock.subject.collection
            number: mock.subject.number
          subject = Router.getSubject(condition)
          expect(subject, "Subject not fetched").to.eventually.exist
          $httpBackend.flush()

        it 'should have subject encounters', ->
          expect(subject.encounters, "Subject is missing encounters").to.exist
          expect(subject.encounters.length,
                "Subject encounters length is incorrect").to.equal(3)

        describe 'Demographics', ->
          # Validate the birth date.
          it 'should anonymize the subject birth date', ->
            expect(subject.birthDate, "Subject is missing a birth date")
              .to.exist
            expect(subject.birthDate.valueOf(), "Subject birth date is incorrect")
              .to.equal(moment('July 7, 1986').valueOf())

        describe 'Clinical', ->
          # Validate the clinical encounters.
          it 'should set the clinical encounters', ->
            expect(subject.clinicalEncounters,
                   "Subject is missing clinical encounters")
              .to.exist
            expect(subject.clinicalEncounters.length,
                   "Subject clinical encounters length is incorrect")
              .to.equal(1)

          # Validate the treatments.
          it 'should extend the subject treatments', ->
            expect(subject.treatments, "Subject is missing treatments")
              .to.exist
            expect(subject.treatments.length, "Subject encounters length" +
                                              " is incorrect").to.equal(1)
            trt = subject.treatments[0]
            mockTrt = mock.subject.treatments[0]
            expect(trt.treatmentType, "Treatment type is missing").to.exist
            expect(trt.treatmentType, "Treatment type is incorrect")
              .to.equal(mockTrt.treatment_type)
            expect(trt.begin_date.valueOf(),
                   "Treatment begin date is incorrect")
              .to.equal(mockTrt.begin_date)

        describe 'Modeling', ->
          modeling = null

          beforeEach ->
            try
              modeling = subject.modelings[0]
            catch TypeError
              # There is not a modelings array.

          it 'should have a subject modelings object', ->
            expect(subject.modelings, "Subject is missing modelings")
              .to.exist

          it 'should have one modeling object', ->
            expect(subject.modelings.length,
                   "Subject modelings count is incorrect").to.equal(1)
            expect(modeling, "Subject modeling is missing").to.exist

          describe 'Source', ->
            source = null

            beforeEach ->
              source = modeling.source

            it 'should have a source', ->
              expect(source, "Subject modeling does not reference a source")
                .to.exist

            it 'should reference the registration protocol', ->
              expect(source.registration,
                     "Subject modeling does not reference a source").to.exist
              expect(source.registration,
                     "Subject modeling source does not reference the" +
                     " registration protocol")
                .to.equal(mock.protocol.registration._id)

          describe 'Result', ->
            result = null

            beforeEach ->
              try
                result = modeling.results[0]
              catch TypeError
                # There is not a results array.

            it 'should have a result for each session', ->
              expect(modeling.results.length,
                     "Subject modeling results length is incorrect")
                .to.equal(2)
              expect(result, "Subject modeling result is missing").to.exist

            it 'should have a delta Ktrans value', ->
              expect(result.delta_k_trans,
                     "Modeling does not have a delta Ktrans result")
                .to.exist

            it 'should reflect the session modeling delta Ktrans value', ->
              mockResult = mock.subject.encounters[0].modelings[0].result
              expect(result.delta_k_trans.average,
                     "Modeling delta Ktrans result is incorrect")
                .to.equal(mockResult.delta_k_trans.average)            

        describe 'Session', ->
          session = null

          beforeEach ->
            try
              session = subject.sessions[0]
            catch TypeError
              # There is not a sessions array.

          # Validate the sessions (without detail).
          it 'should have a subject session', ->
            expect(subject.sessions, "Subject is missing sessions").to.exist
            expect(subject.sessions.length,
                   "Subject session count is incorrect")
              .to.equal(2)

          it 'should set the subject multiSession flag', ->
            expect(subject.isMultiSession, "Subject multi-session flag is" +
                                           " incorrect").to.be.true

          describe 'Modeling', ->
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
            session = null

            beforeEach ->
              session = _.clone(subject.sessions[0])
              try
                Router.getSessionDetail(session)
                $httpBackend.flush()
              catch ReferenceError
                # Router couldn't fetch the session detail.

            it 'should set the session subject reference', ->
              expect(session.subject, "Session is missing a subject reference")
                .to.exist
              expect(session.subject, "Session subject reference is incorrect")
                .to.equal(subject)

            describe 'Scan', ->
              scan = null
              mockScan = mock.session_detail.sd1.scans[0]

              beforeEach ->
                try
                  scan = Router.getScan(session, 1)
                catch ReferenceError
                  # Router couldn't resolve the scan.

              it 'should have a session scan', ->
                expect(scan, "The session is missing the scan").to.exist

              it 'should reference the session', ->
                expect(scan.session, "The scan is missing the session" +
                                     " reference").to.exist
                expect(scan.session, "The scan session reference is incorrect")
                   .to.equal(session)

              describe 'Volume', ->
                volume = null
                mockVolume = mockScan.volumes[0]

                beforeEach ->
                  try
                    volume = scan.volumes[0]
                  catch TypeError
                    # There is not a volumes array.

                it 'should have a scan volume', ->
                  expect(scan.volumes, "The scan is missing volumes").to.exist
                  expect(scan.volumes.length,
                         "The scan volumes length is incorrect").to.equal(1)

                it 'should reference the scan', ->
                  expect(volume.scan, "The volume is missing the scan reference")
                    .to.exist
                  expect(volume.scan, "The volume scan reference is incorrect")
                     .to.equal(scan)

                it 'should alias the container reference to the scan', ->
                  expect(volume.container,
                         "The volume is missing the container alias").to.exist
                  expect(volume.container,
                         "The volume container alias is incorrect").to.equal(scan)

                it 'should have a volume number', ->
                  expect(volume.number, "The volume number is missing").to.exist
                  expect(volume.number, "The volume number is incorrect")
                    .to.equal(1)

                it 'should have a filename', ->
                  expect(volume.filename, "The filename is missing").to.exist
                  expect(volume.filename, "The filename is incorrect")
                    .to.equal(mockVolume.filename)

                it 'should have an intensity', ->
                  expect(volume.averageIntensity, "The voume intensity is missing")
                    .to.exist
                  expect(volume.averageIntensity, "The scan intensity is incorrect")
                    .to.equal(mockVolume.average_intensity)

                it 'should create the scan volume image object on demand', ->
                  expect(volume.image, "The scan volume image object is missing")
                    .to.exist
                  # Note: the image object content is tested in imageSpec.coffee.

              describe 'Registration', ->
                registration = null

                beforeEach ->
                  try
                    registration = Router.getRegistration(scan, 'reg_01')
                  catch ReferenceError
                    # Router couldn't resolve the registration.

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
                  mockVolume = mockScan.registrations[0].volumes[0]

                  beforeEach ->
                    try
                      volume = registration.volumes[0]
                    catch TypeError
                      # There is not a volumes array.

                  it 'should have a registration volume', ->
                    expect(registration.volumes, "The registration is missing volumes")
                      .to.exist
                    expect(registration.volumes.length,
                           "The registration volumes length is incorrect").to.equal(1)

                  it 'should reference the registration', ->
                    expect(volume.registration,
                           "The volume is missing the registration reference").to.exist
                    expect(volume.registration,
                           "The volume registration reference is incorrect")
                      .to.equal(registration)

                  it 'should alias the container reference to the registration', ->
                    expect(volume.container,
                           "The volume is missing the container alias").to.exist
                    expect(volume.container,
                           "The volume container alias is incorrect")
                       .to.equal(registration)

                  it 'should have a volume number', ->
                    expect(volume.number, "The volume number is missing").to.exist
                    expect(volume.number, "The volume number is incorrect")
                      .to.equal(1)

                  it 'should have a filename', ->
                    expect(volume.filename, "The filename is missing").to.exist
                    expect(volume.filename, "The filename is incorrect")
                      .to.equal(mockVolume.filename)

                  it 'should have an intensity', ->
                    expect(volume.averageIntensity, "The voume intensity is missing")
                      .to.exist
                    expect(volume.averageIntensity,
                           "The registration intensity is incorrect")
                      .to.equal(mockVolume.average_intensity)

                  it 'should create the scan volume image object on demand', ->
                    expect(volume.image, "The scan volume image object is missing")
                      .to.exist
                    # Note: the image object content is tested in imageSpec.coffee.
