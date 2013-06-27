import logging

import requests

from djangosaml2.backends import Saml2Backend

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

logger = logging.getLogger("openmooc")


def backend_setting_verification():
    """ if not attribute is not set, then allow start,
           else check if access_value is present
    """
    if (getattr(settings, "SAML_AUTHORIZATION_ATTRIBUTE", True) and
            not getattr(settings, "SAML_AUTHORIZATION_EXPECTED_VALUE", False)):

        raise ImproperlyConfigured("Bad configuration for "
                                   "SAML_AUTHORIZATION_* properties")


def check_remote_attribute(attributes, attribute_name, expected_value):
    maillist = attributes.get("mail", [])
    if len(maillist) > 0:
        mail = maillist[0]
    else:
        return False

    # TODO, cert need to be verified, make it configurable for production
    # environments
    response = requests.get(settings.SAML_AUTHORIZATION_URL % mail,
                            verify=False)
    try:
        rjson = response.json()
    except:
        logger.debug("SAML_AUTORIZATION_URL response for %s is not json" % (
                     response.url))
        return False

    if expected_value in rjson.get(attribute_name, []):
        logger.debug("Permission Verified - list type, after attributes "
                     "request")
        return True
    else:
        logger.debug("Permission Denied - list type, after attributes request")
        return False


class Saml2RestrictedForumAccess(Saml2Backend):

    def is_authorized(self, attributes, attribute_mapping):
        attribute_name = getattr(settings, "SAML_AUTHORIZATION_ATTRIBUTE",
                                 None)
        expected_value = getattr(settings, "SAML_AUTHORIZATION_EXPECTED_VALUE",
                                 None)

        if not attribute_name:
            return True

        attribute_value = attributes.get(attribute_name, None)

        # expected_value not in attribute_value
        # expected_value != attribute_value
        # Then return PermissionDenied
        if (isinstance(attribute_value, list) and
                expected_value in attribute_value):
            logger.debug("Permission Verified - list type")
            return True

        elif (not isinstance(attribute_value, list) and
                attribute_value == expected_value):
            logger.debug("Permission Verified - value type")
            return True

        if getattr(settings, "SAML_AUTHORIZATION_URL", None):
            return check_remote_attribute(attributes, attribute_name,
                                          expected_value)
        return False
