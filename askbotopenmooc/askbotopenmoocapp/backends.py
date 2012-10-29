import logging

from djangosaml2.backends import Saml2Backend

logger = logging.getLogger('djangosaml2')

class CustomSaml2Backend(Saml2Backend):

    #def update_user(self, user, attributes, attribute_mapping,
    #                force_save=False):
    #    super(CustomSaml2Backend, self).update_user(user, attributes,
    #                                                attribute_mapping,
    #                                                force_save)
    #    logger.debug(unicode(user))
    #    realname = "%s %s" % (user.first_name, user.last_name)
    #    realname = realname[:70]
    #    if user.username != realname:
    #        user.username = realname
    #        if force_save:
    #            user.save()
    #    logger.debug(unicode(user))

    def authenticate(self, session_info=None, attribute_mapping=None,
                     create_unknown_user=True):
        result = super(CustomSaml2Backend, self).authenticate(session_info, attribute_mapping,
                                                              create_unknown_user)
        if result is None:
            return result
        else:
            if result.username != result.email:
                return None
            return result


    def update_user(self, user, attributes, attribute_mapping,
                    force_save=False):
        if user and user.username and user.username != user.email:
            return user
        else:
            return super(CustomSaml2Backend, self).update_user(user, attributes,
                                                               attribute_mapping,
                                                               force_save)
