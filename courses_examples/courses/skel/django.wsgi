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

import os
import sys

current_directory = os.path.dirname(__file__)
module_name = os.path.basename(current_directory)

execfile(activate_this, dict(__file__=activate_this))

sys.path.append(current_directory)

os.environ['DJANGO_SETTINGS_MODULE'] = 'askbotopenmooc.settings'
import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()
