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
Instance-level settings for openmooc-askbot. You can set here any of the settings
related with the course and all of the askbot/django settings if necessary, but
we recommend you to keep this configuration file as tidy as possible.

All the settings that affect all the instances are applied in local_settings.py.
"""
from os import path

# DEBUG = False # You can set the DEBUG here if necessary

# Instance details section. You must edit this section according to your needs.
INSTANCE_NAME = '{instance_name}'
INSTANCE_DIR = path.dirname(__file__)
INSTANCE_URL = '{base_url}/{instance_name}/'
INSTANCE_TITLE = INSTANCE_NAME.capitalize()
DATABASE_NAME = '{instance_db_name}'
DATABASE_HOST = '{instance_db_host}'

# If the instance doesn't use the default Askbot theme or the extra themes provided
# by OpenMOOC, uncomment this line and redirect to your skins directory
# ASKBOT_EXTRA_SKINS_DIR = '/path/to/your/skins/'

# By default, OpenMOOC-Askbot will load the 'openmooc_default' theme. If you need
# to use another theme set it here.
# ASKBOT_DEFAULT_SKIN = 'skinName'

# This instance won't be open to non-registered users. Default: False
INSTANCE_CLOSED = False

# SAML2 related settings. This settings are related to the closed instance setting
# SAML_AUTHORIZATION_EXPECTED_VALUE = COURSE_NAME
# SAML_AUTHORIZATION_ATTRIBUTE = "schacUserStatus"
# SAML_AUTHORIZATION_URL='https://idp.difundi.com/module.php/userregistrationApi/api.php/users/%s?apikey=k7dnfya8hs54sjfak8a5lmcha8dksh6smbtai'
