********
Overview
********

The ``qiprofile`` module implements the Imaging Profile UI web application.
The 



***********
Antecedents
***********

The ``qiprofile`` application structure is initialized from the Yeoman_
``angular`` generator and adapted from the following examples:

* frappe_

* angular-express-seed_

* angular-seed_

* angular-app_

* nodejs-polling-app_

* ng-boilerplate_


************
Dependencies
************
The library dependencies are managed by Bower_ using the ``bower.json`` list.
This library list specifies the last known working version configuration.
In order to update the list,

*****
Setup
*****

1. Clone the ``qiprofile`` Git project as described in the Installation
   section.

2. Install npm_ and Grunt_.

3. Run the following in a console from the ``qiprofile`` directory::

       bower install

This command installs the necessary `Node.js`_ packages [#xtk_fork]_.

4. Run the following Grunt_ script::

       grunt

.. rubric:: Footnotes

.. [#xtk_fork]
  :Note: XTK_ is not packaged for Bower_ or npm_. The `XTK Bower Fork`_ remedies
  this omission.The qiprofile ``bower.json`` definition file specifies this GitHub fork.
  The ``edge`` XTK version is used, following the recommendation on the _XTK home page.


.. Targets:

.. _frappe: https://github.com/dweldon/frappe

.. _angular-express-seed: https://github.com/btford/angular-express-seed

.. _angular-seed: https://github.com/angular/angular-seed

.. _angular-app: https://github.com/angular-app/angular-app

.. _nodejs-polling-app: http://www.ibm.com/developerworks/library/wa-nodejs-polling-app/

.. _ng-boilerplate: http://joshdmiller.github.io/ng-boilerplate/#/home

.. _Bower: http://bower.io/

.. _Grunt: http://www.gruntjs.com/

.. _Node.js: https://www.nodejs.org/

.. _npm: https://www.npmjs.org/

.. _XTK: http://www.goXTK.com

.. _XTK Bower Fork: https://www.github.com/FredLoney/get

-- _Yeoman: http://www.yeoman.io/