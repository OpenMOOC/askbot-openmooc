#!/usr/bin/env python
# -*- coding: utf8 -*-
# Copyright 2013 Yaco Sistemas S.L.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
Askbot instance administration tool for creating, disabling or destroying
askbot instances
"""

# - Create methods that invoke fabric to copy the nginx.forward.conf if
#    necessary to the proxy nginx (_copy_to_remote). TODO
# - Create method that launches the supervisor and gunicorn of the instance

import sys
import os
import time


# Check Python version
if sys.version_info < (2, 6, 0):
    print(' [WARNING] This script needs python 2.6. We don\'t guarantee it '
          'works on other python versions.')
elif sys.version_info >= (3, 0, 0):
    sys.stderr.write(' [ERROR] This script doesn\'t work in python 3.x series. '
                     'Exiting.')
    sys.exit(2)

# Add directories to path
sys.path.insert(0, '/etc/openmooc/askbot')
sys.path.insert(0, os.getcwd())

import shutil
import optparse
import requests
import subprocess

try:
    import instances_creator_conf as icc
    #from fabric.api import run, env, hosts  # TODO
    import psycopg2
except ImportError:
    sys.stderr.write(' [ERROR] Either we couldn\'t import the default settings '
                     '(instances_creator_conf) or you don\'t have psycopg2 '
                     '(Python PostgreSQL binding) installed.')
    sys.exit(3)

os.environ['PGPASSWORD'] = icc.DB_PASSWORD


class AskbotInstance():

    def __init__(self):
        """
        Shared stuff between all the methods.
        """
        # Detect if $USER=root
        if not os.environ['USER'] == 'root':
            self.abort(' [ERROR] This script requires root access.')

        # Include the default instances dir in the PATH
        sys.path.insert(0, icc.DEFAULT_INSTANCE_DIR)

    #def _copy_to_remote(self, nginx_forward_file): # TODO
        #"""
        #Copies to the remote host specified in REMOTE_HOST the nginx forward
        #file.
        #"""
        #env.hosts = [icc.REMOTE_HOST]
        #put(nginx_forward_file, '/etc/nginx')

    def _populate_file(self, original_file, values):
        """
        Basic abstraction layer for populating files on demand

        original_file has to be a path to the file in string format
        values is a dictionary containing the necessary key:value pairs.
        """
        f = open(original_file, 'r')
        file_content = f.read()
        f.close()
        # Create a new populated file. We use ** so we can use keyword
        # replacement
        populated_settings = file_content.format(**values)
        # Open the file in write mode so we can rewrite it
        f = open(original_file, 'w')
        f.write(populated_settings)
        f.close()

    def create_instance(self, instance_name, instance_db_name):
        """
        Create the main instance in the instances directory.
        """
        INSTANCE_DIR = os.path.join(icc.DEFAULT_INSTANCE_DIR, instance_name)
        # First, copy the skel template in the destination directory
        try:
            shutil.copytree(icc.SKEL_DIR, INSTANCE_DIR)
            os.chdir(INSTANCE_DIR)
            # Second, call populate_file
            template = os.path.join(INSTANCE_DIR, 'instance_settings.py')

            os.symlink(
                os.path.join('/usr', 'bin', 'openmooc-askbot-admin'),
                os.path.join(INSTANCE_DIR, 'manage.py'))

            values = {
                'instance_name': instance_name,
                'instance_db_name': instance_db_name,
                'instance_db_host': icc.DB_HOST,
                'base_url': icc.BASE_URL
            }
            self._populate_file(template, values)
            print(' [ OK ] Instance {0} created.'.format(instance_name))
        except:
            self.abort(' [ERROR] Couldn\'t copy the instance skeleton into '
                       'destination or populate the settings. Please check: '
                       'a) You have permission. '
                       'b) The directory doesn\'t exist already.')

    def create_db(self, instance_db_name):
        """
        Create the database for the designated instance.
        """
        createdb = subprocess.Popen(('su - postgres -c "createdb %s -w -O %s '
                                     '-E UTF8"') % (instance_db_name,
                                                    icc.DB_USER), shell=True)
        createdb.wait()  # Wait until it finishes
        try:
            psycopg2.connect(
                database=instance_db_name,
                user=icc.DB_USER,
                password=icc.DB_PASSWORD,
                host=icc.DB_HOST
            )
            print(' [ OK ] Database {0} created and connection '
                  'tested.'.format(instance_db_name))
        except:
            self.abort(' [ERROR] Couldn\'t connect to the PostgreSQL server '
                       '(authentication failed or server down). Aborting.')

    def syncdb_and_migrate(self, instance_name):
        """
        Do the syncdb and migrate actions for the selected intance. Please note
        that this action does not create the superuser, it just synchronizes
        and migrates the database.
        """
        working_dir = os.path.join(icc.DEFAULT_INSTANCE_DIR, instance_name)
        os.chdir(working_dir)
        syncdb = subprocess.Popen(('openmooc-askbot-admin syncdb --migrate '
                                   '--noinput'), shell=True)
        syncdb.wait()

    def collect_static(seld, instance_name):
        """
        Collect all the static files and prepare them to be used
        """
        working_dir = os.path.join(icc.DEFAULT_INSTANCE_DIR, instance_name)
        os.chdir(working_dir)
        collectstatic = subprocess.Popen(('openmooc-askbot-admin '
                                          'collectstatic --noinput'),
                                         shell=True)
        collectstatic.wait()

    def add_instance_to_supervisor(self, instance_name):
        """
        Creates the supervisor file into the directory
        """
        INSTANCE_DIR = os.path.join(icc.DEFAULT_INSTANCE_DIR, instance_name)
        try:
            template = os.path.join(INSTANCE_DIR, 'supervisor.conf')
            values = {
                'instance_name': instance_name,
                'instance_dir': INSTANCE_DIR
            }
            self._populate_file(template, values)
            os.symlink(template, os.path.join(
                '/etc', 'supervisord.d',
                'openmooc-askbot-%s.conf' % instance_name))
            print(' [ OK ] Populated the supervisor settings.')
        except:
            self.abort(' [ERROR] Couldn\'t populate the supervisor settings. '
                       'Exiting.')

    def add_instance_to_nginx(self, instance_name):
        """
        Creates the nginx file for the local askbot and also the nginx forward
        configuration for the proxy machine. Remember that some values of the
        forward file need to be changed manually!
        """
        INSTANCE_DIR = os.path.join(icc.DEFAULT_INSTANCE_DIR, instance_name)
        try:
            # Populate the nginx file
            template = os.path.join(INSTANCE_DIR, 'nginx.conf')
            values = {'instance_name': instance_name}
            self._populate_file(template, values)
            # Populate the nginx.forward file
            template = os.path.join(INSTANCE_DIR, 'nginx.forward.conf')
            values = {'instance_name': instance_name}
            self._populate_file(template, values)
            print(' [ OK ] Populated nginx and nginx.forward settings.')
        except:
            self.abort(' [ERROR] Couldn\'t populate the nginx or the '
                       'nginx.forward settings. Exiting.')

        # TODO
        #self._copy_to_remote(os.path.join(INSTANCE_DIR, 'nginx.forward.conf'))

    def restart_server(self):
        supervisord = subprocess.Popen(('service '
                                        'supervisord restart'), shell=True)
        supervisord.wait()
        nginx = subprocess.Popen(('service '
                                  'nginx restart'), shell=True)
        nginx.wait()
        time.sleep(5)

    def update_entries_metadata(self):
        """
        Update all entries' metadata
        """
        try:
            update_metadata = subprocess.Popen(('openmooc-askbot-admin '
                                                'update_entries_metadata'),
                                               shell=True)
            update_metadata.wait()  # Wait until it finishes

            url = ('https://idp.mooc.educalab.es/simplesaml/module.php/cron/'
                   'cron.php?key=%s&tag=metarefresh') % icc.META_REFRESH_KEY
            requests.get(url)
        except:
            self.abort(' [ERROR] Couldn\'t update the entries\' metadata. '
                       'Exiting.')

    def disable_instance(self, instance_name):
        """
        Disables an instance so it won't be available anymore.
        """
        INSTANCE_DIR = os.path.join(icc.DEFAULT_INSTANCE_DIR, instance_name)
        try:
            # Create a disabled instances folder if it doesn't exist already
            if not os.path.isdir(icc.DEFAULT_DISABLED_INSTANCES_DIR):
                os.makedirs(icc.DEFAULT_DISABLED_INSTANCES_DIR)
            # Get the instance dir, copy the data to the disabled folder and
            # delete the instance folder.
            shutil.copy(INSTANCE_DIR, icc.DEFAULT_DISABLED_INSTANCES_DIR)
            shutil.rmtree(INSTANCE_DIR)
            # FIXME it doesn't work

            # TODO disable the instance at supervisor and nginx levels too
            print(' [ OK ] Instance {0} disabled.'.format(instance_name))
        except:
            self.abort(' [ERROR] Couldn\'t disable the instance. Please check '
                       'the directories.')

    def destroy_instance(self, instance_name):
        """
        Destroys the database and contents of the instance completely
        """
        INSTANCE_DIR = os.path.join(icc.DEFAULT_INSTANCE_DIR, instance_name)
        # Ensure we can import the instance settings
        sys.path.insert(0, INSTANCE_DIR)
        try:
            import instance_settings
        except:
            self.abort(' [ERROR] Couldn\'t import the instance settings to '
                       'destroy it. Check that it exists. Aborting.')
        try:
            instance_db_name = instance_settings.DATABASE_NAME
            dropdb = subprocess.Popen('su - postgres -c "dropdb %s"' %
                                      instance_db_name, shell=True)
            dropdb.wait()
            shutil.rmtree(INSTANCE_DIR)
            os.remove(os.path.join('/etc', 'supervisord.d',
                                   'openmooc-askbot-%s.conf' % instance_name))
            print(' [ OK ] Instance {0} destroyed.'.format(instance_name))
        except:
            self.abort(' [ERROR] Couldn\'t drop database or remove instance '
                       'files. Aborting.')

    def abort(self, msg, status=1):
        sys.stderr.write(msg)
        sys.exit(status)


