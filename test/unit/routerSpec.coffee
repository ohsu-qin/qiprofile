describe 'Unit Testing Router', ->
  Router = null
  # The mock Angular $http service provider.
  $httpBackend = null
  # The mock objects.
  mock =
    subject:
      project: 'QIN_Test'
      collection: 'Breast'
      number: 1
      detail: 'a'
    subject_detail:
      sessions: [
        number: 1
        detail: 'b'
        modeling: [
          name: 'pk_aUjr'
          image_container_name: 'reg_8L3W'
          fxl_k_trans: 2.3
          fxr_k_trans: 2.5
        ]
      ]
      encounters: [
        encounter_type: 'Biopsy'
        outcomes: [
          _cls: 'BreastPathology'
          tnm:
            size: 'T3'
        ]
      ]
    session_detail:
      scan:
        intensity:
          intensities: [2.4]
      registrations: [
        intensity:
          intensities: [3.1]
      ]

  beforeEach ->
    # Fake the service module.
    angular.mock.module('qiprofile.services')

    inject ['Router', '$httpBackend', (_Router_, _$httpBackend_) ->
      Router = _Router_
      $httpBackend = _$httpBackend_
      
      # The mock subjects http call.
      url = encodeURI('/api/subjects?where={"project":"QIN_Test","collection":"Breast","number":1}')
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

  describe 'Subject', ->
    it 'should fetch the subject', ->
      # "Fetch" the subject.
      inject ['Subject', (Subject) ->
        params =
          project: mock.subject.project
          collection: mock.subject.collection
          subject: "#{ mock.subject.number }"
        actual = Router.getSubject(params)
        expected = new Subject(mock.subject)
        expect(actual).to.eventually.eql(expected)
        # Fire the backend request.
        $httpBackend.flush()
      ]
    
    it 'should not fetch a subject with a detail reference', ->
      params =
        project: mock.subject.project
        collection: mock.subject.collection
        subject: "#{ mock.subject.number }"
        detail: 'dummy'
      actual = Router.getSubject(params)
      # The router ignores the detail parameter. 
      expected = _.omit(mock.subject, 'detail')
      expect(actual).to.eql(expected)

  describe 'Subject Detail', ->
    # The subject from the abstract parent state.
    subject = null
      
    # Validates the resolved subject.
    validate = (subject) ->
      expect(subject.sessions).to.exist
      expect(subject.sessions.length).to.equal(1)
      expect(subject.isMultiSession).to.be.false
      sess = subject.sessions[0]
      expect(sess.subject).to.exist
      expect(sess.modeling).to.exist
      # TODO - replace the assignment below for multiple
      # modeling results per session.
      #expect(sess.modeling.length).to.equal(1)
      #mdl = sess.modeling[0]
      mdl = sess.modeling
      expect(mdl.delta_k_trans).to.exist
      expect(mdl.delta_k_trans).to.be.closeTo(0.2, 0.0000001)

    beforeEach ->
      # Make a new subject for each test case, since the
      # subject content is modified by the fetch.
      subject =
        project: mock.subject.project
        collection: mock.subject.collection
        number: 1
  
    it 'should fetch the detail with a subject detail property', (done) ->
      subject.detail = mock.subject.detail
      Router.getSubjectDetail(subject, {}).then ->
        validate(subject)
        done()
      # Fire the backend request.
      $httpBackend.flush()
  
    it 'should fetch the detail with a detail query parameter', (done) ->
      Router.getSubjectDetail(subject, detail: mock.subject.detail).then ->
        validate(subject)
        done()
      # Fire the backend request.
      $httpBackend.flush()

    it 'should fetch the detail without a detail property or parameter', (done) ->
      # The query subject includes a subject property rather
      # than a number when the subject has not yet been fetched.
      subject.subject = "#{ subject.number }"
      delete subject.number
      Router.getSubjectDetail(subject, {}).then ->
        console.log("rst sbj: #{ _.pairs(subject) }")
        foo.bar
        validate(subject)
        done()
      # Fire the backend request.
      $httpBackend.flush()
