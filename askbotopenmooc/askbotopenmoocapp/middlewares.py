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
        if request.user.is_authenticated():
            if (not saml_cookie in request.COOKIES and
                settings.SAML_CONFIG['service']['sp']['endpoints']['single_logout_service'][0][0] !=
                request.build_absolute_uri(request.path)):
                logout(request)
            return None

        if 'HTTP_REFERER' in request.META:
            url_referer = urlparse(request.META['HTTP_REFERER'])
            for idp in settings.SAML_CONFIG['service']['sp']['idp'].keys():
                idp_url = urlparse(idp)
                if idp_url.hostname == url_referer.hostname:
                    return None

        if (saml_cookie in request.COOKIES and
            request.build_absolute_uri(request.path) != settings.LOGIN_URL):
            return redirect_to_login(request.path)

