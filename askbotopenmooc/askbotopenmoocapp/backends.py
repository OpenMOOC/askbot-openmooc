import logging

from djangosaml2.backends import Saml2Backend

logger = logging.getLogger('djangosaml2')

class CustomSaml2Backend(Saml2Backend):

    def update_user(self, user, attributes, attribute_mapping,
                    force_save=False):
        super(CustomSaml2Backend, self).update_user(user, attributes,
                                                    attribute_mapping,
                                                    force_save=False)

        realname = " ".join([user.first_name, user.last_name])
        if user.realname != realname:
            user.realname = realname
            if force_save:
                user.save()
