describe 'Unit Testing Routes', ->
  # The Angular router.
  $route = null
  
  beforeEach ->
    # Fake the application.
    angular.mock.module('qiprofile.routes')
    # Enable the Angular router.
    inject ['$route', (_$route_) ->
      $route = _$route_
    ]
  
  it 'should map home to the subject list controller', () ->
    route = $route.routes['/quip']
    expect(route).to.exist
    expect(route.controller).to.equal('SubjectListCtrl')
    
  it 'should map a subject to the subject detail controller', () ->
    route = $route.routes['/quip/:collection/subject/:subject']
    expect(route).to.exist
    expect(route.controller).to.equal('SubjectDetailCtrl')
    
  it 'should map a session to the session detail controller', () ->
    route = $route.routes['/quip/:collection/subject/:subject/session/:session']
    expect(route).to.exist
    expect(route.controller).to.equal('SessionDetailCtrl')
    
  it 'should map a series to the series detail controller', () ->
    route = $route.routes['/quip/:collection/subject/:subject/session/:session/:image_container/series/:series']
    expect(route).to.exist
    expect(route.controller).to.equal('SeriesDetailCtrl')
