define ['lodash', 'ngmocks', 'expect', 'router'],
  (_, mocks, expect, router) ->
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
          sessions: [
            number: 1
            detail: 'b'
            modeling: [
              name: 'pk_aUjr'
              image_container_name: 'reg_8L3W'
              fxl_k_trans: 2.3
              fxr_k_trans: 2.5
            ]
          ]
          encounters: [
            encounter_type: 'Biopsy'
            outcomes: [
              _cls: 'BreastPathology'
              tnm:
                size: 'T3'
            ]
          ]
        session_detail:
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
          expect(subject.sessions, "Subject is missing sessions").to.exist
          expect(subject.sessions.length).to.equal(1)
          expect(subject.isMultiSession).to.be.false
          sess = subject.sessions[0]
          expect(sess.subject, "Session is missing a subject").to.exist
          expect(sess.modeling, "Session is missing modeling").to.exist
          # TODO - replace the assignment below for multiple
          # modeling results per session.
          #expect(sess.modeling.length).to.equal(1)
          #mdl = sess.modeling[0]
          mdl = sess.modeling
          expect(mdl.delta_k_trans, "Modeling is missing a delta Ktrans")
            .to.exist
          mock_mdl = mock.subject_detail.sessions[0].modeling[0]
          mock_delta_k_trans = mock_mdl.fxr_k_trans - mock_mdl.fxl_k_trans
          expect(mdl.delta_k_trans, "Delta Ktrans is not #{ mock_delta_k_trans }")
            .to.be.closeTo(mock_delta_k_trans, 0.0000001)

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
