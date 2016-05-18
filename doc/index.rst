.. _index:

===================================================================================
*QiPr*
===================================================================================

********
Synopsis
********

The *Q*\ uantitative *I*\ maging *PR*\ ofile (*QiPr*\ ) web application displays
medical imaging and clinical data. The intent is to visualize the correlation of
imaging analysis biomarkers with clinical outcomes.


************
Feature List
************

1. Side-by-side clinical and pharmokinetic modeling results display.

2. MR visualization.

3. ROI and modeling overlays.


************
Installation
************

1. Install a REST_ server, if necessary.

2. Download npm_.

3. Run the following in a console from the ``qiprofile`` directory
   (omit the ``--production`` flag for a development installation)::

       npm install --production

See the `Developer Guide`_ for installing a development project.


*****
Usage
*****

1. Populate the qiprofile database. A test database is available
   in the REST_ project, as described in the `REST Development`_
   section. The production database is populated by the qipipe_
   pipeline.

2. Start the REST server, as described in the `REST Usage`_ section.

3. Run the following command to start the web application server::

     qiprofile

See the `Developer Guide`_ for starting a development server.

---------

.. container:: copyright


.. Targets:

.. _Developer Guide: https://github.com/ohsu-qin/qiprofile/blob/master/doc/development.rst

.. _Git: http://www.git-scm.com

.. _Knight Cancer Institute: http://www.ohsu.edu/xd/health/services/cancer

.. _license: https://github.com/ohsu-qin/qiprofile/blob/master/LICENSE.txt

.. _npm: https://www.npmjs.org/

.. _qipipe: http://qipipe.readthedocs.org/en/latest/

.. _REST: http://qiprofile-rest.readthedocs.org/en/latest/

.. _REST Development: http://qiprofile-rest.readthedocs.org/en/latest/#development

.. _REST Usage: http://qiprofile-rest.readthedocs.org/en/latest/#usage


.. toctree::
  :hidden:

  development
