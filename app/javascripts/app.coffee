define(
  # The dependencies declared here include only Angular,
  # the vendor modules used directly in the application
  # HTML, and the top-level application Javascript. Service
  # dependencies are declareed by the application modules.
  ['angular', 'ngnvd3', 'uibootstrap', 'controllers', 'directives',
   'filters', 'routes'],
  (ng) ->
    ng.module 'qiprofile', ['nvd3ChartDirectives', 'ui.bootstrap',
      'qiprofile.controllers', 'qiprofile.directives', 'qiprofile.filters',
      'qiprofile.routes'
    ]
)
