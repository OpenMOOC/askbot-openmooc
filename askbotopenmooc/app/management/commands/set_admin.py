from django.core.management.base import BaseCommand, CommandError

from django.contrib.auth.models import User, Group

class Command(BaseCommand):
    args = 'user_email'
    help = 'Set a user as admin'

    def handle(self, *args, **options):
        for email in args:
            try:
                user = User.objects.get(email=email)
                user.is_staff = True
                user.is_superuser = True
                user.save()
            except User.DoesNotExist:
                raise CommandError('User does not exist')

            self.stdout.write("Set %s as admin\n" % (user.email))
