# The Subject resource.
Subject = 

# Controller for the subject list.
SubjectListCtrl = ($scope, Poll) ->
  $scope.polls = Poll.query()
