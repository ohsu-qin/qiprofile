End-to-end testing notes
========================

* Updating mocha from 1.20.1 to 1.21.1 results in the following error::

      Error: timeout of 2000ms exceeded

  protractor ignores the mocha timeout and times out in two seconds instead
  (cf. https://github.com/angular/protractor/issues/1109). Work-around
  suggestions have not corrected the problem. mocha is held back to 1.20.x
  for now.

  TODO - retry updating mocha in 2015.

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

