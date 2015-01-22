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
              registration:
                reg_01:
                  modeling:
                    pk_01:
                      results: [
                        delta_k_trans:
                          average: 2.3
                      ]
                reg_02:
                  modeling:
                    pk_02:
                      results: [
                        delta_k_trans:
                          average: 2.1
                      ]
              modeling:
                pk_03:
                  results: [
                    delta_k_trans:
                      average: 2.6
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
                reg_02:
                  intensity:
                    intensities: [2.7]

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

      describe 'Subject', ->
        subject = null

        beforeEach ->
          subject = _.clone(mock.subject)
          Router.getSubject(subject)
          $httpBackend.flush()

        it 'should set the subject birth date', ->
          expect(subject.birthDate, "Subject is missing a birth date").to.exist
          expect(subject.birthDate.valueOf(), "Subject birth date is incorrect")
            .to.equal(mock.subject_detail.birth_date)
        
        it 'should set the subject encounters', ->
          expect(subject.encounters, "Subject is missing encounters").to.exist
          expect(subject.encounters.length, "Subject encounters length is" +
                                            " incorrect").to.equal(1)
          enc = subject.encounters[0]
          expect(enc._cls, "Encounter type is incorrect")
            .to.equal(mock.subject_detail.encounters[0]._cls)
          
        it 'should extend the subject treatments', ->
          expect(subject.treatments, "Subject is missing treatments").to.exist
          expect(subject.treatments.length, "Subject encounters length is" +
                                            " incorrect").to.equal(1)
          trt = subject.treatments[0]
          expect(trt.treatmentType, "Treatment type is incorrect")
            .to.equal(mock.subject_detail.treatments[0].treatment_type)
          expect(trt.begin_date.valueOf(), "Treatment begin date is incorrect")
            .to.equal(mock.subject_detail.treatments[0].begin_date)
          
        it 'should set the subject modeling', ->
          expect(subject.modeling, "Subject is missing modeling").to.exist
          # There are two registration modeling objects.
          regMdl = subject.modeling.registration
          expect(regMdl, "The subject modeling registration is missing")
            .to.exist
          expect(regMdl.length, "The subject modeling registration count" +
                                " is incorrect")
            .to.equal(2)
          # There is one scan modeling objects.
          scanMdl = subject.modeling.scan
          expect(scanMdl, "The subject modeling scan is missing").to.exist
          expect(scanMdl.length, "The subject modeling registration count" +
                                 " is incorrect")
            .to.equal(1)
          # The scan modeling is for the T1 scan.
          mdl = subject.modeling.scan[0]
          expect(mdl.key, "Modeling is missing a key").to.exist
          expect(mdl.source, "Modeling is missing a source").to.exist
          expect(mdl.source.scanType, "The scan modeling source is missing" +
                                      " the scan type").to.exist
          expect(mdl.source.scanType, "Modeling source scan type is incorrect")
            .to.equal('t1')
          mockMdl = mock.subject_detail.scan_sets.t1.modeling.pk_03
          expect(mdl.results, "Modeling is missing results").to.exist
          expect(mdl.results.length, "Modeling results count is incorrect").
            to.equal(1)
          mdlResult = mdl.results[0]
          expect(mdlResult.deltaKTrans, "Modeling results is missing" +
                                        " deltaKTrans").to.exist
          expect(mdlResult.deltaKTrans.average, "Modeling deltaKTrans is" +
                                                " incorrect")
            .to.equal(mockMdl.results[0].delta_k_trans.average)
          # The modeling result object refers to its respective session.
          expect(mdlResult.session, "Modeling results is missing session")
            .to.exist
          expect(mdlResult.session, "Modeling results session is incorrect")
            .to.equal(subject.sessions[0])
          
        it 'should reflect the subject sessions', ->
          expect(subject.sessions, "Subject is missing sessions").to.exist
          expect(subject.sessions.length, "Subject sessions length is" +
                                          " incorrect").to.equal(1)
          expect(subject.isMultiSession, "Subject multi-session flag is" +
                                         " incorrect").to.be.false

        describe 'Session', ->
          mockSession = null
          session = null

          beforeEach ->
            session = _.clone(subject.sessions[0])
            Router.getSessionDetail(session)
            $httpBackend.flush()
          
          it 'should set the session subject reference', ->
            expect(session.subject, "Session is missing a subject reference")
              .to.exist
            expect(session.subject, "Session subject reference is incorrect")
              .to.equal(subject)

          describe 'Scan', ->
            scan = null
           
            beforeEach ->
              scan = Router.getScan(session, 't1')
           
            it 'should extend the session scan', ->
              expect(scan, "The session is missing the T1 scan").to.exist
              expect(scan.session, "The session T1 scan is missing the" +
                                   " session reference").to.exist
              expect(scan.session, "The session T1 scan subject reference" +
                                   " is incorrect").to.equal(session)
           
            it 'should set the session scan intensity', ->
              mockIntensity = mock.session_detail.scans.t1.intensity
              expect(scan.intensity, "The scan intensity is incorrect")
                .to.deep.eql(mockIntensity)

            describe 'Registration', ->
              registration = null

              beforeEach ->
                registration = Router.getRegistration(scan, 'reg_01')

              it 'should extend the registration', ->
                expect(registration, "The scan is missing the reg_01" +
                                     " registration").to.exist
                expect(registration.scan, "The registration is missing the" +
                                          " scan reference").to.exist
                expect(registration.scan, "The registration scan reference" +
                                          " is incorrect").to.equal(scan)
                mock_reg = mock.session_detail.scans.t1.registration.reg_01
                expect(registration.intensity, "The registration intensity" +
                                               " is incorrect")
                  .to.deep.eql(mock_reg.intensity)
