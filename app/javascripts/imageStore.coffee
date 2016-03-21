# This service is an abstract image store provider which delegates
# to the application image store implementation. The site can adapt
# this service to its own image store manager by replacing XNAT
# below with its own service.
define ['angular', 'xnat'], (ng) ->
  imageStore = ng.module 'qiprofile.imagestore', ['qiprofile.xnat']

  imageStore.factory 'ImageStore', ['XNAT', (XNAT) -> XNAT ]
