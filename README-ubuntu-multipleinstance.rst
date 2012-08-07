Ubuntu Multiple instance Deployment
===================================

This deployment is for production environment


System Dependencies
*******************

.. note:: Tested in Ubuntu 12.04

#. Install packages from Centos repository:

   - python-setuptools
   - python-mysqldb
   - python-dev
   - python-virtualenv
   - memcached
   - mysql-server
   - openssl
   - xmlsec1
   - libxmlsec1-openssl

System configuration
********************

Python packages
+++++++++++++++


#. Download askbot-openmooc package (clone repository or download tar.gz package)

   .. warning::

      These links are linked to development branch

   * Download lastest package

     .. code:: bash

         wget https://github.com/OpenMOOC/askbot-openmooc/tarball/master

#. Create virtualenv:

   .. code:: bash

      virtualenv --system-site-packages askbot-openmooc-venv

#. Load virtualenv:

   .. code:: bash

      source askbot-openmooc-venv/bin/activate

#. Change to askbot-opemooc directory and execute deployment:

   .. code:: bash

      cd askbot-openmooc
      python setup.py develop

#. For testing purposes, you should create your own self-signed certificates.
   For other purposes buy them:

   * Follow the first five steps of this guide:
     http://www.akadia.com/services/ssh_test_certificate.html
   * Copy server.key and server.crt to askbot-openmooc/saml2/certs

   .. code:: bash

      openssl genrsa -des3 -out server.key 1024
      openssl req -new -key server.key -out server.csr
      cp server.key server.key.org
      openssl rsa -in server.key.org -out server.key
      openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

#. Copy local_settings.multiple.py to  local_settings.py
#. Edit local_settings.py and change this (database, memcached,
   recaptcha keys, ...)

#. To config saml2 auth follow djangosaml2 doc at
   http://pypi.python.org/pypi/djangosaml2
   You should set this on local_settings.py file

Apache wsgi configuration
+++++++++++++++++++++++++



Instances configuration
+++++++++++++++++++++++



Create a new askbot-openmooc instance
*************************************



