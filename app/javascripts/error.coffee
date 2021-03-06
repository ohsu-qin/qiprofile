define ['angular', 'stacktrace'], (ng, stacktrace) ->
  # Print the full error message in an alert box. This is a work-around
  # for Chrome bug 331971
  # (cf. https://code.google.com/p/chromium/issues/detail?id=331971)
  # which truncates long error messages. This code is copied from
  # http://stackoverflow.com/a/22218280/674326.
  #
  # TODO - The handler breaks with error:
  #     sourceMappingURL not found
  #   Uncomment, induce an error and fix. See following TODO and FIXME items.
  #
  # window.onerror = (errorMsg, url, lineNumber, columnNumber, errorObject) ->
  #   # Check the errorObject as IE and FF don't pass it through (yet).
  #   if errorObject?
  #     errMsg = errorObject.message
  #   else
  #     errMsg = errorMsg
  #   alert('Error: ' + errMsg)
  #
  # # The error handler module.
  # #
  # # Note: testing this module is prohibitively difficult. Suggestions for
  # # disabling the Mocha error trap don't work. ngMockE2E could be used to
  # # build a pseudo-app and HTML test harness, but that is not worth the
  # # trouble. The work-around to test this module is to introduce an error
  # # in the qiprofile code and check that it is logged on the server.
  error = ng.module 'qiprofile.error', []
  #
  # # Augment the Angular exception handler to print an error on both
  # # the console (the default behavior) and the server.
  # error.factory '$exceptionHandler', ['$log', '$window', ($log, $window) ->
  #   (exception, cause) ->
  #     # Print the error on the console.
  #     $log.error.apply($log, arguments)
  #     # Send the error to the server.
  #     # TODO - given the FIXMEs below, revisit this module, look for good
  #     #   usage examples and either fix or kill it.
  #     try
  #       message = "#{ exception }"
  #       # FIXME - stacktrace.fromError returns an empty string in
  #       #   E2E Session Detail testing when the download.isDisplayed
  #       #   function is not found, with the following message:
  #       #     Client error: TypeError: download.isDisplayed is not a function.
  #       #   Don't know if that is always the case.
  #       # TODO - Induce an error by replacing download.isDisplayed with
  #       #   download.fooBar and isolate the problem.
  #       #
  #       # FIXME - after the AngularJS 1.4.9 upgrade, an error fetching
  #       #   a REST object results in a JSON parser error which in turn
  #       #   causes a secondary stackTrace.fromError error with the following
  #       #   message:
  #       #      TypeError('Given line number must be a positive integer')
  #       #   deep in the obscure stackTrace code. Work-around is to pass
  #       #   over the stack trace and handle the failed failure handler
  #       #   gracefully.
  #       try
  #         stackTrace = stacktrace.fromError(exception)
  #       catch TypeError
  #         stackTrace = null
  #       # The object to send.
  #       payload =
  #         url: $window.location.href
  #         name: exception.name
  #         message: message
  #         stackTrace: stackTrace
  #         cause: cause or ''
  #       # Send the object to the server.
  #       # Note: can't use the File service, since File depends on
  #       # $exceptionHandler.
  #       xhr = new window.XMLHttpRequest()
  #       xhr.open('POST', '/error', true)
  #       xhr.setRequestHeader('Content-type', 'application/json')
  #       # The XHR request is retransmitted several times.
  #       # Consequently, the error is logged multiple times on the server.
  #       # Prevent this by throttling the send back to once per second
  #       # (which usually means only once).
  #       #
  #       # FIXME - the lodash throttle below has no effect. Why not?
  #       #   send = -> xhr.send(ng.toJson(payload))
  #       #   throttled = _.throttle(send, 1000)
  #       #   throttled()
  #       # TODO - fix above to replace below and remove the guard in the
  #       #   server.coffee /error handler.
  #       xhr.send(ng.toJson(payload))
  #     catch loggingError
  #       # Can't send the error to the server;
  #       # Log to the client only.
  #       $log.warn 'Error logging failed'
  #       $log.log loggingError
  # ]
