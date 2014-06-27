===============
Developer Guide
===============

********
Overview
********

The ``qiprofile`` module implements the Imaging Profile UI web application.


***********
Antecedents
***********

The ``qiprofile`` application structure is adapted from the following
examples:

* frappe_

* angular-express-seed_

* angular-seed_

* angular-app_

* nodejs-polling-app_

* ng-boilerplate_

* Yeoman_


************
Dependencies
************
The server library dependencies are manged by npm_ using the
``package.json`` list. The run-time client library dependencies
are managed by Bower_ using the ``bower.json`` list. These
library lists specify the last known working version configuration.

The npm or bower ``update`` command fetches the most current
minor version, e.g. an update of the specification::

    "chai": "~1.9.1"

will install the most recent 1.9.x version, but not a 1.10.x or
2.x.y version.

See the *Development* section below for adding a new dependency.


*****
Setup
*****

1. Clone the ``qiprofile`` Git project as described in the Installation
   section.

2. Install the `Node.js`_ npm_ package manager.

3. Install the bower_ client Javascript package manager globally::

       npm install -g bower

4. Install the Grunt_ CLI command globally::

       npm install -g grunt-cli

5. Install the PhantomJS_ headless web server globally::

       npm install -g phantomjs

6. Run the following in a console from the ``qiprofile`` directory::

       npm install

