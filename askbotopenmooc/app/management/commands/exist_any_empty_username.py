from django.core.mail import send_mail
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from askbotopenmooc.app.utils import generate_unique_username
from django.conf import settings

class Command(BaseCommand):
    args = "<mailto1 mailto2 ...>"
    help = """Find empty username and set username = 'first_name last_name'"""

    def handle(self, *args, **options):
        users = User.objects.filter(username='')
        if not args:
            print "Args is required as target mail"
            return None
        else:
            mails = args

        if len(users) == 1:
            user = users[0]

            msg = ("""Forum Link: %(forum_link)s\r\n"""
                   """User with empty username has been detected.\r\n"""
                   """email: %(email)s\r\n"""
                   """id: %(id)s\r\n"""
                   """firt_name: %(first_name)s\r\n"""
                   """last_name: %(last_name)s\r\n""" % dict(email=user.email,
                                                           id=user.id,
                                                           first_name=user.first_name,
                                                           last_name=user.last_name,
                                                           forum_link=settings.FULL_ASKBOT_URL
                                                      )
                   )

            if hasattr(settings, "DEFAULT_FROM_EMAIL") and settings.DEFAULT_FROM_EMAIL:
                from_email = settings.DEFAULT_FROM_EMAIL
            else:
                from_email = "askboterror@openmooc.org"


            send_mail("""Username empty detected in a askbot forum""",
                      msg, from_email, mails)


            candidate = u"%s %s" % (user.first_name.strip(), user.last_name.strip())
            candidate = candidate.strip()
            candidate = candidate[:75]
            if candidate and user.username != candidate:
                candidate = generate_unique_username(candidate, 75)
                if user.username != candidate:
                    print "%s -> %s" % (user.username, candidate)
                    user.username = candidate
                    user.save()
