# Start the Angular application after the app is built and the
# DOM is loaded.
require ['require', 'angular', 'app'], (require, ng) ->
  # The exclamation below directs require.js to wait until the
  # DOM is loaded before executing the function.
  require ['domReady!'], (document) ->
    # The statement below is the asynchronous equivalent of
    # specifying ng-app='qiprofile' in the index.html page.
    # Directly calling bootstrap here instead ensures that
    # the DOM is in place before Angular mutates it.
    ng.bootstrap(document, ['qiprofile'])