This command installs the necessary packages [#xtk_fork]_.

7. Run the following Grunt_ script::

       grunt

  The default Grunt task builds the project. The following command
  lists the available Grunt tasks::
  
      grunt --help


***********
Development
***********

Project structure
-----------------
The project is organized as follows::

    qiprofile/        # Top-level project directory
      _public/        # Web app root
      app/            # Source code
        app.coffee    # AngularJS application definition
        index.jade    # Landing page
        javascripts/  # Application non-vendor CoffeeScript 
        layout/       # Common HTML layout
        partials/     # AngularJS partial Jade
          help/       # Help content, one per main view
          include/    # Jade include files
        stylesheets/  # Application non-vendor Stylus
      bin/            # Command line scripts
        qiprofile     # Web app server script
      doc/            # Application documentation
      server/         # Express server configuration
      server.js       # Express server startup script
      static/         # Static content
        media/        # Images, icons and videos
      test/           # Top-level test directory
        conf/         # Test configuration files
        e2e/          # End-to-end tests
        unit/         # Unit tests

Adding dependencies
-------------------
Add a new client library as follows::

    bower install --save <library>

Add a new test library as follows::

    npm install --save-dev <library>

In both cases, after adding the dependency, edit the modified configuration
(``bower.json`` or ``package.json``) to move the added dependency entry to
the appropriate position in the list. The list is in alphabetical sort order
within the following grouping order:

* Application packages

* Test packages

* Grunt packages

Each package occurs after packages on which it depends.

If a new client library is added, then notify other developers that they
need to run ``grunt`` to rebuild the application after refreshing their
master branch.

If a new test library is added, then notify other developers that they
need to run ``npm install`` after refreshing their master branch.

Testing
-------
Testing is performed by the following grunt tasks\ [#midway]_:

* ``test:unit``: Run the unit tests

* ``test:e2e``: Run the end-to-end tests

The unit tests are run with the Karma_ test runner using the Mocha_ and
Chai_ frameworks and the PhantomJS_ headless server. The command::

    grunt test:unit

runs the grunt karma ``unit`` task as follows:

* Read the ``test/conf/karma-conf.coffee`` configuration file

* Start a headless web server as the Mocha test context

* Exercise the ``test/unit/`` test cases

* Print the result to the console

Debugging a unit test case is performed as follows:

* Run the grunt task with the ``--debug`` option, e.g.::

      grunt --debug test:unit
  
  This starts the test runner but does not run the tests.

* Open a Chrome web browser to the ``http://localhost:9876/test/`` page.

* Press the ``DEBUG`` button on that page.

* Open the Chrome Developer Tools (DevTools_).

* Set a breakpoint in the ``base/_public/javascripts/app.js`` source file.

* Refresh the page.

The end-to-end tests are run with the Protractor_ framework. The command::

    grunt test:unit

runs the grunt protractor ``e2e`` task as follows:

* Read the ``test/conf/protractor-conf.coffee`` configuration file

* Start the Express test server on port 3001

* Start a Selenium web server as the Mocha test context

* Run the qiprofile-rest_ test seed program

* Exercise the ``test/e2e/`` test cases

* Print the result to the console

A single end-to-end test spec can be run with the ``--specs`` option::

      grunt --specs test/e2e/<spec> test:e2e

The best way to create an end-to-end test is to copy an existing test.
``test/e2e/subjectListSpec.coffee`` is a good example. The ``Page``
helper encapsulates the page being tested.


Coding Standards
----------------
* All application JavaScript is compiled from an ``app/javascripts``
  CoffeeScript file. If working from a JavaScript example, adapt it to an
  equivalent CoffeeScript, which has the added benefit of understanding
  and trimming the example.

* All test cases are written as CoffeeScript files in the appropriate
  ``unit`` or ``e2e`` test subdirectory. The CoffeeScript test case
  is compiled on the fly to JavaScript by the Karma_ or Protractor_ test
  runner.

* All dynamic application HTML is compiled from an ``app/partials`` or
  ``app/templates`` CoffeeScript file.

* All application CSS is compiled from the ``app/stylesheets/site.styl``
  Stylus file.

* Non-test file names are lower case hyphenated rather than underscore.

* Test case file names are camelCase beginning with the application
  module or partial being tested and ending in ``Spec``, e.g.
  ``test/e2e/subjectListSpec.coffee``.

* CoffeeScript follows the `CoffeeScript Style Guide`_.

* CoffeeScript variable names are camelCase rather than underscore.

* CoffeeScript function calls with an anonymous function argument
  omit parentheses, e.g.::

      result = _.sortBy array, (a, b) -> a.priority - b.priority
  
* Function and array boundaries are not padded with a string, e.g.::

      module = angular.module('qiprofile')    # Good
      numbers = [1, 2, 3]
  
  rather than::

      module = angular.module( 'qiprofile' )  # Bad
      numbers = [ 1, 2, 3 ]

* CoffeeScript function definitions without arguments omit the
  parentheses, e.g.::

      doSomethingUseful = ->
        ...

* CoffeeScript, Jade and Stylus string literals have double quotation
  marks if they are interpolated, single quotation marks otherwise,
  e.g.::
  
      simpleString = 'A string'
      interpolatedString = "#{ anotherVariable } string"
  
  Interpolations are padded with a space.

* CoffeeScript promise chain ``.then`` and AngularJS routeProvider
  ``.when`` clauses are indented, e.g.::
  
      promise
        .then (result) ->
          ...
        .then (more) ->
          ...
  
* Single unchanined promise ``.then`` calls are on the same line, e.g.::
  
      promise.then (result) ->
        ...

* Every application AngularJS directive is camelCase prefixed by ``qi``,
  e.g. ``qiSpin``.

* Every custom CSS style is dash-separated lower case preceded by ``qi``,
  e.g. ``qi-billboard``

* Comments are readable English, usually beginning with 'The' and ending
  in a period.

* Each function which is not nested within another function is documented
  using the jsdoc_ convention.

* Each application AngularJS module is documented using the ngdoc_
  convention.

* Changes are made in a git branch. Make a local git branch by executing
  the following command::
  
      git checkout -b <branch>
  
  The branch name is lower case underscore, e.g. ``image_detail``. A
  long-lived or jointly developed branched is pushed to master, e.g.
  
      git push origin <branch>
  
  Rebase the branch from time to time as follows:
  
      git rebase master
  
  This integrates the branch with the master, detects conflicts and
  facilitates subsequent merge.
  
  Before merging the branch with the master, rebase and run all tests:
  
      grunt test
  
  The branch is merged into the master with the following commands:
  
      git checkout master
      git merge --no-ff <branch>
  
  Note the ``--no-ff`` option, which ensures that an audit trail of the
  merge is kept in a log commit, even if there are no merge conflicts.

* The first step in adding new functionality is to create a (failing)
  test case. Add new expectations to the test case as development
  progresses. A passing full-featured test case is necessary before
  integrating the branch into the master.

* Commit git changes early and often. The commit message is a concise,
  meaningful, readable change description. The message begins with a
  capital letter and ends with a period, e.g.::
  
      Add a bolus arrival bar to the intensity chart.
  
  rather than::
  
      change intensity chart

  If a git comment is longer than one sentence, then the commit probably
  should have been broken out into several commits.

* Version numbers follow a one-based *major*\ .\ *minor*\ .\ *patch* format.
  The version numbering scheme loosely follows the SemVer_ standard. The
  major version is incremented at the initiation of a substantial new
  public feature set. The minor version is incremented when there is a
  backward-compatible functionality change. The patch version is
  incremented when there is a backward-compatible refactoring or bug fix.
  The major version number is 0 for proof-of-concept releases, 1 for
  releases leading to initial public availability. Minor and patch
  version numbers begin at 1 rather than 0.

* Add a new version as follows:

  * Add a short version theme description to ``History.rst``.
  
  * Increment the ``package.json`` version attribute.
  
  * Check in all tested changes.

  * Rebase, test and merge the branch as described above.
    You should now be on the ``master`` branch.
  
  * Set a git tag with a ``v`` prefix, e.g.::
  
        git tag v2.1.2
  
  * Update the server::
  
        git push --tags

  * Periodically delete unused local and remote branches. Exercise care
    when deleting a stale remote branch. See the
    `Pro Git Book`_ `Deleting Remote Branches`_ section for details.

  
.. rubric:: Footnotes

.. [#xtk_fork]
  :Note: XTK_ is not packaged for Bower_ or npm_. The `XTK Bower Fork`_
    remedies this omission. The qiprofile ``bower.json`` definition file
    specifies this GitHub fork. The ``edge`` XTK version is used, following
    the recommendation on the XTK_ home page.

.. [#midway]
   The ngMidwayTester_ purports to offer a testing solution intermediate
   to unit and end-to-end testing. However, this package was evalutated
   and found to be faulty and poorly documented, supported and maintained. 

.. Targets:

.. _frappe: https://github.com/dweldon/frappe

.. _angular-express-seed: https://github.com/btford/angular-express-seed

.. _angular-seed: https://github.com/angular/angular-seed

.. _angular-app: https://github.com/angular-app/angular-app

.. _Bower: http://bower.io/

.. _Chai: http://chaijs.com/

.. _Chrome: https://www.google.com/intl/en_us/chrome/browser/

.. _CoffeeScript Style Guide : https://github.com/polarmobile/coffeescript-style-guide

.. _DevTools: https://developer.chrome.com/devtools/index

.. _Pro Git Book: http://git-scm.com/book/en/

.. _Deleting Remote Branches: http://git-scm.com/book/en/Git-Branching-Remote-Branches#Deleting-Remote-Branches

.. _Grunt: http://www.gruntjs.com/

.. _jsdoc: http://usejsdoc.org/

.. _ng-boilerplate: http://joshdmiller.github.io/ng-boilerplate/#/home

.. _Karma: http://karma-runner.github.io/0.10/index.html

.. _Mocha: http://visionmedia.github.io/mocha/

.. _ngMidwayTester: https://github.com/yearofmoo/ngMidwayTester

.. _Node.js: https://www.nodejs.org/

.. _nodejs-polling-app: http://www.ibm.com/developerworks/library/wa-nodejs-polling-app/

.. _npm: https://www.npmjs.org/

.. _ngdoc: https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation

.. _PhantomJS: http://phantomjs.org/

.. _Protractor: https://github.com/angular/protractor

.. _qiprofile-rest: http://quip1.ohsu.edu/8080/qiprofile-rest

.. _SemVer: http://semver.org/

.. _XTK: http://www.goXTK.com

.. _XTK Bower Fork: https://www.github.com/FredLoney/get

.. _Yeoman: http://www.yeoman.io/
