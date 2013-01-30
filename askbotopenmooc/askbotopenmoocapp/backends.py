from djangosaml2.backends import Saml2Backend

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


def backend_setting_verification():
    """ if not attribute is not set, then allow start,
           else check if access_value is present
    """
    if (getattr(settings, "SAML_AUTHORIZATION_ATTRIBUTE", True) and
            not getattr(settings, "SAML_AUTHORIZATION_EXPECTED_VALUE", False)):

        raise ImproperlyConfigured("Bad configuration for "
                                   "SAML_AUTHORIZATION_* properties")


class Saml2RestrictedForumAccess(Saml2Backend):

    def is_authorized(self, attributes, attribute_mapping):
        attribute_name = getattr(settings, "SAML_AUTHORIZATION_ATTRIBUTE", None)
        expected_value = getattr(settings, "SAML_AUTHORIZATION_EXPECTED_VALUE", None)

        if not attribute_name:
            return True

        attribute_value = attributes.get(attribute_name, None)

        # expected_value not in attribute_value
        # expected_value != attribute_value
        # Then raise PermissionDenied
        if ((type(attribute_value) is list and
             not expected_value in attribute_value) or
            (type(attribute_value) is not list and
             attribute_value != expected_value)):
            return False

        return True
