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
   - libapache2-mod-wsgi
   - sphinxsearch

System configuration
********************

Mysql Database
++++++++++++++

Remember enable sphinxsearch to start at boot modifying /etc/default/sphinxsearch

There are some askbot migrations thats require full text search on mysql storage engine. 


.. warning::

   You must have a MyISAM as mysqld storage. In ubuntu 12.04 InnoDB is the
   default value. Do this before create database.

Configure your mysql to use MyISAM:

    .. code:: bash

       cp mysqld/askbot-openmooc.cnf /etc/mysqld/conf.d/
       service mysql restart


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

#. Recolect static media files

   .. code:: bash

      python manage.py collectstatics

Apache wsgi configuration
+++++++++++++++++++++++++

.. note::

   In example, I have created mooc user, you must change its if you have create another one or
   has deployed over another path.


1. Link apache2/questions-site-multipleinstance.conf to /etc/apache2/sites-available

   .. code-block::
      ln -s /home/mooc/askbot-openmooc/apache2/questions-site-multipleinstance.conf /etc/apache2/sites-available/questions-site-multipleinstance

2. Enable site

   .. code-block::
      a2enmod questions-site-multipleinstance


Sphinx configuration
++++++++++++++++++++


Instances configuration
+++++++++++++++++++++++

There are 3 settings files. This is very important, because we have this settings levels:

  * Askbot-openmooc generic settings at askbot-openmooc/askbotopenmooc/settings.py
  * Generic settings for all instances: askbot-openmooc/local_settings.py
  * Per course settings: courses/coursename/course_settings.py

You must set database host, SAML_CONFIG and another global settings in Generic settings.

You must set course name and another specific course settings in Course settings.


Create a new askbot-openmooc instance
*************************************

.. note::

   We use /home/mooc/courses as courses base path

1. Copy courses from example_courses directory to yout courses base path.

   .. code-block:: bash

      cp /home/mooc/askbot-openmooc/example-courses/courses /home/mooc/courses

2. Courses take baseurl from course directory name, then if you want a maths url
   course you need to copy skel to /home/mooc/courses/maths

   .. code-block:: bash

      cp /home/mooc/courses/skel /home/mooc/courses/maths

3. Create database for course:

   .. code-block:: bash

      
        mysqladmin -p -u root create askbot_maths

        mysql -p -u root
        GRANT ALL PRIVILEGES ON askbot_maths.* TO 'askbot'@'localhost' IDENTIFIED
        BY 'askbot';
        FLUSH PRIVILEGES;


4. Initialize database:

   Go to course directory and execute this with askbot-openmooc virtualenv enabled.

   .. code-block:: bash

      python manage.py syncdb
      python manage.py migrate askbot


