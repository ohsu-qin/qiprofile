End-to-end testing notes
========================

* Running the tests can result in the following errors::

      Client error: SyntaxError: Unexpected end of input
      
      Client error: Error: [$compile:tpload] Failed to load template: /partials/intensity-chart.html

  The partial does load in the browser and it appears that the
  tests are not affected. These messages began occuring after updating
  test packages, but they cannot be isolated to a particular package.
  Since the messages seem to be benign, it is ignored for now.
  
  TODO - revisit this after applying npmedge in late 2015.

* A Page can be instantiated in a before (once per suite) or a beforeEach
  (once per test case). Sometimes the beforeEach page results in an error,
  e.g. if volumeSpec were changed from before to beforeEach then the
  volume resource fails to load. In those cases, use a before page.
  Sometimes, the before page results in an error, e.g. if subjectListSpec
  were changed from beforeEach to before then the following error is
  raised:
  
      Error while waiting for Protractor to sync with the page
  
  In those cases, use a beforeEach page. The putative rationale for the
  difference is the interaction of Protractor with Selenium on angular vs.
  non-angular pages
  (cf. http://stackoverflow.com/questions/23634648/getting-error-error-while-waiting-for-protractor-to-sync-with-the-page/23881721#23881721).

  Briefly, the advice is to get the page as follows:

  * browser.get on angular pages with the Protractor API

  * browser.driver.get on non-angular pages with the Selenium API
  
  However, that rationale does not apply in the aforementioned examples.
  The best, albeit terrible, approach is trial-and-error and cross your
  fingers that it doesn't break over time.
  
  TODO - there must be a better answer!

* Updating mocha from 1.20.1 to 1.21.1 results in the following error::

      Error: timeout of 2000ms exceeded

  protractor ignores the mocha timeout and times out in two seconds instead
  (cf. https://github.com/angular/protractor/issues/1109). Work-around
  suggestions have not corrected the problem. mocha is held back to 1.20.x
  for now.

  TODO - retry updating mocha in late 2015.

* The ``it.only`` qualifier results in the following error::

      /Users/loneyf/workspace/qiprofile/node_modules/mocha/lib/interfaces/bdd.js:124
            var reString = '^' + utils.escapeRegexp(test.fullTitle()) + '$';
                                                         ^
      TypeError: Cannot call method 'fullTitle' of undefined
          at Function.context.it.only (/Users/loneyf/workspace/qiprofile/node_modules/mocha/lib/interfaces/bdd.js:124:52)
          ...

  ``describe.only`` runs correctly in protractor. Both ``it.only`` and ``describe.only``
  run correctly in karma unit tests.

  The work-around is to confine use of ``only`` to ``describe``.

  TODO - retry ``it.only`` in 2015.

