define ['demographics'], ->

  describe 'Demographics', ->
    beforeEach ->
      # Fake the demographics service.
      angular.mock.module('qiprofile.demographics')

    describe 'Race', ->
      Race = null
      
      beforeEach ->
        # Enable the test service.
        inject ['Race', (_Race_) ->
          Race = _Race_
        ]
            
      it 'should convert known values', ->
        for race in ['White', 'Black',  'Asian', 'AIAN', 'NHOPI']
          expect(Race.toDisplayValue(race), "Race database value not converted: #{ race }")
            .to.exist.and.not.equal('Not specified')
      
      it 'should convert null to Not specified', ->
        expect(Race.toDisplayValue(null), "Race null value not converted to 'Not specified'")
          .to.equal('Not specified')
            
      it 'should reject unrecognizied values', ->
        expect((-> Race.toDisplayValue('bogus')), "Unsupported race value does not throw an error")
          .to.throw(ReferenceError)
    
    describe 'Ethnicity', ->
      Ethnicity = null
      
      beforeEach ->
        # Enable the test service.
        inject ['Ethnicity', (_Ethnicity_) ->
          Ethnicity = _Ethnicity_
        ]
      
      it 'should convert known values', ->
        for ethnicity in ['Hispanic', 'Non-Hispanic']
          expect(Ethnicity.toDisplayValue(ethnicity), "Ethnicity database value not converted: #{ ethnicity }")
            .to.exist.and.not.equal('Not specified')
      
      it 'should convert null to Not specified', ->
        expect(Ethnicity.toDisplayValue(null), "Ethnicity null value not converted to 'Not specified'")
            .to.equal('Not specified')
      
      it 'should reject unrecognizied values', ->
        expect((-> Ethnicity.toDisplayValue('bogus')), "Unsupported ethnicity value does not throw an error")
            .to.throw(ReferenceError)
