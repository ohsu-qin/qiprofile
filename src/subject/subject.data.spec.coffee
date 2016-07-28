`import * as _ from "lodash"`
`import moment from "moment"`

`import Rest from "../rest/rest.service.coffee"`
`import Subject from "./subject.data.coffee"`

describe 'The Subject Data Service', ->
  # The fetched subject
  subject = null

  # The mock subject REST response.
  mock =
    json: ->
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
    data = Rest.transformResponse(mock)
    subject = Subject.extend(data)

  describe 'Demographics', ->
    # Validate the birth date.
    it 'should anonymize the subject birth date', ->
      expect(subject.birthDate, "Subject is missing a birth date")
        .to.exist
      expect(subject.birthDate.valueOf(), "Subject birth date is" +
                                          " incorrect")
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
    
    describe 'Encounter', ->
      encounter = null

      beforeEach ->
        encounter = subject.clinicalEncounters[0]

      it 'should set the clinical encounter title', ->
        expect(encounter.title, "Encounter is missing a title").to.exist
        expect(encounter.title, "Encounter title is incorrect")
          .to.equal('Surgery')
      it 'should set the clinical encounter age', ->
        expect(encounter.title, "Encounter is missing a title").to.exist
        expect(encounter.title, "Encounter title is incorrect")
          .to.equal('Surgery')

    # Validate the treatments.
    it 'should extend the subject treatments', ->
      expect(subject.treatments, "Subject is missing treatments")
        .to.exist
      expect(subject.treatments.length, "Subject encounters length" +
                                        " is incorrect").to.equal(1)

    describe 'Treatment', ->
      treatment = null
      mockTreatment = null

      beforeEach ->
        treatment = subject.treatments[0]
        mockTreatment = mock.json().treatments[0]

      it 'should have a type', ->
        expect(treatment.treatmentType, "Treatment type is missing").to.exist
        expect(treatment.treatmentType, "Treatment type is incorrect")
          .to.equal(mockTreatment.treatment_type)
      it 'should have a start data', ->
        expect(treatment.start_date.valueOf(),
               "Treatment start date is incorrect")
          .to.equal(mockTreatment.start_date)
      it 'should have dosages', ->
        expect(treatment.dosages, "Treatment dosages is missing")
          .to.exist.and.not.be.empty
        expect(treatment.dosages.length, "Treatment dosages count is incorrect")
          .to.equal(2)

      describe 'Dosage', ->
        dosage = null
        mockDosage = null

        beforeEach ->
          dosage = treatment.dosages[0]
          mockDosage = mockTreatment.dosages[0]

        it 'should have an agent', ->
          expect(dosage.agent, "Dosage agent is missing").to.exist
          expect(dosage.agent.name, "Dosage agent name is missing").to.exist
        it 'should have a start date', ->
          expect(dosage.start_date.valueOf(),  "Treatment dosage start date" +
                                            " is incorrect")
            .to.equal(mockDosage.start_date)
        it 'should have a duration', ->
          expect(dosage.duration,  "Treatment dosage duration is incorrect")
            .to.equal(mockDosage.duration)

    describe 'Session', ->
      # Validate the sessions (without detail).
      it 'should have a subject session', ->
        expect(subject.sessions, "Subject is missing sessions").to.exist
        expect(subject.sessions.length, "Subject session count is" +
                                        " incorrect")
          .to.equal(2)

      it 'should set the subject multiSession flag', ->
        expect(subject.isMultiSession(), "Subject multi-session flag" +
                                         " is incorrect")
          .to.be.true
