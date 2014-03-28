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
Main URL configuration file for the askbot site
"""

from django.conf.urls.defaults import patterns, include, handler404, handler500, url
from django.conf import settings

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',

    (r'', include('askbot.urls')),

    (r'^admin/', include(admin.site.urls)),

    #(r'^cache/', include('keyedcache.urls')), - broken views disable for now

    (r'^settings/', include('askbot.deps.livesettings.urls')),

    (r'^followit/', include('followit.urls')),

    (r'^robots.txt$', include('robots.urls')),

    url( # TODO: replace with django.conf.urls.static ?
        r'^%s(?P<path>.*)$' % settings.MEDIA_URL[1:],
        'django.views.static.serve',
        {'document_root': settings.MEDIA_ROOT.replace('\\','/')},
    ),

    #saml2
    (r'^saml2/', include('djangosaml2.urls')),

    (r'^samltest/', 'djangosaml2.views.echo_attributes'),

    #Mooc App
    (r'^mooc/', include('askbotopenmooc.app.urls')),
    #(r'^i18n/', include('django.conf.urls.i18n')),

)

if 'rosetta' in settings.INSTALLED_APPS:
    urlpatterns += patterns('',
                    url(r'^rosetta/', include('rosetta.urls')),
                )
