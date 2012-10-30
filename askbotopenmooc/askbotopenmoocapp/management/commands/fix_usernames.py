
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from askbotopenmooc.askbotopenmoocapp.utils import generate_unique_username

class Command(BaseCommand):
    help = "Set username = 'first_name last_name'"

    def handle(self, *args, **options):
        for user in User.objects.all():
            realname = u"%s %s" % (user.first_name.strip(), user.last_name.strip())
            realname = realname.strip()
            realname = realname[:75]
            if realname and user.username != realname:
                realname = generate_unique_username(realname, 75)
                if user.username != realname:
                    print "%s -> %s" % (user.username, realname)
                    user.username = realname
                    user.save()
