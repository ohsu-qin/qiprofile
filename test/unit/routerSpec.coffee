define ['lodash', 'ngmocks', 'expect', 'router', 'moment'],
  (_, mocks, expect, router, moment) ->
    describe 'Unit Testing Router', ->
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
          sessions: [
            number: 1
            acquisition_date: moment('July 1, 2013').valueOf()
            detail: 'b'
            modeling: [
              name: 'pk_aUjr'
              image_container_name: 'reg_8L3W'
              fxlKTrans: 2.3
              fxrKTrans: 2.5
            ]
          ]
          encounters: [
            encounter_type: 'Biopsy'
            date: moment('July 12, 2013').valueOf()
            outcomes: [
              _cls: 'BreastPathology'
              tnm:
                size: 'T3'
            ]
          ]
          treatments: [
            treatment_type: 'neodjuvant'
            begin_date: moment('June 4, 2013').valueOf()
            end_date: moment('July 16, 2013').valueOf()
          ]
        session_detail:
          _id: 'b'
          scan:
            name: 'scan'
            intensity:
              intensities: [2.4]
          registrations: [
            name: 'reg_test'
            intensity:
              intensities: [3.1]
          ]

      beforeEach ->
        # Fake the router service module.
        angular.mock.module('qiprofile.router')

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

      describe 'Subject Detail', ->
        # Validates the resolved subject.
        validate = (subject) ->
          # There should be an age.
          expect('age' of subject, "Subject is missing an age property").to.be.true
          expect(subject.age, "Subject is missing an age").to.exist
          nowish = moment([moment().year(), 6, 7])
          expect(subject.age, "Subject age is incorrect")
            .to.equal(nowish.diff(mock.subject_detail.birth_date, 'years'))
          # There should be encounters.
          expect(subject.encounters, "Subject is missing encounters").to.exist
          expect(subject.encounters.length, "Subject encounters length is incorrect")
            .to.equal(1)
          enc = subject.encounters[0]
          expect(enc.encounter_type, "Encounter type is incorrect")
            .to.equal(mock.subject_detail.encounters[0].encounter_type)
          # There should be treatments.
          expect(subject.treatments, "Subject is missing treatments").to.exist
          expect(subject.treatments.length, "Subject encounters length is incorrect")
            .to.equal(1)
          trt = subject.treatments[0]
          expect(trt.treatment_type, "Treatment type is incorrect")
            .to.equal(mock.subject_detail.treatments[0].treatment_type)
          expect(trt.begin_date.valueOf(), "Treatment begin date is incorrect")
            .to.equal(mock.subject_detail.treatments[0].begin_date)
          # There should be sessions.
          expect(subject.sessions, "Subject is missing sessions").to.exist
          expect(subject.sessions.length, "Subject sessions length is incorrect")
            .to.equal(1)
          expect(subject.isMultiSession, "Subject multi-session flag is incorrect")
            .to.be.false
          sess = subject.sessions[0]
          # There should be a parent subject.
          expect(sess.subject, "Session is missing a subject").to.exist
          # Validate the modeling.
          expect(sess.modeling, "Session is missing modeling").to.exist
          # TODO - replace the assignment below for multiple
          # modeling results per session.
          #expect(sess.modeling.length).to.equal(1)
          #mdl = sess.modeling[0]
          mdl = sess.modeling
          expect(mdl.deltaKTrans, "Modeling is missing a delta Ktrans")
            .to.exist
          mock_mdl = mock.subject_detail.sessions[0].modeling[0]
          expectedDeltaKTrans = mock_mdl.fxrKTrans - mock_mdl.fxlKTrans
          expect(mdl.deltaKTrans, "Delta Ktrans is not #{ expectedDeltaKTrans }")
            .to.be.closeTo(expectedDeltaKTrans, 0.0000001)

        it 'should fetch the detail with a detail property', ->
          subject = _.clone(mock.subject)
          Router.getSubjectDetail(subject).then ->
            validate(subject)
          # Dispatch the backend request.
          $httpBackend.flush()

        it 'should fetch the detail without a detail property', ->
          subject = _.omit(mock.subject, 'detail')
          Router.getSubjectDetail(subject).then ->
            validate(subject)
          # Dispatch the backend request.
          $httpBackend.flush()

      describe 'Session Detail', ->
        mock_session = null

        # Validates the resolved session.
        validate = (session) ->
          expect(session.scan, "Session scan is missing").to.exist
          expect(session.scan.intensity, "Session scan is incorrect")
            .to.deep.eql(mock.session_detail.scan.intensity)
          expect(session.registrations.length,
               "Session registrations count is incorrect")
            .to.equal(1)
          reg = session.registrations[0]
          mock_reg = mock.session_detail.registrations[0]
          expect(reg.intensity, "Session registration is incorrect")
            .to.deep.eql(mock_reg.intensity)

        beforeEach ->
          mock_session = mock.subject_detail.sessions[0]
          # The session subject reference is set in the routes
          # session resolution.
          mock_session.subject = mock.subject

        it 'should fetch the detail with a session detail property', ->
          session = _.clone(mock_session)
          Router.getSessionDetail(session).then ->
            validate(session)
          # Dispatch the backend request.
          $httpBackend.flush()

        it 'should fetch the detail without a detail property', ->
          session = _.omit(mock_session, 'detail')
          session.subject = _.clone(mock.subject)
          Router.getSessionDetail(session).then ->
            validate(session)
          # Dispatch the backend request.
          $httpBackend.flush()

      describe 'Image Container', ->
        mock_session = null

        # Validates the resolved container.
        validate = (image) ->
          expect(session.scan, "Session scan is missing").to.exist
          expect(session.scan.intensity, "Session scan is incorrect")
            .to.deep.eql(mock.session_detail.scan.intensity)
          expect(session.registrations.length,
               "Session registrations count is incorrect")
            .to.equal(1)
          reg = session.registrations[0]
          mock_reg = mock.session_detail.registrations[0]
          expect(reg.intensity, "Session registration is incorrect")
            .to.deep.eql(mock_reg.intensity)

        beforeEach ->
          mock_session = mock.subject_detail.sessions[0]
          # The session subject reference is set in the routes
          # session resolution.
          mock_session.subject = mock.subject

        it 'should find the scan container in a fetched session', ->
          session = _.clone(mock_session)
          session.scan = mock.session_detail.scan
          actual = Router.getImageContainer(session, session.scan.name)
          expect(actual, 'Image container missing').to.exist
          expect(actual, 'Image container incorrect')
            .to.equal(mock.session_detail.scan)

        it 'should fetch a session if necessary to obtain the scan container', ->
          session = _.omit(mock_session, 'detail')
          session.subject = _.clone(mock.subject)
          Router.getImageContainer(session, mock.session_detail.scan.name).then (container) ->
            expect(container, 'Image container missing').to.exist
            expect(container.intensity, 'Image container intensity incorrect').
              to.eql(mock.session_detail.scan.intensity)
          
          # Dispatch the backend request.
          $httpBackend.flush()
