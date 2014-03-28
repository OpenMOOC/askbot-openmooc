# -*- coding: utf-8 -*-
# Copyright 2012-2013 UNED
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
Askbot OpenMOOC specific settings
"""

from django.conf import settings

def openmooc_settings(request):
    """The context processor function"""
    copy_attrs = ('INSTANCE_URL',
                  'INSTANCE_TITLE',
                  'INSTANCE_NAME',
                  'FULL_ASKBOT_URL',
                  )

    custom_settings = {}
    for key in copy_attrs:
        custom_settings[key] = getattr(settings, key, '')

    if getattr(settings, 'FOOTER_LINKS', None):
        lang = getattr(request, 'LANGUAGE_CODE', settings.LANGUAGE_CODE)
        footer_links =  getattr(settings, 'FOOTER_LINKS')
        translated_footer = []
        for link, label in footer_links:
            translated_footer.append((link, label[lang]))

        custom_settings['FOOTER_LINKS'] = translated_footer

    return {
        'openmooc_settings': custom_settings,
    }
