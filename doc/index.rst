.. _index:

===================================================================================
qiprofile - The *Qu*\ antitative *I*\ maging *P*\ rofile (*QuIP*\ ) web application
===================================================================================

********
Synopsis
********

The *Qu*\ antitative *I*\ maging *P*\ rofile (*QuIP*\ ) web application displays
medical imaging and clinical data. The intent is to visualize the correlation of
imaging analysis biomarkers with clinical outcomes.


************
Feature List
************

1. OHSU QIN patient MR visualization.

2. ROI capture.

3. Clincial annotation editor.

4. qipipe_ pharmokinetic modeling result display.


************
Installation
************

1. Download npm_.

2. Run the following in a console from the ``qiprofile`` directory
   (omit the ``--production`` flag for a development installation)::

       npm install --production

See the `Developer Guide`_ for installing a development project.


*****
Usage
*****

Run the following command to start the production server::

     ./bin/qiprofile

See the `Developer Guide`_ for starting a development server.

---------

.. container:: copyright

  Copyright (C) 2014 Oregon Health & Science University `Knight Cancer Institute`_.
  See the license_ for permissions. Please note that qiprofile is research software
  which is neither approved nor recommended for clinical use.


.. Targets:

.. _Developer Guide: https://github.com/ohsu-qin/qiprofile/blob/master/doc/development.rst

.. _Git: http://www.git-scm.com

.. _Knight Cancer Institute: http://www.ohsu.edu/xd/health/services/cancer

.. _license: https://github.com/ohsu-qin/qiprofile/blob/master/LICENSE.txt

.. _npm: https://www.npmjs.org/

.. _qipipe: https://github.com/ohsu-qin/qipipe


.. toctree::
  :hidden:

  development
