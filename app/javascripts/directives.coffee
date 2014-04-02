directives = angular.module 'qiprofile.directives', []

# Busy spinner button directive.
directives.directive 'qiSpinner', () ->
  restrict: 'E'
  replace: true
  transclude: true
  scope:
    busy: '=busy'
  templateUrl: '/static/templates/spinner.html'
  link: (scope, element, attrs) ->
    # Replaces the DOM element.
    spinner = new Spinner().spin()
    container = element.find('.qi-spinner-container')[0]
    container.appendChild(spinner.el)
