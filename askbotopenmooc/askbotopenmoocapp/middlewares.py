from django.conf import settings
from django.contrib.auth.views import redirect_to_login


class Saml2SSORedirect(object):
    """ Redirect to idp if saml2 cookie is present
        to make sure that user is logged
    """

    def process_request(self, request):
        if request.user.is_authenticated():
            return None

        if (hasattr(settings, 'SAML2_COOKIE') and request.COOKIES and
            settings.SAML2_COOKIE in request.COOKIES and
            request.build_absolute_uri(request.path) != settings.LOGIN_URL):
            return redirect_to_login(request.path)

