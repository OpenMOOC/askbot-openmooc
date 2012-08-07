Ubuntu Develop Deployment
=========================

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
   - git (for develop only)
   - xmlsec1
   - libxmlsec1-openssl

#. Create database:

   .. note::
      If you have just installed mysqld, you need set a password
      You can get how do this by starting mysql service executing
      service mysqld start

   #. Create database:

      .. code:: bash

        mysqladmin -p -u root create askbot

   #. Create user and give permissions to access askbot.

      .. code:: bash

        mysql -p -u root
        GRANT ALL PRIVILEGES ON askbot.* TO 'askbot'@'localhost' IDENTIFIED
        BY 'askbot';
        FLUSH PRIVILEGES;

#. Download askbot-openmooc package (clone repository or download tar.gz package)

   .. warning::

      These links are linked to development branch

   * Clone repository

     .. code:: bash

         git clone git://github.com/OpenMOOC/askbot-openmooc.git

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

#. Copy local_settings.example.py to manage.py or django.wsgi directory as
   local_settings.py:
#. Edit local_settings.py and change this (database, memcached,
   recaptcha keys, ...)

#. To config saml2 auth follow djangosaml2 doc at
   http://pypi.python.org/pypi/djangosaml2
   You should set this on local_settings.py file

#. Initialize database:

   .. code:: bash

      python manage.py syncdb
      python manage.py migrate

#. Run server to test it:

   .. code:: bash

      python manage.py runserver
