import glob
from setuptools import (setup)

from qiprofile import __version__

requires = ['django', 'django-rest-framework']

def readme():
    with open("README.rst") as f:
        return f.read()

setup(
    name = 'qiprofile',
    version = __version__,
    author = 'OHSU Knight Cancer Institute',
    author_email = 'loneyf@ohsu.edu',
    packages = ['qiprofile'],
    package_dir = dict(qiprofile='api')
    scripts = glob.glob('bin/*'),
    url = 'http://quip4.ohsu.edu/8080/qiprofile',
    description = 'qiprofile displays QIN images and clinical data.',
    long_description = readme(),
    classifiers = [
        'Development Status :: 3 - Alpha',
        'Topic :: Scientific/Engineering :: Bio-Informatics',
        'Environment :: Web Environment',
        'Framework :: Django'
        'Intended Audience :: Science/Research',
        'License :: Other/Proprietary License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
        'Natural Language :: English'
    ],
    install_requires = requires
)
