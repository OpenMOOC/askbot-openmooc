Centos Develop Deployment
=========================

System Dependencies
*******************

.. note:: Tested in Centos 6.2

#. Install packages from Centos repository:

   - python-setuptools
   - MySQL-python
   - python-devel
   - python-imaging
   - memcached
   - mysql-server
   - openssl
   - git (for develop only)
   - httpd
   - mod_wsgi
   - mod_ssl

#. Set memcached and mysql-server to start on system boot.

   .. warning::

     Remeber start mysqld and set root password

   .. code-block:: bash

     # chkconfig mysqld on
     # chkconfig memcached on

#. Create user mooc

   .. code-block:: bash

      # adduser mooc


#. Install virtualenv:

   .. code-block:: bash

     # easy_install virtualenv


#. Install xmlsec1 from EPEL repository:

   .. warning::

     This link (ln) is mandatory to run saml2 auth

   .. code-block:: bash

     # yum install http://epel.mirror.mendoza-conicet.gob.ar/6/x86_64/xmlsec1-1.2.16-2.el6.x86_64.rpm  http://epel.mirror.mendoza-conicet.gob.ar/6/x86_64/xmlsec1-openssl-1.2.16-2.el6.x86_64.rpm
     # ln -s /usr/lib64/libxmlsec1-openssl.so.1 /usr/lib64/libxmlsec1-openssl.so


#. Create database:

   .. note::

      If you have just installed mysqld, you need set a password
      You can get how do this by starting mysql service executing
      service mysqld start

   #. Create database:

      .. code-block:: bash

        mysqladmin -p -u root create askbot

   #. Create user and give permissions to access askbot.

      .. code-block:: bash

        mysql -p -u root
        GRANT ALL PRIVILEGES ON askbot.* TO 'askbot'@'localhost' IDENTIFIED
        BY 'askbot';
        FLUSH PRIVILEGES;


#. Download spanish translated branch:

   .. code-block:: bash

     git clone git://github.com/OpenMOOC/askbot-devel.git
     cd askbot-devel
     git checkout -b spanish-translations origin/spanish-translations

     ## Check the last changed author is someone from @yaco.es
     git log | head


#. Download askbot-openmooc package (clone repository or download tar.gz package)

   .. warning::

      These links are linked to development branch

   * Clone repository

     .. code-block:: bash

       git clone git://github.com/OpenMOOC/askbot-openmooc.git

   * Download lastest package

     .. code-block:: bash

       wget https://github.com/OpenMOOC/askbot-openmooc/tarball/master

#. Create virtualenv:

   .. code-block:: bash

     virtualenv --system-site-packages askbot-openmooc-venv

#. Load virtualenv:

   .. code-block:: bash

      source askbot-openmooc-venv/bin/activate

#. Change to askbot-opemooc directory and execute deployment:

   .. code-block:: bash

     cd askbot-devel
     python setup.py develop
     cd ../askbot-openmooc
     python setup.py develop

#. Install django-avatar *(DISABLED)*

   Django-avatar repository doesn't exits

   using this: http://askbot.org/doc/optional-modules.html#uploaded-avatars

   .. code-block:: bash

     pip install -e git+git://github.com/ericflo/django-avatar.git#egg=django-avatar

#. For testing purposes, you should create your own self-signed certificates.
   For other purposes buy them:

   * Follow the first five steps of this guide:
     http://www.akadia.com/services/ssh_test_certificate.html
   * Copy askbot-openmooc/saml2 to your saml2 directory, like $HOME/saml2
   * Create certs directory

     .. code-block:: bash

       mkdir $HOME/saml2/certs.

   * Copy server.key and server.crt to askbot-openmooc/saml2/certs or change
     SAML2DIR in local_settings.py to specify saml2 base dir. You must copy
     askbot-openmooc/asml2/attribute-maps to SAML2DIR directory.

     .. code-block:: bash

        openssl genrsa -des3 -out server.key 2048
        openssl req -new -key server.key -out server.csr
        cp server.key server.key.org
        openssl rsa -in server.key.org -out server.key
        openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt


     .. code-block:: bash
        # key without password

        openssl genrsa -out server.key 2048
        openssl req -new -key server.key -out server.csr
        openssl rsa -in server.key -out server.key
        openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

