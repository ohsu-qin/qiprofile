# Controller for the subject list.
angular.module('qiprofile.controllers', []).
  controller('SubjectListCtrl', [
    ($scope, Subject) ->
      $scope.subjects = Subject.query()
  ])
