describe 'Unit Testing Modeling Service', ->
  describe 'Imaging Profile Table', ->
    # The mock input.
    mock = 
      sessions: [
        acquisition_date: new Date
        modeling:
          v_e: Math.random()
          tau_i: Math.random()
          fxl_k_trans: Math.random()
          fxr_k_trans: Math.random()
          delta_k_trans: Math.random()
        number: 1
      ]
    # The configuration.
    config = null

    beforeEach ->
      # Fake the service module.
      angular.mock.module('qiprofile.services')
      # Enable the test service.
      inject ['Modeling', (Modeling) ->
        config = Modeling.configureTable(mock.sessions)
      ]

    it 'should configure one session', ->
      expect(config.data).to.exist
      expect(config.data.length).to.equal(1)

    it 'should initialize the open flags to true', ->
      expect(config.ktransOpen).to.equal(true)
      expect(config.veOpen).to.equal(true)
      expect(config.tauiOpen).to.equal(true)

    # TODO - add percent change test cases.
