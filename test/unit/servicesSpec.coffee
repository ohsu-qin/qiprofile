describe 'Unit Testing Services', ->

  beforeEach ->
    # Fake the services module.
    angular.mock.module('qiprofile.services')

  describe 'Image Service', ->
    # The qiprofile Image factory.
    Image = null
    # The mock Angular $http service provider.
    $httpBackend = null
    
    beforeEach ->
      # Enable the test services.
      inject ['Image', '$httpBackend', (_Image_, _$httpBackend_) ->
        Image = _Image_
        $httpBackend = _$httpBackend_
      ]
    
    afterEach ->
      $httpBackend.verifyNoOutstandingExpectation()
      $httpBackend.verifyNoOutstandingRequest()
    
    it 'should load the image file', (done) =>
      # The mock file path.
      path = 'data/QIN/Breast008/Session01/series01.nii.gz'
      # The expected file content.
      expected = 'test data'
      # There is an Image service.
      expect(Image).to.exist
      # The mock test "scan" object.
      mockScan = {id: 1, files: [path]}
      # The mock file URL.
      url = '/static/' + path
      # The mock http call.
      $httpBackend.whenGET(url).respond(expected)
      # The encapsulated "scan" images.
      images = Image.imagesFor(mockScan)
      # There is one image.
      expect(images.length).to.equal(1)
      image = images[0]
      # The image is not yet loading.
      expect(image.state.loading).to.be.false
      # Load the image.
      promise = image.load()
      # The loading flag is set to true during the load.
      # The load will not finish until the mock backend
      # is flushed at the end of this test case.
      expect(image.state.loading).to.be.true
      # When the image is loaded, then the loading flag
      # is unset and the image data property is set to
      # the file content.
      promise.then (content) ->
        expect(image.state.loading).to.be.false
        expect(image.data).to.equal(expected)
        # Tell the test case that it is done.
        done()
      # Fire the backend request.
      $httpBackend.flush()


  describe 'Intensity Service', ->
    # The qiprofile Intensity factory.
    Intensity = null

    beforeEach ->
      # Enable the test services.
      inject ['Intensity', (_Intensity_) ->
        Intensity = _Intensity_
      ]
    
    it 'should configure the chart', ->
      # Make the dummy input session.
      session =
        scan:
          intensity:
            # Max intensity is at session 10.
            intensities: (30 - Math.abs(10 - i) for i in [1..32])
        registrations: [
          name: 'reg_01'
          intensity:
            # Dampen the registration intensity a bit.
            intensities: (30 - (Math.abs(10 - i) * 1.2) for i in [1..32])
        ]
      # Configure the chart.
      config = Intensity.configureChart(session)
      expect(config.data).to.exist
      expect(config.data.length).to.equal(2)
      
      # Verify the scan coordinates.
      expectedX = [1..32]
      scan = _.find config.data, (dataSeries) -> dataSeries.key == 'Scan'
      expect(scan).to.exist
      expect(scan.values).to.exist
      scanX = (coord[0] for coord in scan.values)
      expect(scanX).to.eql(expectedX)
      scanY = (coord[1] for coord in scan.values)
      expect(scanY).to.eql(session.scan.intensity.intensities)
      
      # Verify the registration coordinates.
      reg = _.find config.data, (dataSeries) -> dataSeries.key == 'Realigned'
      expect(reg).to.exist
      expect(reg.values).to.exist
      regX = (coord[0] for coord in reg.values)
      expect(regX).to.eql(expectedX)
      regY = (coord[1] for coord in reg.values)
      expect(regY).to.eql(session.registrations[0].intensity.intensities)

      # Verify the x-axis values.
      expect(config.xValues).to.eql(expectedX)


  describe 'Imaging Profile', ->
    # The qiprofile Modeling factory.
    Modeling = null

    beforeEach ->
      # Enable the test services.
      inject ['Modeling', (_Modeling_) ->
        Modeling = _Modeling_
      ]

    it 'should configure the imaging profile table', ->
      # The mock input.
      subject =
        sessions:
          [
            {
              acquisition_date: new Date
              modeling: {
                v_e: Math.random()
                tau_i: Math.random()
                fxl_k_trans: Math.random()
                fxr_k_trans: Math.random()
                delta_k_trans: Math.random()
              }
              number: 1
            }
          ]
      # The expected result.
      config = Modeling.configureTable(subject.sessions)
      expect(config.data).to.exist
      expect(config.data.length).to.equal(1)
      expect(config.ktransOpen).to.equal(true)
      expect(config.veOpen).to.equal(true)
      expect(config.tauiOpen).to.equal(true)


  describe 'Clinical Profile', ->
      # The qiprofile Modeling factory.
      ClinicalProfile = null

      beforeEach ->
        # Enable the test services.
        inject ['ClinicalProfile', (_ClinicalProfile_) ->
          ClinicalProfile = _ClinicalProfile_
        ]

      it 'should configure the imaging profile table', ->
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
                  }
                }
                encounter_type: "Assessment"
              }
            ]
        # The expected result.
        config = ClinicalProfile.configureProfile(subject)
        expect(config.encounters).to.exist
        expect(config.encounters.length).to.equal(2)
        expect(config.races).to.exist
        expect(config.ethnicity).to.exist
        expect(config.demogrOpen).to.equal(true)

