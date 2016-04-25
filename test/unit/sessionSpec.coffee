# The Session unit test.
#
# Note: image load cannot be unit-tested, since it requires an
# active browser.
define ['ngmocks', 'lodash', 'expect', 'moment', 'session', 'helpers'],
  (ng, _, expect, moment) ->
    # The mock objects.
    mock =
      subject:
        title: 'Breast Patient 1'

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
              name: "delta_k_trans.nii.gz"
              average: 2.3
              labelMap:
                name: "delta_k_trans_color.nii.gz"
                colorTable: "/etc/color_table.txt"
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
              image:
                name: 'scan_ts.nii.gz'
            volumes:
              name: 'NIFTI'
              images: [
                name: 'volume001.nii.gz'
              ]
            registrations: []
          ]

    describe 'Unit Testing the Session Service', ->
      Session = null
      subject = mock.subject
      session = null

      beforeEach ->
        # Fake the session service module.
        ng.module('qiprofile.session')
        inject ['Session', (_Session_) ->
          Session = _Session_
        ]
        session = _.cloneDeep(mock.session)
        # Extend the mock session.
        Session.extend(session, subject, 1)

      describe 'extend', ->
        it 'should reference the parent subject', ->
          expect(session.subject, "The session does not reference the" +
                                  " parent subject")
            .to.exist
          expect(session.subject, "The session subject reference is" +
                                  " incorrect")
            .to.equal(subject)

        describe 'Overlays', ->
          overlays = null

          beforeEach ->
            overlays = session.overlays

          it 'should have one modeling overlay', ->
            expect(overlays, "Modeling is missing overlays").to.exist
            expect(overlays.length, "Modeling overlays count is" +
                                    " incorrect")
              .to.equal(1)

          it 'should recapitulate the modeling result delta Ktrans overlay', ->
            expect(overlays[0], "Modeling result overlays is incorrect")
              .to.equal(session.modelings[0].result.deltaKTrans.labelMap)

        describe 'Modeling', ->
          modelingResult = null
          
          beforeEach ->
            modelingResult = session.modelings[0].result
          
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
                       "The modeling parameter result does not reference" +
                       " an overlay").to.exist
                expect(overlay, "The modeling parameter result overlay" +
                                " is not the label map")
                  .to.equal(paramResult.labelMap)

              it 'should reference the parent modeling parameter result', ->
                expect(overlay.parameterResult,
                       "The overlay does not reference the parent" +
                       " modeling parameter result")
                  .to.exist
                expect(overlay.parameterResult,
                       "The overlay parameter result reference is incorrect")
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

