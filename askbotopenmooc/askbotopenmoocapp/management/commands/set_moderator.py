from django.core.management.base import BaseCommand, CommandError

from django.contrib.auth.models import User, Group

class Command(BaseCommand):
    args = 'user_email'
    help = 'Set a user as moderator'

    def handle(self, *args, **options):
        moderator_group = Group.objects.get(name='askbot_moderators')
        for email in args:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                raise CommandError('User does not exist')
            user.groups.add(moderator_group)
            user.save()
            self.stdout.write("Set %s (%s) as moderator\n" % (user.username, user.email))