#. Copy local_settings.multiple.py to local_settings.py askbot-openmooc
   directory

#. Edit local_settings.py and change this (database, memcached,
   recaptcha keys ...)

#. To config saml2 auth follow djangosaml2 doc at
   http://pypi.python.org/pypi/djangosaml2
   You should set this on local_settings.py file

#. Recreate statics file directory with collectstatic command:

   .. code-block:: bash

      python manage.py collectstatic

#. Allow apache2 user access to static files and create wsgi socket directory

   .. code-block:: bash

      # gpasswd -a apache mooc
      mkdir /home/mooc/sockets
      chmod g=rx /home/mooc
      chmod go= /home/mooc/*
      chmod 770 /home/mooc/sockets
      chmod g=rx -R /home/mooc/static_root


#. Copy apache example config to apache

   .. code-block:: bash

      # cp /home/mooc/askbot-openmooc/apache2/questions-site-multipleinstance.conf \
      /etc/httpd/conf.d/questions-site-multipleinstance.conf
      # service httpd reload


#. Add metadata entities url to your idp. The url for file generated is like
   this: http://questions.example.com/m/group-metadata.xml Execute the follow
   command to genereate it when you have any courses:

   .. code-block:: bash

      python manage.py update_entries_metadata


#. Enable cron process:

   .. code-block:: bash

      # cp /home/mooc/askbot-openmooc/crond/* /etc/cron.daily



create your first course using script create_curse.sh
*****************************************************

at first, i recommend you to put course_skel path in your .bash_profile file.
and then, copy askbot-openmooc/courses_example/courses/skel to your selected
path. ~/course_skel could be good. you must be in a virtualenv loaded.

.. code-block:: bash

   cp -a ~/askbot-openmooc/courses_example/courses/skel/ ~/course_skel

then, you can use the script as follow, remember that root mysql password will
be asked you, as a teacher user and django admin user:

remember that database name can't have spaces, slash, dash or diacritical marks

.. code-block:: bash

   ~/askbot-openmooc/utils/create_course.sh course-slug databasename


Create a new course using script create_curse.sh
************************************************

With COURSE_SKEL path in your .bash_profile file and virtualenv loaded.  you
can use the script as follow, remember that root mysql password will be asked
you, as a teacher user and django admin user:

Remember that database name can't have spaces, slash, dash or diacritical marks

.. code-block:: bash

   ~/askbot-openmooc/utils/create_course.sh course-slug databasename


create a new course
*******************

#. Create courses directory and allow apache2 access to it (upfiles directory).
   You can change this directory modifying setting COURSES_DIR property in
   local_settings.py and apply this change to apache conf.

   .. code-block:: bash

      usermod -a -G mooc apache
      mkdir /home/mooc/courses
      chmod 750 /home/mooc/courses

#. If this is your first course, create a course template directory.

   .. code-block:: bash

      cp -R /home/mooc/askbot-openmooc/courses_example/courses/skel \
         ~/skel_course


#. Create a new course directory copying your skel_course to your COURSES_DIR

   .. code-block:: bash

      cp -R ~/skel_course courses/yourcoursename

#. Remember edit the file course_settings.py and change COURSE_TITLE and another
   settings like COURSE_URL (moocng course url).

#. Create database

   .. code-block:: bash

      mysqladmin -p -u root create askbot_yourcoursename
      mysql -p -u root

   .. code-block:: sql

      GRANT ALL PRIVILEGES ON askbot_yourcoursename.* TO 'askbot'@'localhost';
      FLUSH PRIVILEGES;

#. Initialize database. With virtualenv enabled, do this:

   .. code-block:: bash

      cd /home/mooc/courses/yourcoursename
      python manage.py syncdb
      python manage.py migrate

#. Create teacher user and it as moderator:

   .. code-block:: bash

      python manage.py add_askbot_user --user-name=teachername \
            --email='teachermail@example.com'
      python manage.py set_moderator teachermail@example.com

#. Update saml2 metadata entities. Execute this in askbot-openmooc directory:

   .. code-block:: bash

      python manage.py update_entries_metadata

#. Go to your idp and call update entries, You can go to a url like this:
   https://idp.example.com/simplesaml/module.php/metarefresh/fetch.php

