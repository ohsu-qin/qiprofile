(function() {
  import * as _ from "lodash";
  import moment from "moment";
  import REST from "../rest/rest.coffee";
  import Subject from "./subject.data.coffee";

  /**
   * The {{#crossLink "Subject"}}{{/crossLink}} validator.
   *
   * Note: image load cannot be unit-tested, since it requires an
   *   active browser.
   *
   * @module subject
   * @class SubjectSpec
   */
  describe('The Subject data utility', function() {
    var mock, subject;
    subject = null;
    mock = {
      json: function() {
        return {
          _id: 's1',
          project: 'QIN_Test',
          collection: 'Breast',
          number: 1,
          birth_date: moment('Aug 21, 1986', 'MMM DD, YYYY').valueOf(),
          encounters: [
            {
              _cls: 'Session',
              number: 1,
              acquisition_date: moment('Jul 1, 2013', 'MMM DD, YYYY').valueOf(),
              detail: 'sd1',
              modelings: [
                {
                  resource: 'pk_01',
                  protocol: 'mp1',
                  source: {
                    registration: 'rp1'
                  },
                  result: {
                    delta_k_trans: {
                      name: "path/to/first/delta_k_trans.nii.gz",
                      average: 2.3,
                      label_map: {
                        name: "path/to/first/delta_k_trans_color.nii.gz",
                        color_table: "path/to/color_table.txt"
                      }
                    }
                  }
                }
              ]
            }, {
              _cls: 'Session',
              number: 2,
              acquisition_date: moment('Aug 1, 2013', 'MMM DD, YYYY').valueOf(),
              detail: 'sd2',
              modelings: [
                {
                  resource: 'pk_02',
                  protocol: 'mp1',
                  source: {
                    registration: 'rp1'
                  },
                  result: {
                    delta_k_trans: {
                      name: "path/to/second/delta_k_trans.nii.gz",
                      average: 2.4,
                      label_map: {
                        name: "path/to/second/delta_k_trans_color.nii.gz",
                        color_table: "path/to/color_table.txt"
                      }
                    }
                  }
                }
              ]
            }, {
              _cls: 'BreastSurgery',
              date: moment('Jul 12, 2013', 'MMM DD, YYYY').valueOf(),
              pathology: {
                _cls: 'PathologyReport',
                tumors: [
                  {
                    _cls: 'BreastPathology',
                    tnm: {
                      size: {
                        prefix: 'p',
                        tumor_size: 3
                      }
                    }
                  }
                ]
              }
            }
          ],
          treatments: [
            {
              treatment_type: 'neodjuvant',
              start_date: moment('Jun 4, 2013', 'MMM DD, YYYY').valueOf(),
              end_date: moment('Jul 16, 2013', 'MMM DD, YYYY').valueOf(),
              dosages: [
                {
                  agent: {
                    _cls: 'Drug',
                    name: 'trastuzumab'
                  },
                  amount: 2.3,
                  start_date: moment('Jun 4, 2013', 'MMM DD, YYYY').valueOf(),
                  duration: 20
                }, {
                  agent: {
                    _cls: 'Drug',
                    name: 'pertuzumab'
                  },
                  amount: 4.1,
                  start_date: moment('Jun 16, 2013', 'MMM DD, YYYY').valueOf(),
                  duration: 30
                }
              ]
            }
          ]
        };
      }
    };
    beforeEach(function() {
      var data;
      data = REST.transformResponse(mock);
      return subject = Subject.extend(data);
    });
    describe('Demographics', function() {
      return it('should anonymize the subject birth date', function() {
        expect(subject.birthDate, "The subject is missing a birth date").to.exist;
        return expect(subject.birthDate.valueOf(), "The subject birth date is" + " incorrect").to.equal(moment('Jul 7, 1986', 'MMM DD, YYYY').valueOf());
      });
    });
    return describe('Clinical', function() {
      it('should set the clinical encounters', function() {
        expect(subject.clinicalEncounters, "The subject is missing clinical encounters").to.exist;
        return expect(subject.clinicalEncounters.length, "The subject clinical encounters length is incorrect").to.equal(1);
      });
      describe('Encounter', function() {
        var encounter;
        encounter = null;
        beforeEach(function() {
          return encounter = subject.clinicalEncounters[0];
        });
        it('should set the clinical encounter title', function() {
          expect(encounter.title, "The encounter is missing a title").to.exist;
          return expect(encounter.title, "The encounter title is incorrect").to.equal('Surgery');
        });
        return it('should set the clinical encounter age', function() {
          expect(encounter.title, "The encounter is missing a title").to.exist;
          return expect(encounter.title, "The encounter title is incorrect").to.equal('Surgery');
        });
      });
      it('should extend the subject treatments', function() {
        expect(subject.treatments, "The subject is missing treatments").to.exist;
        return expect(subject.treatments.length, "The subject encounters length" + " is incorrect").to.equal(1);
      });
      describe('Treatment', function() {
        var mockTreatment, treatment;
        treatment = null;
        mockTreatment = null;
        beforeEach(function() {
          treatment = subject.treatments[0];
          return mockTreatment = mock.json().treatments[0];
        });
        it('should have a type', function() {
          expect(treatment.treatmentType, "The treatment type is missing").to.exist;
          return expect(treatment.treatmentType, "The treatment type is incorrect").to.equal(mockTreatment.treatment_type);
        });
        it('should have a start data', function() {
          return expect(treatment.start_date.valueOf(), "Treatment start date is incorrect").to.equal(mockTreatment.start_date);
        });
        it('should have dosages', function() {
          expect(treatment.dosages, "The treatment dosages is missing").to.exist.and.not.be.empty;
          return expect(treatment.dosages.length, "The treatment dosages count is incorrect").to.equal(2);
        });
        return describe('Dosage', function() {
          var dosage, mockDosage;
          dosage = null;
          mockDosage = null;
          beforeEach(function() {
            dosage = treatment.dosages[0];
            return mockDosage = mockTreatment.dosages[0];
          });
          it('should have an agent', function() {
            expect(dosage.agent, "The dosage agent is missing").to.exist;
            return expect(dosage.agent.name, "The dosage agent name is missing").to.exist;
          });
          it('should have a start date', function() {
            return expect(dosage.start_date.valueOf(), "The treatment dosage start date" + " is incorrect").to.equal(mockDosage.start_date);
          });
          return it('should have a duration', function() {
            return expect(dosage.duration, "The treatment dosage duration is incorrect").to.equal(mockDosage.duration);
          });
        });
      });
      return describe('Session', function() {
        it('should have a subject session', function() {
          expect(subject.sessions, "The subject is missing sessions").to.exist;
          return expect(subject.sessions.length, "The subject session count is" + " incorrect").to.equal(2);
        });
        it('should set the subject multiSession flag', function() {
          return expect(subject.isMultiSession(), "The subject multi-session flag" + " is incorrect").to.be["true"];
        });
        return it('should set the session number', function() {
          var sessionNbr;
          sessionNbr = subject.sessions[0].number;
          expect(sessionNbr, "The session is missing a number").to.exist;
          return expect(sessionNbr, "The subject session number is incorrect").to.equal(1);
        });
      });
    });
  });

}).call(this);
