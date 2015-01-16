# The Router unit test.
#
# Note: image detail load cannot be unit-tested, since it requires an
# active browser.
define ['angular', 'lodash', 'ngmocks', 'expect', 'moment', 'router'],
  (ng, _, mocks, expect, moment, router) ->
    describe 'Unit Testing the Router', ->
      # The mock Router service module.
      Router = null

      # The mock Angular $http service provider.
      $httpBackend = null

      $rootScope = null

      # The mock objects.
      mock =
        subject:
          project: 'QIN_Test'
          collection: 'Breast'
          number: 1
          detail: 'a'
        subject_detail:
          _id: 'a'
          birth_date: moment([1961, 6, 7]).valueOf()
          scan_sets:
            t1:
              modeling: [
                results: [
                  delta_k_trans:
                    average: 2.6
                ]
              ]
            t2:
              modeling: [
                results: [
                  delta_k_trans:
                    average: 2.4
                ]
              ]
          registration_configurations:
            reg_01:
              modeling: [
                results: [
                  delta_k_trans:
                    average: 2.3
                ]
              ]
            reg_02:
              modeling: [
                results: [
                  delta_k_trans:
                    average: 2.1
                ]
              ]
          sessions: [
            number: 1
            acquisition_date: moment('July 1, 2013').valueOf()
            detail: 'b'
          ]
          encounters: [
            _cls: 'Biopsy'
            date: moment('July 12, 2013').valueOf()
            pathology:
              _cls: 'BreastPathology'
              tnm:
                size: 'T3'
          ]
          treatments: [
            treatment_type: 'neodjuvant'
            begin_date: moment('June 4, 2013').valueOf()
            end_date: moment('July 16, 2013').valueOf()
          ]
        session_detail:
          _id: 'b'
          scans:
            t1:
              name: 't1'
              intensity:
                intensities: [2.4]
              registration:
                reg_01:
                  intensity:
                    intensities: [3.1]

      beforeEach ->
        # Fake the router service module.
        ng.mock.module('qiprofile.router')

        inject ['Router', '$httpBackend', '$rootScope',
          (_Router_, _$httpBackend_, _$rootScope_) ->
            Router = _Router_
            $httpBackend = _$httpBackend_
            $rootScope = _$rootScope_

            # The mock subjects http call.
            url = encodeURI('/api/subjects?where=' +
                            '{"project":"QIN_Test","collection":"Breast","number":1}')
            $httpBackend.whenGET(url).respond(JSON.stringify(_items: [mock.subject]))

            # The mock subject-detail http call.
            url = encodeURI('/api/subject-detail/a')
            $httpBackend.whenGET(url).respond(JSON.stringify(mock.subject_detail))

            # The mock session-detail http call.
            url = encodeURI('/api/session-detail/b')
            $httpBackend.whenGET(url).respond(JSON.stringify(mock.session_detail))
        ]

      afterEach ->
        $httpBackend.verifyNoOutstandingExpectation()
        $httpBackend.verifyNoOutstandingRequest()

      describe.only 'Subject', ->
        subject = null

        beforeEach ->
          subject = _.clone(mock.subject)

        # Validates the resolved subject.
        validate = (subject) ->
          # There should be an age.
          expect('birthDate' of subject, "Subject is missing a birthDate property")
            .to.be.true
          expect(subject.birthDate, "Subject is missing a birth date").to.exist
          expect(subject.birthDate.valueOf(), "Subject birth date is incorrect")
            .to.equal(mock.subject_detail.birth_date)

          # There should be encounters.
          expect(subject.encounters, "Subject is missing encounters").to.exist
          expect(subject.encounters.length, "Subject encounters length is incorrect")
            .to.equal(1)
          enc = subject.encounters[0]
          expect(enc._cls, "Encounter type is incorrect")
            .to.equal(mock.subject_detail.encounters[0]._cls)

          # There should be treatments.
          expect(subject.treatments, "Subject is missing treatments").to.exist
          expect(subject.treatments.length, "Subject encounters length is incorrect")
            .to.equal(1)
          trt = subject.treatments[0]
          expect(trt.treatment_type, "Treatment type is incorrect")
            .to.equal(mock.subject_detail.treatments[0].treatment_type)
          expect(trt.begin_date.valueOf(), "Treatment begin date is incorrect")
            .to.equal(mock.subject_detail.treatments[0].begin_date)

          # Validate the modeling.
          expect(subject.modeling, "Subject is missing modeling").to.exist
          # There are two registration modeling objects.
          regMdl = subject.modeling.registration
          expect(regMdl, "The subject modeling registration is missing")
            .to.exist
          expect(regMdl.length, "The subject modeling registration count" +
                                " is incorrect")
            .to.equal(2)
          # There are two scan modeling objects.
          scanMdl = subject.modeling.scan
          expect(scanMdl, "The subject modeling scan is missing").to.exist
          expect(scanMdl.length, "The subject modeling registration count" +
                                 " is incorrect")
            .to.equal(2)
          # The scan modeling is for the T1 scan.
          mdl = subject.modeling.scan[0]
          expect(mdl.source, "Modeling is missing a source").to.exist
          expect(mdl.source.key, "Modeling source is missing the key")
            .to.exist
          expect(mdl.source.key, "Modeling source key is incorrect")
            .to.equal('t1')
          mockMdl = mock.subject_detail.scan_sets.t1.modeling[0]
          expect(mdl.results, "Modeling is missing results").to.exist
          expect(mdl.results.length, "Modeling results count is incorrect").
            to.equal(1)
          mdlResult = mdl.results[0]
          expect(mdlResult.deltaKTrans, "Modeling results is missing deltaKTrans")
            .to.exist
          expect(mdlResult.deltaKTrans.average, "Modeling deltaKTrans is incorrect")
            .to.equal(mockMdl.results[0].delta_k_trans.average)
          # The modeling result object refers to its respective session.
          expect(mdlResult.session, "Modeling results is missing session").to.exist
          expect(mdlResult.session, "Modeling results session is incorrect")
            .to.equal(subject.sessions[0])

          # There should be sessions.
          expect(subject.sessions, "Subject is missing sessions").to.exist
          expect(subject.sessions.length, "Subject sessions length is incorrect")
            .to.equal(1)
          expect(subject.isMultiSession, "Subject multi-session flag is incorrect")
            .to.be.false
          sess = subject.sessions[0]

          # There should be a parent subject.
          expect(sess.subject, "Session is missing a subject").to.exist

        it 'should fetch the subject by the secondary key properties', ->
          Router.getSubject(subject).then ->
            validate(subject)
          # Dispatch the backend request.
          $httpBackend.flush()

      describe 'Session Detail', ->
        mockSession = null

        # Validates the resolved session.
        validate = (session) ->
          scan = session.scans.t1
          expect(scan, "Session is missing the T1 scan").to.exist
          mockScan = mock.session_detail.scans.t1
          expect(scan.intensity, "Session scan is incorrect")
            .to.deep.eql(mockScan.intensity)
          expect(scan.intensity, "Session scan is incorrect")
            .to.deep.eql(mockScan.intensity)
          regs = scan.registration
          expect(scan.registration, "Session is missing the T1 registration")
            .to.exist
          reg = scan.registration.reg_01
          expect(reg, "Session is missing the T1 reg_01 registration").to.exist
          mock_reg = mock.session_detail.scans.t1.registration.reg_01
          expect(reg.intensity, "Session registration is incorrect")
            .to.deep.eql(mock_reg.intensity)

        beforeEach ->
          mockSession = mock.subject_detail.sessions[0]
          # The session subject reference is set in the routes
          # session resolution.
          mockSession.subject = mock.subject

        it 'should fetch the session detail', ->
          session = _.clone(mockSession)
          Router.getSessionDetail(session).then ->
            validate(session)
          # Dispatch the backend request.
          $httpBackend.flush()

      describe 'Scan', ->
        mockSession = null

        beforeEach ->
          mockSession = _.clone(mock.subject_detail.sessions[0])
          # The session subject reference is set in the routes
          # session resolution.
          mockSession.subject = mock.subject

        it 'should find the scan container in a fetched session', ->
          session = _.clone(mockSession)
          session.scans = mock.session_detail.scans
          mockScan = mock.session_detail.scans.t1
          actual = Router.getScan(session, mockScan.name)
          expect(actual, 'Image container missing').to.exist
          expect(actual, 'Image container incorrect')
            .to.equal(mock.session_detail.scans.t1)

        it 'should fetch a session if necessary to obtain the scan', ->
          session = _.clone(mockSession)
          mockScan = mock.session_detail.scans.t1
          Router.getScan(session, mockScan.name).then (container) ->
            expect(container, 'Image container missing').to.exist
            expect(container.intensity, 'Image container intensity incorrect').
              to.eql(mockScan.intensity)

          # Dispatch the backend request.
          $httpBackend.flush()
