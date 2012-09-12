# Copyright 2012 Rooter Analysis S.L.
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

from django.conf import settings
from django.contrib.sites.models import get_current_site
from django.views import i18n


def set_language(request):
    response = i18n.set_language(request)
    if request.method == 'POST':

        if hasattr(settings, 'LANGUAGE_COOKIE_DOMAIN'):
            cookie_domain = settings.LANGUAGE_COOKIE_DOMAIN
        else:
            site = get_current_site(request)
            cookie_domain = site.domain

        lang_code = request.POST.get('language', None)
        if lang_code:
            response.set_cookie(settings.LANGUAGE_COOKIE_NAME,
                                lang_code,
                                domain=cookie_domain)
    return response
