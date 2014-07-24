define ['angular'], (angular) ->
  angular.module 'qiprofile', [
    'ui.router', 'ui.bootstrap', 'nvd3ChartDirectives',
    'qiprofile.services', 'qiprofile.routes', 'qiprofile.controllers',
    'qiprofile.filters', 'qiprofile.directives'
  ]
