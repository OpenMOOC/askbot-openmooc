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

from os import path

COURSE_NAME = path.basename(path.dirname(__file__))
COURSE_DIR = path.dirname(__file__)
COURSE_URL = 'http://courses.example.com/course/%s/' % (COURSE_NAME)
COURSE_TITLE = COURSE_NAME.capitalize()
DATABASE_NAME = COURSE_NAME

# This course won't be open to non-registered users. Default: False
COURSE_CLOSED = False

# If the course doesn't use the default Askbot theme or the extra themes provided
# by OpenMOOC, uncomment this line and redirect to your skins directory
#ASKBOT_EXTRA_SKINS_DIR = '/path/to/your/skins/'

# By default, OpenMOOC-Askbot will load the 'openmooc_default' theme. If you need
# to use another theme set it here.
#ASKBOT_DEFAULT_SKIN = 'skinName'

# SAML2 related settings.
# SAML_AUTHORIZATION_EXPECTED_VALUE = COURSE_NAME
# SAML_AUTHORIZATION_ATTRIBUTE = "schacUserStatus"
# SAML_AUTHORIZATION_URL='https://idp.difundi.com/module.php/userregistrationApi/api.php/users/%s?apikey=k7dnfya8hs54sjfak8a5lmcha8dksh6smbtai'
