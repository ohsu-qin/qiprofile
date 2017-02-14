.. _index:

============================
Quantitative Imaging Profile
============================

********
Synopsis
********

The *Q*\ uantitative *I*\ maging *Pr*\ ofile (*QIPr*\ ) web application displays
medical imaging and clinical data. The intent is to visualize the correlation of
imaging analysis biomarkers with clinical outcomes.


************
Feature List
************

1. Side-by-side clinical and pharmacokinetic modeling results display.

2. MR visualization.

3. ROI and modeling overlays.


************
Installation
************

1. Install a REST_ server, if necessary.

2. Install Git_, if necessary.

3. Make a directory to hold your git repository, if necessary, e.g.::

      mkdir -p ~/workspaces
      cd ~/workspaces

3. Clone the qiprofile GitHub repository, e.g.::

      git clone https://github.com/ohsu-qin/qiprofile
      cd qiprofile

2. Download npm_.

3. Run the following in a console from the repository directory
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

     ./bin/qiprofile

4. Once you have a database, e.g. the `Developer Guide`_ demo seed
   database, then the landing page is _host_``:3000/qiprofile``,
   where _host_ is the web application host URL.

See the `Developer Guide`_ for starting a development server.

---------

.. Targets:

.. _Developer Guide: https://github.com/ohsu-qin/qiprofile/blob/master/doc/development.rst

.. _Git: http://www.git-scm.com

.. _Knight Cancer Institute: http://www.ohsu.edu/xd/health/services/cancer

.. _license: https://github.com/ohsu-qin/qiprofile/blob/master/LICENSE.txt

.. _npm: https://www.npmjs.org/

.. _qipipe: http://qipipe.readthedocs.org/en/latest/

.. _REST: http://qiprofile-rest.readthedocs.io/en/latest/

.. _REST Development: http://qiprofile-rest.readthedocs.org/en/latest/#development

.. _REST Usage: http://qiprofile-rest.readthedocs.org/en/latest/#usage


.. toctree::
  :hidden:

  development
