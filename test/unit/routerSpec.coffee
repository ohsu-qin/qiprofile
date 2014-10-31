define ['angular', 'lodash', 'ngmocks', 'expect', 'moment', 'router'],
  (ng, _, mocks, expect, moment, router) ->
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
              fxl_k_trans:
                average: 2.3
              fxr_k_trans:
                average: 2.5
              delta_k_trans:
                average: 2.3
                filename: 'data/Breast001/Session01/delta_k_trans.nii.gz'
                overlay:
                  filename: 'data/Breast001/Session01/delta_k_trans_color.nii.gz'
                  color_lut: 'etc/jet_colors.txt'
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
          scans:
            t1:
              name: 't1'
              intensity:
                intensities: [2.4]
              registrations: [
                name: 't1'
                intensity:
                  intensities: [3.1]
              ]

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

      describe 'Subject Detail', ->
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
          expect(mdl.deltaKTrans, "Modeling is missing a delta Ktrans").to.exist
          mock_mdl = mock.subject_detail.sessions[0].modeling[0]
          expect(mdl.deltaKTrans.average, "delta Ktrans average is incorrect")
            .to.equal(mock_mdl.delta_k_trans.average)
          expect(mdl.deltaKTrans.filename, "delta Ktrans filename is incorrect")
            .to.equal(mock_mdl.delta_k_trans.filename)
          overlay = mdl.deltaKTrans.overlay
          expect(overlay, "delta Ktrans is missing the overlay").to.exist
          expect(overlay.filename, "delta Ktrans overlay filename is incorrect")
            .to.equal(mock_mdl.delta_k_trans.overlay.filename)
          expect(overlay.colorLut, "delta Ktrans overlay LUT is incorrect")
            .to.equal(mock_mdl.delta_k_trans.overlay.color_lut)

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
          scan = session.scans.t1
          expect(scan, "Session is missing the T1 scan").to.exist
          mock_scan = mock.session_detail.scans.t1
          expect(scan.intensity, "Session scan is incorrect")
            .to.deep.eql(mock_scan.intensity)
          expect(scan.intensity, "Session scan is incorrect")
            .to.deep.eql(mock_scan.intensity)
          reg = scan.registrations[0]
          expect(reg, "Session is missing the T1 registration").to.exist
          mock_reg = mock.session_detail.scans.t1.registrations[0]
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

      describe 'Scan', ->
        mock_session = null

        beforeEach ->
          mock_session = mock.subject_detail.sessions[0]
          # The session subject reference is set in the routes
          # session resolution.
          mock_session.subject = mock.subject

        it 'should find the scan container in a fetched session', ->
          session = _.clone(mock_session)
          session.scans = mock.session_detail.scans
          actual = Router.getScan(session, 't1')
          expect(actual, 'Image container missing').to.exist
          expect(actual, 'Image container incorrect')
            .to.equal(mock.session_detail.scans.t1)

        it 'should fetch a session if necessary to obtain the scan', ->
          session = _.omit(mock_session, 'detail')
          session.subject = _.clone(mock.subject)
          mock_scan = mock.session_detail.scans.t1
          Router.getScan(session, mock_scan.name).then (container) ->
            expect(container, 'Image container missing').to.exist
            expect(container.intensity, 'Image container intensity incorrect').
              to.eql(mock_scan.intensity)
          
          # Dispatch the backend request.
          $httpBackend.flush()
