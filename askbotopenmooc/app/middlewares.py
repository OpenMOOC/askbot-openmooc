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

from urlparse import urlparse

from django.conf import settings
from django.contrib.auth.views import redirect_to_login
from django.contrib.auth import logout
from django.core.urlresolvers import resolve
from django.http import HttpResponseRedirect
from django.utils.translation import ugettext as _

from askbot.conf import settings as askbot_settings
from askbot.shims.django_shims import ResolverMatch
from askbot.middleware.forum_mode import is_view_protected, is_view_allowed


class Saml2SSORedirect(object):
    """
    Redirect to idp if saml2 cookie is present
    to make sure that user is logged
    """

    def process_request(self, request):
        saml_cookie = getattr(settings, 'SAML2_COOKIE', 'saml2_logged')
        exclude_urls = [item[0] for item in
            settings.SAML_CONFIG['service']['sp']['endpoints']['single_logout_service']
        ]
        admin_url = '/%s/admin/' % settings.INSTANCE_NAME
        exclude_urls.append(request.build_absolute_uri(admin_url))
        exclude_urls.append(settings.LOGIN_URL)

        if 'HTTP_REFERER' in request.META:
            url_referer = urlparse(request.META['HTTP_REFERER'])
            for idp in settings.SAML_CONFIG['service']['sp']['idp'].keys():
                idp_url = urlparse(idp)
                if idp_url.hostname == url_referer.hostname:
                    return None

        if request.user.is_authenticated():
            if (not saml_cookie in request.COOKIES and
               not request.build_absolute_uri(request.path)) in exclude_urls:
                logout(request)
            return None

        if (saml_cookie in request.COOKIES and
           request.build_absolute_uri(request.path) not in exclude_urls):
            return redirect_to_login(request.path)


### Taken from askbot.middlewares.forum_mode

class ForumModeMiddleware(object):
    """protects forum views is the closed forum mode"""

    def process_request(self, request):
        """when askbot is in the closed mode
        it will let through only authenticated users.
        All others will be redirected to the login url.
        """

        if (getattr(settings, "INSTANCE_CLOSED", False)
                and request.user.is_anonymous()):
            script_name = request.META.get("SCRIPT_NAME", "")
            if request.path.startswith(script_name):
                internal_path = request.path[len(script_name):]
            else:
                internal_path = request.path
            resolver_match = ResolverMatch(resolve(internal_path))
            if is_view_allowed(resolver_match.func):
                return

            if is_view_protected(resolver_match.func):
                request.user.message_set.create(
                    _('Please log in to use %s') %
                    askbot_settings.APP_SHORT_NAME
                )
                return HttpResponseRedirect(settings.LOGIN_URL)
        return None
