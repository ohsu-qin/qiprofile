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
            intensity:
              intensities: [2.4]
          registrations: [
            intensity:
              intensities: [3.1]
          ]

      beforeEach ->
        # Fake the service module.
        angular.mock.module('qiprofile.router')

        inject ['Router', '$httpBackend', '$rootScope', (_Router_, _$httpBackend_, _$rootScope_) ->
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
        it 'should fetch the subject when the fetch flag is set', ->
          # "Fetch" the subject.
          params = _.extend({fetch: true}, _.omit(mock.subject, 'detail'))
          Router.getSubject(params).then (actual) ->
              expect(_.pairs(actual), "Subject with fetch incorrect")
                .to.deep.have.members(_.pairs(mock.subject))
          # Dispatch the backend request.
          $httpBackend.flush()
    
        it 'should not fetch the subject when the fetch flag is not set', ->
          # The router ignores the detail parameter.
          params = _.omit(mock.subject, 'detail')
          Router.getSubject(params).then (actual) ->
            expect(_.pairs(actual), "Subject without fetch incorrect")
              .to.deep.have.members(_.pairs(params))
          # Resolve the pending promise.
          $rootScope.$apply()

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

        it 'should fetch the detail with a subject detail property', ->
          subject = _.clone(mock.subject)
          Router.getSubjectDetail(subject, {}).then ->
            validate(subject)
          # Dispatch the backend request.
          $httpBackend.flush()
  
        it 'should fetch the detail with a detail query parameter', ->
          subject = _.omit(mock.subject, 'detail')
          Router.getSubjectDetail(subject, detail: mock.subject.detail).then ->
            validate(subject)
          # Dispatch the backend request.
          $httpBackend.flush()

        it 'should fetch the detail without a detail property or parameter', ->
          subject = _.omit(mock.subject, 'detail')
          Router.getSubjectDetail(subject, {}).then ->
            validate(subject)
          # Dispatch the backend request.
          $httpBackend.flush()

      # TODO - add Session tests.