# Parsing section
parser = optparse.OptionParser(
    description=('This is OpenMOOC Askbot instance creator. This allows you '
                 'to easily create new instances for OpenMOOC Askbot without '
                 'any of the fuss of the terminal.'),
    version='%prog 0.1 alpha'
)
parser.add_option(
    '-c',
    '--create',
    help='<instance name> <instance database name>',
    dest='instance_data',
    action='store',
    nargs=2
)
parser.add_option(
    '-d',
    '--disable',
    help='Disables an instance (data is moved to /instances.disabled)',
    dest='disable_instance_name'
)
parser.add_option(
    '-k',
    '--destroy',
    help='Complete destroys an instance (erase everything)',
    dest='destroy_instance_name'
)
parser.add_option(
    '--no-metadata',
    help='Avoid updating the entries\' metadata',
    action='store_true',
    dest='no_metadata'
)

(opts, args) = parser.parse_args()

inst = AskbotInstance()

if opts.instance_data:
    INSTANCE_NAME = opts.instance_data[0]
    INSTANCE_DB_NAME = opts.instance_data[1]
    inst.create_instance(INSTANCE_NAME, INSTANCE_DB_NAME)
    inst.add_instance_to_supervisor(INSTANCE_NAME)
    inst.add_instance_to_nginx(INSTANCE_NAME)
    inst.create_db(INSTANCE_DB_NAME)
    inst.syncdb_and_migrate(INSTANCE_NAME)
    inst.collect_static(INSTANCE_NAME)
    inst.restart_server()
    if not opts.no_metadata:
        inst.update_entries_metadata()

elif opts.disable_instance_name:
    INSTANCE_NAME = opts.disable_instance_name
    inst.disable_instance(INSTANCE_NAME)

elif opts.destroy_instance_name:
    INSTANCE_NAME = opts.destroy_instance_name
    inst.destroy_instance(INSTANCE_NAME)
