===============
Developer Guide
===============

********
Overview
********

The ``qiprofile`` module implements the Imaging Profile UI web
application.


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

1. Follow the `qiprofile installation instructions`_, omitting the
   ``--production`` option.

2. Install the Grunt_ CLI command globally::

       npm install -g grunt-cli

3. Run the following in a console from the ``qiprofile`` directory::

       npm install

   This command installs the necessary packages [#xtk_fork]_.

4. Read ``test/e2e/README.rst`` for additional
   testing notes.

5. Run the following Grunt_ script::

       grunt

   The default Grunt task builds the project. The following command
   lists the available Grunt tasks::

       grunt --help


******
Update
******

Update the ``qiprofile`` package as follows::

    git pull
    bower update
    bower install
    bower prune
    npm update
    npm install
    npm prune
    grunt

Check periodically for outdated package specifications by running npmedge_
and npm_collect_.


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

    ./node_modules/.bin/bower install --save <library>

Add a new test library as follows::

    npm install --save-dev <library>

In both cases, after adding the dependency, edit the modified configuration
(``bower.json`` or ``package.json``) to move the added dependency entry to
the appropriate position in the list. The list is in alphabetical sort order
within the following grouping order:

* Application packages

* Test packages

* Grunt packages

If a new library is added, then notify other developers that they need to
run the following to rebuild the application after refreshing their master
branch::

    npm install
    npm prune
    grunt

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

Restrict the tests to run by appending ``.only`` to the target ``describe``
block test suite.

-----

Debugging a unit test case is performed as follows:

* Run the grunt task with the ``--debug`` option, e.g.::

      grunt --debug test:unit

  This starts a Chrome_ test runner but does not run the tests.

* Press the ``DEBUG`` button on the launch page.

* Open the Chrome Developer Tools (DevTools_).

* Set a breakpoint in the ``base/_public/javascripts/app.js`` source file.

* Refresh the page.

-----

The end-to-end tests are run with the Protractor_ framework. The command::

    grunt test:e2e

runs the grunt protractor ``e2e`` task. The Express server must be
running when ``e2e`` is started.

The ``e2e`` task executes as follows:

* Read the ``test/conf/protractor-conf.coffee`` configuration file

* Start the Express test server on port 3001

* Start a Selenium web server as the Mocha test context

* Run the qiprofile-rest_ test seed program

* Exercise the ``test/e2e/`` test cases

* Print the result to the console

Note that the e2e task can fail because of Selenium startup timing issues.
If the test results in a failed connection error, the rerun the task.

A single end-to-end test spec can be run with the ``--specs`` option::

      grunt --specs test/e2e/<spec> test:e2e

The best way to create an end-to-end test is to copy an existing test.
``test/e2e/subjectListSpec.coffee`` is a good example. The ``Page``
helper encapsulates the page being tested.


Coding Standards
----------------
* All unit and end-to-end tests must run successfully before any
  ``git push`` to the GitHub master branch.

* Every new feature should be verified by a new test suite.

* Every bug fix should be verified by a new test case that fails
  before the bug fix and succeeds after the bug fix.

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

* Source code lines are no longer than 80 characters, unless a single
  line is more readable.

* Comment lines are no longer than 72 characters, unless a single line
  is more readable.

* Function calls are on one line unless they exceed the recommended
  length, e.g.::
  
      a = _.concat(first, second)  # Good

  rather than::

      a = _.concat(first,  # Bad
                   second)

* Function arguments are aligned when the function call extends to more
  than one line, e.g.::

      a = _.concat(first, second, third, fourth, fifth, sixth, seventh,
                   eighth)

* Arguments for a function with a long name are placed on a separate
  line if it is more readable, e.g.::

      aLongVariableName.anEvenLongerFunctionName(
          anotherLongVariableName, yetAnotherLongerVariableName
      )

  The closing parenthesis is placed on a separate line if and only if
  the arguments are on a separate line.

* A string argument that extends over one line is broken into a
  concatenation of aligned substrings, e.g.::

      console.log("A long string like this is broken into aligned" +
                  " substrings.")
      

* CoffeeScript function calls with an anonymous function argument
  omit parentheses if and only if the function is defined on a
  separate line, e.g.::

      result = _.sortBy(array, (a, b) -> a.priority - b.priority)
      result = _.sortBy array, (a, b) ->
          a.priority - b.priority

* Functions extending over several lines are defined in a separate
  variable rather than an anonymous argument, e.g.::

      sort_criterion = (a, b) ->
          .
          .
          .
      result = _.sortBy(array, sort_criterion)

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

* A throw argument is always an Error object rather than a string,
  e.g.::

      throw new Error(message)   # Good

 rather than::
 
      throw new message   # Bad

* Error messages are simple, informative text without ending punction,
  e.g.::
  
      throw new Error("The file type is not recognized: #{ file }") # Good
  
  rather than::
  
      throw new Error("Bad file type!")  # Bad

* CoffeeScript, Jade and Stylus string literals have double quotation
  marks if they are evaluated or interpolated, single quotation marks
  otherwise, e.g.::

      simpleString = 'A string'
      interpolatedString = "#{ anotherVariable } string"
      evaluatedString = "data" # where data is an evaluated scope variable
      evaluatedConstant = "'none'" # which evaluates to 'none'

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

* Comments are readable English on a separate line, usually beginning
  with 'The' and ending in a period.
  
* Every public module, class and function is commented using the
  `Writing AngularJS Documentation`_ guideline.[#docCaveat]_

* Each function which is not nested within another function is documented
  using the jsdoc_ convention.

* Each application AngularJS module is documented using the ngdoc_
  convention.

* Pending code changes are described in a ``TODO`` comment.

* Known bugs are described in a ``FIXME`` comment. These items should be
  fixed and the comment deleted before a new version is tagged and
  released.

* Edit forms conform to the REST data model. Specifically:

  - Validate the data upon input as determined by the model
    validation.

  - Resolve conflicts between data capture and the model, e.g. the
    default value or validation.

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

* Version numbers follow the *major*\ .\ *minor*\ .\ *patch* SemVer_ scheme,
  where:
  
  * *major* is 0 for private development checkpoints, 1 for the initial
    alpha public release, 2 for the beta public release, and incremented
    thereafter when a major feature set is introduced
  
  * *minor* and *patch* are numbers only starting at 1

* Prepare to publish changes as follows:

  - Check in all tested changes.

  - Rebase, test and merge the branch as described above.
    You should now be on the ``master`` branch.

* Contributors submit changes by pushing the changes to a
  GitHub fork and sending a pull request to the main
  qiprofile GitHub repository.

* Committers add a new version as follows:

  - Add a short version theme description to ``History.rst``.

  - Increment the ``package.json`` version attribute.

  - Set a git tag with a ``v`` prefix, e.g.::

        git tag v2.1.2

  - Update the server::

        git push
        git push --tags

  - Publish the new module to NPM (cf. the `NPM Publishing Guide`_)::
  
        npm publish

  - Periodically delete unused local and remote branches. Exercise care
    when deleting a stale remote branch. See the
    `Pro Git Book`_ `Deleting Remote Branches`_ section for details.


**********
Deployment
**********

The deployment targets requires two servers:

* the XNAT server

* the qiprofile Express_, qiprofile-rest_ Eve and qiprofile-rest_
  MongoDB servers

Both servers share a Direct Attached Storage (DAS) XNAT archive
directory, e.g. if the DAS mount point is ``/home/groups/quip``
then create the archive directory as follows::

    mkdir -p /home/groups/quip/xnat/archive

The XNAT server is configured to place the image files on this DAS
volume via a symbolic link, e.g.::

    ln -s /home/groups/quip/xnat/archive /var/local/xnat

Thus, when XNAT archives an image file it places it in the standard XNAT
location ``/var/local/xnat/archive``, which in turn resolves the shared
DAS volume location.

XNAT places the image files according to its own fixed hierarchy. For
example, given the above DAS configuration, then the sarcoma patient 1
visit 1 scan 50 file has the following location::

    /home/groups/quip/xnat/archive/
      QIN/arc001/Sarcoma001_Session01/SCANS/50/NIFTI/series050.nii.gz

The corresponding image file for the registration named ``reg_j3P9u``
would be::

    /home/groups/quip/xnat/archive/
      QIN/arc001/Sarcoma001_Session01/RESOURCES/reg_j3P9u/series050.nii.gz

on the shared DAS volume of both servers.

The Express server hosts the qiprofile web app at the following root
directory::

    /var/local/express/webapps/qiprofile

Express finds the image data in the ``data`` subdirectory. Create a
symbolic link to the shared XNAT image location, e.g.::

    ln -s /home/groups/quip/xnat/archive /var/local/express/webapps/qiprofile/data

The qiprofile-rest data model ``Scan`` and ``Registration`` ``files``
field consists of the image file path for each volume. A qipipe_ pipeline task
populates the MongoDB ``qiprofile`` database with new MR session imaging fields,
filling in the files list with the file paths relative to the parent project
location, e.g.::

    Sarcoma001_Session01/SCANS/50/NIFTI/series050.nii.gz

The qiprofile router reads this data into a Javascript session object,
e.g.::

    scan: {
      files: [..., 'Sarcoma001_Session01/SCANS/50/NIFTI/series050.nii.gz', ...]
    }

When the Session Detail scan or registration image download button
is clicked, then qiprofile builds the file location relative to the web app
root directory, e.g.::

    data/QIN/arc001/Sarcoma001_Session01/SCANS/50/NIFTI/series050.nii.gz

where ``QIN`` is the project name. qiprofile then dispatches an HTTP XHR_
request for the static file at that location::

     HTTP GET /static/data/QIN/arc001/Sarcoma001_Session01/SCANS/50/NIFTI/series050.nii.gz

The qiprofile Express server recognizes the ``/static/`` prefix as a request for
a file relative to the web app root and returns the content of the server file,
in this case the file at::

      /var/local/express/webapps/qiprofile/
        data/QIN/arc001/Sarcoma001_Session01/SCANS/50/NIFTI/series050.nii.gz

When the file content is received by the qiprofile client, then the Session Detail
image download button is hidden and the open button is shown. When the open
button is clicked, then the Image Detail page is visited with the image file
content.

The ``qiprofile-rest`` ``test/helpers/seed.py`` script populates the
``ImageContainer`` ``files`` field described above for the 24 Breast and
Sarcoma test MR sessions. The ``grunt test:e2e`` end-to-end testing task runs
the ``qiprofile-rest`` seed script and creates a link in the local ``_public``
web app build to the test image file fixtures location::

      _public/data -> ../test/fixtures/data

The test image files conform to the XNAT file location convention, e.g.::

      test/fixtures/data/
        QIN_Test/arc001/Sarcoma001_Session01/SCANS/50/NIFTI/series050.nii.gz


***********
Antecedents
***********

The ``qiprofile`` application structure is freely adapted from the following
examples:

* frappe_

* angular-express-seed_

* angular-seed_

* angular-app_

* nodejs-polling-app_

* ng-boilerplate_

* Yeoman_


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

.. [#docCaveat]
   Unfortunately, there is not yet a known means of generating AngularJS
   Coffeescript API documentation. `Dgeni`_ ngdoc parsing does not have a
   Coffeescript adapter. `CoffeeDoc`_ `Codo`_ does not parse AngularJS modules.
   The  `Comment passthrough workaround`_ is no help, since ngdoc does not
   detect classes or functions in the compiled Javascript. The best solution
   is the `Dgeni CoffeeScript documentation extractor`_ enhancement proposal.

.. Targets:

.. _frappe: https://github.com/dweldon/frappe

.. _angular-express-seed: https://github.com/btford/angular-express-seed

.. _angular-seed: https://github.com/angular/angular-seed

.. _angular-app: https://github.com/angular-app/angular-app

.. _Bower: http://bower.io/

.. _Chai: http://chaijs.com/

.. _Chrome: https://www.google.com/intl/en_us/chrome/browser/

.. _Codo: https://github.com/coffeedoc/codo

.. _CoffeeScript Style Guide : https://github.com/polarmobile/coffeescript-style-guide

.. _CoffeeDoc: http://coffeedoc.info/

.. _`Comment passthrough workaround`: http://stackoverflow.com/questions/7833021/how-to-document-coffeescript-source-code-with-jsdoc/9157241#9157241

.. _Deleting Remote Branches: http://git-scm.com/book/en/Git-Branching-Remote-Branches#Deleting-Remote-Branches

.. _DevTools: https://developer.chrome.com/devtools/index

.. _Dgeni: https://github.com/angular/dgeni

.. _Dgeni CoffeeScript documentation extractor: https://github.com/angular/dgeni/issues/69

.. _Express: http://expressjs.com/

.. _Grunt: http://www.gruntjs.com/

.. _jsdoc: http://usejsdoc.org/

.. _Karma: http://karma-runner.github.io/0.10/index.html

.. _Mocha: http://visionmedia.github.io/mocha/

.. _ng-boilerplate: http://joshdmiller.github.io/ng-boilerplate/#/home

.. _ngMidwayTester: https://github.com/yearofmoo/ngMidwayTester

.. _Node.js: https://www.nodejs.org/

.. _nodejs-polling-app: http://www.ibm.com/developerworks/library/wa-nodejs-polling-app/

.. _npm: https://www.npmjs.org/

.. _npm-collect: https://www.npmjs.com/package/npm-collect

.. _npmedge: https://www.npmjs.com/package/npmedge#overview

.. _NPM Publishing Guide: https://docs.npmjs.com/getting-started/publishing-npm-packages

.. _ngdoc: https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation

.. _PhantomJS: http://phantomjs.org/

.. _Pro Git Book: http://git-scm.com/book/en/

.. _Protractor: https://github.com/angular/protractor

.. _qipipe: https://github.com/ohsu-qin/qipipe

.. _qiprofile installation instructions: https://github.com/ohsu-qin/qiprofile/blob/master/doc/index.rst

.. _qiprofile-rest: https://github.com/ohsu-qin/qiprofile-rest

.. _SemVer: http://semver.org/

.. _Writing AngularJS Documentation: https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation

.. _XHR: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

.. _XTK: http://www.goXTK.com

.. _XTK Bower Fork: https://www.github.com/FredLoney/get

.. _Yeoman: http://www.yeoman.io/
