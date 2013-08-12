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
import subprocess
import argparse


class Instance():

    def __init__(self, instance_name, instance_db_name):

        """
        Shared stuff between all the methods.
        """

    def create_instance(self, instance_name):

        """
        Create the main instance in the instances directory.
        """


    def create_db(self, instance_db_name):

        """
        Create the database for the designated instance.
        """

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
