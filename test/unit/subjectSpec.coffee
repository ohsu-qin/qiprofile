define ['ngmocks', 'lodash', 'expect', 'moment', 'subject', 'helpers'],
  (ng, _, expect, moment) ->
    describe 'Unit Testing the Subject service', ->
      # The mock Subject service module.
      Subject = null

      # The mock Angular $http service provider.
      $httpBackend = null

      $rootScope = null
      
      $timeout = null

      # The mock objects.
      mock =
        subject:
          _id: 's1'
          project: 'QIN_Test'
          collection: 'Breast'
          number: 1
          birth_date: moment('Aug 21, 1986', 'MMM DD, YYYY').valueOf()
          encounters: [
            {
              _cls: 'Session'
              number: 1
              acquisition_date: moment('Jul 1, 2013', 'MMM DD, YYYY').valueOf()
              detail: 'sd1'
              modelings: [
                resource: 'pk_01'
                protocol: 'mp1'
                source:
                  registration: 'rp1'
                result:
                  delta_k_trans:
                    name: "path/to/first/delta_k_trans.nii.gz"
                    average: 2.3
                    label_map:
                      name: "path/to/first/delta_k_trans_color.nii.gz"
                      color_table: "path/to/color_table.txt"
              ]
            }
            {
              _cls: 'Session'
              number: 2
              acquisition_date: moment('Aug 1, 2013', 'MMM DD, YYYY').valueOf()
              detail: 'sd2'
              modelings: [
                resource: 'pk_02'
                protocol: 'mp1'
                source:
                  registration: 'rp1'
                result:
                  delta_k_trans:
                    name: "path/to/second/delta_k_trans.nii.gz"
                    average: 2.4
                    label_map:
                      name: "path/to/second/delta_k_trans_color.nii.gz"
                      color_table: "path/to/color_table.txt"
              ]
            }
            {
              _cls: 'BreastSurgery'
              date: moment('Jul 12, 2013', 'MMM DD, YYYY').valueOf()
              pathology:
                _cls: 'PathologyReport'
                tumors: [
                  _cls: 'BreastPathology'
                  tnm:
                    size:
                      prefix: 'p'
                      tumor_size: 3
                ]
            }
          ]
          treatments: [
            treatment_type: 'neodjuvant'
            start_date: moment('Jun 4, 2013', 'MMM DD, YYYY').valueOf()
            end_date: moment('Jul 16, 2013', 'MMM DD, YYYY').valueOf()
            dosages: [
              {
                agent:
                  _cls: 'Drug'
                  name: 'trastuzumab'
                amount: 2.3
                start_date: moment('Jun 4, 2013', 'MMM DD, YYYY').valueOf()
                duration: 20
              }
              {
                agent:
                  _cls: 'Drug'
                  name: 'pertuzumab'
                amount: 4.1
                start_date: moment('Jun 16, 2013', 'MMM DD, YYYY').valueOf()
                duration: 30
              }
            ]
          ]

      beforeEach ->
        # Fake the router service module.
        ng.module('qiprofile.subject')

        inject [
          'Subject', '$httpBackend', '$rootScope', '$timeout',
          (_Subject_, _$httpBackend_, _$rootScope_, _timeout_) ->
            Subject = _Subject_
            $httpBackend = _$httpBackend_
            $rootScope = _$rootScope_
            $timeout = _timeout_

            # The mock subjects http call.
            url = encodeURI('/api/subject?where=' +
                            '{"project":"QIN_Test","collection":"Breast","number":1}')
            $httpBackend.whenGET(url).respond(JSON.stringify(_items: [mock.subject]))

            # The mock subject http call.
            url = encodeURI('/api/subject/s1')
            $httpBackend.whenGET(url).respond(JSON.stringify(mock.subject))
        ]

      afterEach ->
        # Note: Angular 1.2.5 and after issue a 'Digest in progress' message
        # unless the digest argment is set to false as shown below.
        $httpBackend.verifyNoOutstandingExpectation(false)
        $httpBackend.verifyNoOutstandingRequest()

      describe 'Subject', ->
        subject = null

        beforeEach ->
          condition = id: mock.subject._id
          Subject.find(condition).then (fetched) ->
            subject = fetched
          $httpBackend.flush()

        it 'should fetch the subject by id', ->
          expect(subject, "Subject not fetched").to.exist

        it 'should fetch the subject by _id', ->
          condition = _id: mock.subject._id
          subject = Subject.find(condition)
          expect(subject, "Subject not fetched").to.eventually.exist
          $httpBackend.flush()

        it 'should fetch the subject by secondary key', ->
          condition =
            project: mock.subject.project
            collection: mock.subject.collection
            number: mock.subject.number
          subject = Subject.find(condition)
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
              .to.equal(moment('Jul 7, 1986', 'MMM DD, YYYY').valueOf())

        describe 'Clinical', ->
          # Validate the clinical encounters.
          it 'should set the clinical encounters', ->
            expect(subject.clinicalEncounters,
                   "Subject is missing clinical encounters")
              .to.exist
            expect(subject.clinicalEncounters.length,
                   "Subject clinical encounters length is incorrect")
              .to.equal(1)
          it 'should set the clinical encounter title', ->
            enc = subject.clinicalEncounters[0]
            expect(enc.title, "Encounter is missing a title").to.exist
            expect(enc.title, "Encounter title is incorrect").to.equal('Surgery')

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
            expect(trt.start_date.valueOf(),
                   "Treatment start date is incorrect")
              .to.equal(mockTrt.start_date)
            expect(trt.dosages, "Treatment dosages is missing")
              .to.exist.and.not.be.empty
            expect(trt.dosages.length, "Treatment dosages count is incorrect")
              .to.equal(2)
            dsg = trt.dosages[0]
            mockDsg = mockTrt.dosages[0]
            expect(dsg.agent, "Dosage agent is missing").to.exist
            expect(dsg.agent.name, "Dosage agent name is missing").to.exist
            expect(dsg.start_date.valueOf(),  "Treatment dosage start date" +
                                              " is incorrect")
              .to.equal(mockDsg.start_date)
            expect(dsg.duration,  "Treatment dosage duration is incorrect")
              .to.equal(mockDsg.duration)
