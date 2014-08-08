describe 'Unit Testing Clinical Service', ->
  # The qiprofile Clinical Profile factory.
  Clinical = null

  beforeEach ->
    # Enable the test services.
    inject ['Clinical', (_Clinical_) ->
      Clinical = _Clinical_
    ]

  it 'should configure the clinical profile panel', ->
    # The mock input.
    race_choices = ['White', 'Black', 'Asian', 'AIAN', 'NHOPI']
    ethnicity_choices = ['Hispanic', 'Non-Hispanic']
    subject =
      birth_date: new Date
      races: race_choices[Math.floor(Math.random() * race_choices.length)]
      ethnicity: ethnicity_choices[Math.floor(Math.random() * ethnicity_choices.length)]
      encounters:
        [
          {
            date: new Date
            outcome: {
              tnm: {
                grade: Math.floor(Math.random() * 4) + 1
                lymph_status: Math.floor(Math.random() * 5)
                metastasis: true
                size: "pT".concat((Math.floor(Math.random() * 4) + 1).toString())
              }
            }
            encounter_type: "Biopsy"
          }
          {
            date: new Date
            outcome: {
              tnm: {
                grade: Math.floor(Math.random() * 4) + 1
                lymph_status: Math.floor(Math.random() * 5)
                metastasis: true
                size: "pT".concat((Math.floor(Math.random() * 4) + 1).toString())
              }
            }
            encounter_type: "Assessment"
          }
        ]
    # The expected result.
    config = Clinical.configureProfile(subject)
    expect(config.encounters).to.exist
    expect(config.encounters.length).to.equal(2)
    expect(config.races).to.exist
    expect(config.ethnicity).to.exist
    expect(config.demogrOpen).to.equal(true)
