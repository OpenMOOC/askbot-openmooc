from djangosaml2.signals import pre_user_save
from askbotopenmooc.askbotopenmoocapp.utils import generate_unique_username


def askbot_pre_user_save(sender, **kwargs):
    user = sender
    realname = u"%s %s" % (user.first_name.strip(), user.last_name.strip())
    realname = realname.strip()
    realname = realname[:75]
    if realname and user.username != realname:
        if user.username and user.username.startswith(realname):
            # User already has a unique username
            return False
        realname = generate_unique_username(realname, 75)
        if user.username != realname:
            user.username = realname
            return True


pre_user_save.connect(askbot_pre_user_save)
