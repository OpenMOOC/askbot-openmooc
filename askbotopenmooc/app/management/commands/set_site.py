from django.core.management.base import BaseCommand, CommandError

from django.contrib.sites.models import Site
from django.conf import settings

class Command(BaseCommand):
    args = 'site_domain [site_name]'
    help = 'Set site domain (without http, only host), site_name is optional'

    def handle(self, *args, **options):
        if len(args) < 1:
            raise CommandError("site_domain is required")

        if len(args) > 2:
            raise CommandError("Please, quote by \" your site_name ")

        site_id = getattr(settings, "SITE_ID", 1)

        site_domain = args[0]
        site_name = args[-1]

        try:
            site = Site.objects.get(pk=site_id)
            site.domain = site_domain
            site.name = site_name
            site.save()
        except Site.DoesNotExist:
            raise CommandError('Site does not exists')

        self.stdout.write("Site was set to %s domain\n" % (site.domain))
