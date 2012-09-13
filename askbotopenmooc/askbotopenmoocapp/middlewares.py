from urlparse import urlparse

from django.conf import settings
from django.contrib.auth.views import redirect_to_login
from django.contrib.auth import logout

class Saml2SSORedirect(object):
    """ Redirect to idp if saml2 cookie is present
        to make sure that user is logged
    """

    def process_request(self, request):
        saml_cookie = getattr(settings, 'SAML2_COOKIE', 'saml2_logged')
        exclude_urls = [ item[0] for item in
            settings.SAML_CONFIG['service']['sp']['endpoints']['single_logout_service']
        ]
        admin_url = '/%s/admin/' % settings.COURSE_NAME
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
