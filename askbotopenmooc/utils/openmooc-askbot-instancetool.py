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
Creates a new course, along with the required database and the syncdb and migrations
"""

import sys

if sys.version_info < (2, 6, 0):
    print "\n WARNING: This script needs python 2.6. We don't guarantee it works on other python versions.\n"
elif sys.version_info >= (3, 0, 0):
    sys.exit('\n ERROR: This script doesn\'t work in python 3.x series. Exiting.')

import os
import shutil
import optparse
import subprocess
try:
    import instances_creator_conf as icc
except ImportError:
    sys.exit('\n ERROR: Couldn\'t import the default settings.\n')
try:
    import psycopg2
except ImportError:
    sys.exit('\n ERROR: The module psycopg2 (Python PostgreSQL binding) is not installed or it isn\'t in the PATH.\n')


os.environ['PGPASSWORD'] = icc.DB_PASSWORD


class AskbotInstance():

    def __init__(self):

        """
        Shared stuff between all the methods.
        """
        # Detect if $USER=root
        if not os.environ['USER'] == 'root':
            sys.exit('\n ERROR: This script requires root access.\n')

        # Include the default instances dir in the PATH
        sys.path.insert(0, icc.DEFAULT_INSTANCE_DIR)

    def create_instance(self, instance_name):

        """
        Create the main instance in the instances directory.
        """
        INSTANCE_DIR = os.path.join(icc.DEFAULT_INSTANCE_DIR, instance_name)
        try:
            shutil.copytree(icc.SKEL_DIR, INSTANCE_DIR)
        except:
            sys.exit('\n ERROR: Couldn\'t copy the instance skeleton into destination. Please check: a) You have permission b) The directory doesn\'t exist already.\n')

    def create_db(self, instance_db_name):

        """
        Create the database for the designated instance.
        """
        createdb = subprocess.Popen("sudo -u postgres createdb %s -w -O %s -E UTF8" % (instance_db_name, icc.DB_USER), shell=True)
        createdb.wait()
        try:
            conn = psycopg2.connect(database=instance_db_name, user=icc.DB_USER, password=icc.DB_PASSWORD)
        except:
            sys.exit('\n ERROR: Couldn\'t connect to the PostgreSQL server (authentication failed or server down). Aborting.\n')

        print "\n * Database created and connection test [OK]"

    def syncdb_and_migrate(self, instance_name):

        """
        Do the syncdb and migrate actions for the selected intance.
        """
        os.chdir(os.path.join(icc.DEFAULT_INSTANCE_DIR, instance_name))
        subprocess.Popen("openmooc-askbot-admin syncdb --migrate", shell=True)

    def add_instance_to_supervisor(self, instance_name):

        """
        Creates the supervisor file into the directory
        """

    def add_instance_to_nginx(self, instance_name):

        """
        Adds the new instance to the nginx forwarding routes
        """

    def disable_instance(self, instance_name):

        """
        Disables an instance so it won't be available anymore.
        """
        INSTANCE_DIR = os.path.join(icc.DEFAULT_INSTANCE_DIR, instance_name)

        # Create a disabled instances folder if it doesn't exist already
        if not os.path.isdir(icc.DEFAULT_DISABLED_INSTANCES_DIR):
            os.makedirs(icc.DEFAULT_DISABLED_INSTANCES_DIR)

        # Get the instance dir, copy the data to the disabled folder and delete
        # the instance folder.
        shutil.copy(INSTANCE_DIR, icc.DEFAULT_DISABLED_INSTANCES_DIR)
        shutil.rmtree(INSTANCE_DIR)

    def destroy_instance(self, instance_name):

        """
        Destroys the database and contents of the instance completel
        """
        # First, get the values for the course, name, db name, user and password
        # Try to connect to the db
        # Drop the DB
        # Disconnect and remove the instance dir
        INSTANCE_DIR = os.path.join(icc.DEFAULT_INSTANCE_DIR, instance_name)

        try:
            conn = psycopg2.connect(user=db_user, password=db_password, port=5492, host=icc.REMOTE_HOST)
        except:
            sys.exit('\n ERROR: Couldn\'t connect to the PostgreSQL server. Aborting.\n')

        cursor = conn.cursor()
        cursor.execute("DROP DATABASE %s" % instance_name)
        shutil.rmtree(INSTANCE_DIR)


# Parsing section
parser = optparse.OptionParser(description="This is OpenMOOC Askbot instance creator. This allows you to easily create new instances for OpenMOOC Askbot without any of the fuss of the terminal.",
                               version="%prog 0.1 alpha")
parser.add_option('-c', '--create', help='Create a new OpenMOOC Askbot instance. Takes the instance name and the instance database name as parameters (eg. -c fooinstance fooinstancedb)',
                                    dest='instance_data', action='store', nargs=2)
parser.add_option('-d', '--disable', help='Disables an instance (data is moved to /instances.disabled)', dest='disable_instance_name',
                                     action='store_true')
parser.add_option('-x', '--destroy', help='Complete destroys an instance (erase everything)',
                                     dest='destroy_instance_name', action='store_true')

(opts, args) = parser.parse_args()

inst = AskbotInstance()

if opts.instance_data:
    INSTANCE_NAME = opts.instance_data[0]
    INSTANCE_DB_NAME = opts.instance_data[1]
    inst.create_instance(INSTANCE_NAME)
    inst.create_db(INSTANCE_DB_NAME)
    inst.syncdb_and_migrate(INSTANCE_NAME)
    inst.add_instance_to_supervisor(INSTANCE_NAME)
    inst.add_instance_to_nginx(INSTANCE_NAME)

elif opts.disable_instance_name:
    INSTANCE_NAME = opts.disable_instance_name[0]
    inst.disable_instance(INSTANCE_NAME)

elif opts.destroy_instance_name:
    INSTANCE_NAME = opts.destroy_instance[0]
    inst.destroy_instance(INSTANCE_NAME)


print opts
print args
# if opts.instance_data:
#     for d in instance_data:


# if opts.instance_name()


# if __name__ == "__main__":
#     AskbotInstance()
