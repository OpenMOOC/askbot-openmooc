
from django.contrib.auth.models import User

from djangosaml2.signals import pre_user_save

from askbotopenmooc.askbotopenmoocapp.utils import generate_unique_username


def change_username(user, candidate):
    if User.objects.filter(username=candidate).count() > 0:
        candidate = generate_unique_username(candidate, 75)
    user.username = candidate


def askbot_pre_user_save(sender, **kwargs):
    user = sender
    candidate = u"%s %s" % (user.first_name.strip(), user.last_name.strip())
    candidate = candidate.strip()
    candidate = candidate[:75]

    # if user is a new user
    if user.username is None:
        change_username(user, candidate)
        return True
    else:
        user_old = User.objects.get(id=user.id)
        # If user has changed his first_name or last_name
        if ((user_old.first_name != user.first_name) or
            (user_old.last_name != user.last_name)):

            change_username(user, candidate)
            return True


pre_user_save.connect(askbot_pre_user_save)
