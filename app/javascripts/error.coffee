# Print the full error message in an alert box. This is a work-around
# for Chrome bug 331971
# (cf. https://code.google.com/p/chromium/issues/detail?id=331971)
# which truncates long error messages. This code is copied from
# http://stackoverflow.com/a/22218280/674326.
window.onerror = (errorMsg, url, lineNumber, columnNumber, errorObject) ->
  # Check the errorObject as IE and FF don't pass it through (yet).
  if (errorObject && errorObject != undefined)
    errMsg = errorObject.message
  else
    errMsg = errorMsg
  alert('Error: ' + errMsg)
