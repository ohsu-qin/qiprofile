# The Router unit test.
#
# Note: image detail load cannot be unit-tested, since it requires an
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
          sessions: [
            {
              number: 1
              acquisition_date: moment('July 1, 2013').valueOf()
              detail: 'sd1'
              modeling: [
                {
                  resource: 'pk_01'
                  protocol: 'mp1'
                  source:
                    registration: 'rp1'
                  result:
                    delta_k_trans:
                      average: 2.3
                }
              ]
            }
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
          _id: 'sd1'
          scans: [
            {
              number: 1
              protocol: 'sp1'
              volumes: [
                {
                  number: 1
                  average_intensity: 2.4
                }
              ]  
              registrations: [
                {
                  resource: 'reg_01'
                  protocol: 'rp1'
                  volumes: [
                    {
                      number: 1
                      average_intensity: 3.1
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
            $httpBackend.whenGET(url).respond(JSON.stringify(mock.session_detail))

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

      describe 'Subject', ->
        it 'should fetch the subject by id', ->
          condition = id: mock.subject._id
          subject = Router.getSubject(condition)
          expect(subject, "Subject not fetched").to.eventually.exist
          $httpBackend.flush()
        
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

        describe 'Detail', ->
          subject = null

          beforeEach ->
            condition = id: mock.subject._id
            Router.getSubject(condition).then (fetched) ->
              subject = fetched
            $httpBackend.flush()

          # Confirm that a subject was fetched.
          it 'should fetch the subject', ->
            expect(subject, "Subject was not fetched").to.exist
          
          describe 'Demographics', ->
            # Validate the birth date.
            it 'should anonymize the subject birth date', ->
              expect(subject.birthDate, "Subject is missing a birth date").to.exist
              expect(subject.birthDate.valueOf(), "Subject birth date is incorrect")
                .to.equal(moment('July 7, 1986').valueOf())
        
          describe 'Clinical', ->
            # Validate the encounters.
            it 'should set the subject encounters', ->
              expect(subject.encounters, "Subject is missing encounters").to.exist
              expect(subject.encounters.length, "Subject encounters length is" +
                                                " incorrect").to.equal(1)
              enc = subject.encounters[0]
              expect(enc._cls, "Encounter type is incorrect")
                .to.equal(mock.subject.encounters[0]._cls)
        
            # Validate the treatments.
            it 'should extend the subject treatments', ->
              expect(subject.treatments, "Subject is missing treatments").to.exist
              expect(subject.treatments.length, "Subject encounters length is" +
                                                " incorrect").to.equal(1)
              trt = subject.treatments[0]
              expect(trt.treatmentType, "Treatment type is missing").to.exist
              expect(trt.treatmentType, "Treatment type is incorrect")
                .to.equal(mock.subject.treatments[0].treatment_type)
              expect(trt.begin_date.valueOf(), "Treatment begin date is incorrect")
                .to.equal(mock.subject.treatments[0].begin_date)
        
          describe 'Session', ->
            session = null
            
            beforeEach ->
              if subject.sessions
                session = subject.sessions[0]
            
            # Validate the sessions (without detail).
            it 'should have a subject session', ->
              expect(subject.sessions, "Subject is missing sessions").to.exist
              expect(subject.sessions.length, "Subject session count is incorrect")
                .to.equal(1)
              expect(subject.isMultiSession, "Subject multi-session flag is" +
                                             " incorrect").to.be.false
            
            it 'should have a session modeling object', ->
              expect(session.modeling, "Session is missing modeling").to.exist
              expect(session.modeling.length, "Session modeling count is incorrect")
                .to.equal(1)

          describe.only 'Modeling', ->
            modeling = null
            
            beforeEach ->
              if subject.modeling
                modeling = subject.modeling[0]
            
            it 'should have a subject modeling object', ->
              expect(subject.modeling, "Subject is missing modeling").to.exist
              expect(subject.modeling.lenght, "Subject modeling length is incorrect")
                .to.equal(1)
            
            it 'should have a protocol', ->
              expect(modeling.protocol, "Modeling is missing a protocol")
                .to.exist
              expect(modeling.protocol, "Modeling protocol reference is incorrect")
                .to.equal(mock.protocol.modeling._id)
            
            it 'should have a source', ->
              expect(modeling.source, "Modeling is missing the source").to.exist
            
            it 'should model the registration', ->
              expect(modeling.source.registration, "Modeling source does not reference a registration")
                .to.exist
              expect(modeling.source.registration, "Modeling source does not reference the registration protocol")
                .to.equal(mock.protocol.registration._id)            
            
              
                # TODO - replace below by verification for sole modeling.
                # TODO - we will also have a subject modeling which groups
                # the session modeling by protocol into a
                # subject{modeling: {source: {protocol: [results]}
                # where the results are by session.
              
              
                # # There is one scan modeling objects.
                # scanMdl = subject.modeling.scan
                # expect(scanMdl, "The subject modeling scan is missing").to.exist
                # expect(scanMdl.length, "The subject modeling registration count" +
                #                        " is incorrect").to.equal(1)
                #           
                # # The scan modeling is for the T1 scan.
                # mdl = subject.modeling.scan[0]
                # expect(mdl.key, "Modeling is missing a key").to.exist
                # expect(mdl.source, "Modeling is missing a source").to.exist
                # expect(mdl.source.scanType, "The scan modeling source is missing" +
                #                             " the scan type").to.exist
                # expect(mdl.source.scanType, "Modeling source scan type is incorrect")
                #   .to.equal('t1')
                # mockMdl = mock.subject.scan_sets.t1.modeling.pk_03
                # expect(mdl.results, "Modeling is missing results").to.exist
                # expect(mdl.results.length, "Modeling results count is incorrect")
                #   .to.equal(1)
                # mdlResult = mdl.results[0]
                # expect(mdlResult.deltaKTrans, "Modeling results is missing" +
                #                               " deltaKTrans").to.exist
                # expect(mdlResult.deltaKTrans.average, "Modeling deltaKTrans is" +
                #                                       " incorrect")
                #   .to.equal(mockMdl.results[0].delta_k_trans.average)
                #           
                # # The modeling result object refers to its respective session.
                # expect(mdlResult.session, "Modeling results is missing session")
                #   .to.exist
                # expect(mdlResult.session, "Modeling results session is incorrect")
                #   .to.equal(subject.sessions[0])

          # describe 'Session', ->
          #   mockSession = null
          #   session = null
          # 
          #   beforeEach ->
          #     session = _.clone(subject.sessions[0])
          #     Router.getSessionDetail(session)
          #     $httpBackend.flush()
          # 
          #   it 'should set the session subject reference', ->
          #     expect(session.subject, "Session is missing a subject reference")
          #       .to.exist
          #     expect(session.subject, "Session subject reference is incorrect")
          #       .to.equal(subject)
          # 
          #   describe 'Scan', ->
          #     scan = null
          #  
          #     beforeEach ->
          #       scan = Router.getScan(session, 't1')
          #  
          #     it 'should extend the session scan', ->
          #       expect(scan, "The session is missing the T1 scan").to.exist
          #       expect(scan.session, "The session T1 scan is missing the" +
          #                            " session reference").to.exist
          #       expect(scan.session, "The session T1 scan subject reference" +
          #                            " is incorrect").to.equal(session)
          #  
          #     it 'should set the session scan intensity', ->
          #       mockIntensity = mock.session_detail.scans.t1.intensity
          #       expect(scan.intensity, "The scan intensity is incorrect")
          #         .to.deep.eql(mockIntensity)
          # 
          #     describe 'Registration', ->
          #       registration = null
          # 
          #       beforeEach ->
          #         registration = Router.getRegistration(scan, 'reg_01')
          # 
          #       it 'should extend the registration', ->
          #         expect(registration, "The scan is missing the reg_01" +
          #                              " registration").to.exist
          #         expect(registration.scan, "The registration is missing the" +
          #                                   " scan reference").to.exist
          #         expect(registration.scan, "The registration scan reference" +
          #                                   " is incorrect").to.equal(scan)
          #         mock_reg = mock.session_detail.scans.t1.registration.reg_01
          #         expect(registration.intensity, "The registration intensity" +
          #                                        " is incorrect")
          #           .to.deep.eql(mock_reg.intensity)
