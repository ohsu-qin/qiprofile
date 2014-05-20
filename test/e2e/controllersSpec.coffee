describe 'The Subject List Controller', ->

  beforeEach ->
    # Load the controller module.
    module 'qiprofile.controllers'
    # Initialize the controller and a mock scope.
    inject ($controller, $rootScope) ->
      scope = $rootScope.$new()
      SubjectListCtrl = $controller('SubjectListCtrl', $scope: scope)
