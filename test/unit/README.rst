Unit testing notes
==================

* phantomjs versions greater than 1.9.13 display the following line
  when run by grunt test:unit::

      /Users/loneyf/workspace/qiprofile/node_modules/phantomjs/lib/location.js:1
      (function (exports, require, module, __filename, __dirname) {

  The cause is perhaps a corrupted location.js
  (cf. https://github.com/Medium/phantomjs/issues/279). The line
  seems to be harmless and the tests succeed.
  
  TODO - revisit this and the following note after phantomjs 2 is released
  as a NPM package and supported by the grunt test runner.

* The developer must independently set PHANTOMJS_BIN to work around the
  following phantomjs bug:
  -  phantomjs unit testing hangs if there is only a global phantomjs,
     and issues an error message that it can't find phantomjs if there
     is only a local phantomjs. The work-around is set the PHANTOMJS_BIN
     environment variable to the local phantomjs executable, e.g.::
     
         export PHANTOMJS_BIN=$HOME/workspace/qiprofile/node_modules/phantomjs/bin/phantomjs
