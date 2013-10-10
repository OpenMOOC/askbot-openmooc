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
This is the settings file for the instance creation tool.
"""

# Define some variables.
BASE_URL = 'http://questions.example.com'
INSTANCE_NAME = ''
INSTANCE_DB_NAME = ''
REMOTE_HOST = 'localhost'  # If the instances are behind an askbot proxy, set this to the proxy
DB_HOST = REMOTE_HOST  # By default, DB_HOST is the same as REMOTE_HOST but you can change it.
DB_USER = 'YourDatabaseUser'
DB_PASSWORD = 'YourDatabasePassword'
META_REFRESH_KEY = 'YourIdPMetaRefreshKey'

# These are default settings that the user is not expected to modify. You must know
# what you are doing before modifying this.
DEFAULT_INSTANCE_DIR = '/etc/openmooc/askbot/instances'
DEFAULT_DISABLED_INSTANCES_DIR = '/etc/openmooc/askbot/instances.disabled'
SKEL_DIR = '/usr/lib/python2.6/site-packages/askbotopenmooc/skel_instances'
GUNICORN_START_PORT = 10000  # Default 10000
