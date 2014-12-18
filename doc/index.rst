.. _index:

===================================================================================
qiprofile - The *Qu*\ antitative *I*\ maging *P*\ rofile (*QuIP*\ ) web application
===================================================================================

********
Synopsis
********

The *Qu*\ antitative *I*\ maging *P*\ rofile (*QuIP*\ ) web application displays
imaging and clinical data for the `OHSU QIN Sharepoint`_ study.

:API: https://readthedocs.org/projects/qiprofile/

:Git: github.com/ohsu-qin/qiprofile


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

1. Install Git_ on your workstation.

2. Contact the `OHSU QIN Git administrator`_ to obtain permission
   to access the ``qiprofile`` Git repository.

3. Clone the Git repository::

       cd ~/workspace
       git clone git@quip1:qiprofile

4. Download npm_.

5. Run the following in a console from the ``qiprofile`` directory
   (omit the ``--production`` flag for a development installation)::

       npm install --production

6. Ensure that the file ``bin/qiprofile`` is executable.

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
  All rights reserved.
  ``qiprofile`` is confidential and may not be distributed in any form without authorization.


.. Targets:

.. _Developer Guide: http://quip1.ohsu.edu:8080/qiprofile/development.html

.. _Git: http://www.git-scm.com

.. _Knight Cancer Institute: http://www.ohsu.edu/xd/health/services/cancer

.. _OHSU QIN Git administrator: loneyf@ohsu.edu

.. _OHSU QIN Sharepoint: https://bridge.ohsu.edu/research/knight/projects/qin/SitePages/Home.aspx

.. _npm: https://www.npmjs.org/

.. _qipipe: http://quip1.ohsu.edu:8080/qipipe

.. _qiprofile repository: http://quip1.ohsu.edu:6060/qiprofile


.. toctree::
  :hidden:

  development
