svcs = angular.module 'qiprofile.services', ['ngResource']

svcs.factory 'Subjects', ['$resource', ($resource) ->
  $resource '/api/subjects/', {}, {isArray: true}
]

svcs.factory 'Subject', ['$resource', ($resource) ->
  $resource '/api/:collection/subject/:subject/'
]

svcs.factory 'SubjectDetail', ['$resource', ($resource) ->
  $resource '/api/subject_detail/:id/'
]
