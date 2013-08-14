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
import os
import shutil
import subprocess
import argparse
try:
    import psycopg2
except ImportError:
    sys.exit('\n ERROR: The module psycopg2 (Python PostgreSQL binding) is not installed or it isn\'t in the PATH\n')


# Define some variables.
INSTANCE_NAME = ''
INSTANCE_DB_NAME = ''
REMOTE_HOST = 255.255.255.255
DB_HOST = REMOTE_HOST  # By default, DB_HOST is the same as REMOTE_HOST but you can change it.
DB_USER = 'YourDatabaseUser'
DB_PASSWORD = 'YourDatabasePassword'
GUNICORN_START_PORT = 10000  # Default 10000
DEFAULT_INSTANCE_DIR = '/etc/openmooc/askbot/instances'
SKEL_DIR = '/usr/lib/python2.6/site-packages/askbotopenmooc/skel_instances'


class Instance():

    def __init__(self, instance_name, instance_db_name):

        """
        Shared stuff between all the methods.
        """
        # Detect if $USER=root
        if not os.environ['USER'] == 'root':
            sys.exit('\n ERROR: This script requires root access.\n')

    def create_instance(self, instance_name):

        """
        Create the main instance in the instances directory.
        """
        INSTANCE_DIR = DEFAULT_INSTANCE_DIR + instance_name
        try:
            shutil.copy(SKEL_DIR, INSTANCE_DIR)
        except:
            sys.exit('\n ERROR: Couldn\'t copy the instance skeleton into destination. Please check that you have permission and the directory exists.')

    def create_db(self, instance_db_name, db_user, db_password):

        """
        Create the database for the designated instance.
        """
        try:
            psycopg2.connect(user=db_user, password=db_password, port=5492, host=REMOTE_HOST)
        except:
            sys.exit('\n ERROR: Couldn\'t connect to the PostgreSQL server. Aborting\n')

    def syncdb_and_migrate(self, instance_name):

        """
        Do the syncdb and migrate actions for the selected intance.
        """

    def disable_instance(self, instance_name):

        """
        Disables an instance so it won't be available anymore.
        """


instance = Instance()

parser = argparse.ArgumentParser(description='openmooc-askbot instance creation script.')
subparser = parser.add_subparsers()
parser_make = subparser.add_parser('create', help='Create a new instance in /etc/openmooc/askbot/instances with the provided name.')

parser_make.set_defaults(func=lang.make)

parser_compile = subparser.add_parser('disable', help='Compile all the language catalogs for use.')
parser_compile.set_defaults(func=lang.compile)

parser_clean = subparser.add_parser('clean', help='Delete all the language catalogs. After this you will have to rebuild the catalogs and translate them.')
parser_clean.set_defaults(func=lang.clean)


args = parser.parse_args()
args.func()
