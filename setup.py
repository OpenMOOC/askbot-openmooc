# Copyright 2012 Rooter. All rights reserved.
import fnmatch
from setuptools import setup, find_packages
import os



def read(*rnames):
    return open(os.path.join(os.path.dirname(__file__), *rnames)).read()


def recursive_include(directory, patterns):
    result = []
    for root, dirs, files in os.walk(directory):
        child_root = root.replace(directory, '').lstrip('/')
        for pattern in patterns:
            result.extend([os.path.join(child_root, name)
                           for name in fnmatch.filter(files, pattern)])
    return result


version = '0.0'

setup(name='askbot-openmooc',
      version=version,
      description=("Askbot openmooc integration (theme, saml2, tags api)"),
      long_description=(read('README.rst') + '\n\n' + read('CHANGES.rst')),
      classifiers=[
        'Development Status :: 6 - Development',
        'Environment :: Web Environment',
        'Framework :: Django',
        'License :: OSI Approved :: Apache Software License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
      ],
      keywords='askbot openmoc',
      author='Rooter',
      url='https://github.com/OpenMOOC/askbot-openmooc',
      license='Apache Software License',
      packages=find_packages('.'),
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'askbot==0.7.43-openmooc',
          'djangosaml2==0.9.0',
          'python-memcached',
          # 'django-sphinx', this doesn't run with askbot
      ],
      entry_points="""
      # -*- Entry points: -*-
      """,
      )
