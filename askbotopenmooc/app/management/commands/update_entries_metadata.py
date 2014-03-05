from os import listdir
from os import path
from urllib2 import urlopen
from urlparse import urljoin

from django.conf import settings
from django.core.management.base import BaseCommand


HEADER = """<?xml version='1.0' encoding='UTF-8'?>
<md:EntitiesDescriptor
    xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
    Name="askbootSPs">
"""

FOOTER = """
</md:EntitiesDescriptor>
"""


class Command(BaseCommand):
    help = 'Update saml20 entities metadata'
    requires_model_validation = False

    def handle(self, *args, **options):

        course_basedir = settings.INSTANCES_BASEDIR
        metadatafile = open(path.join(settings.STATIC_ROOT, 'group-metadata.xml'), 'w')
        metadatafile.write(HEADER)
        for course in listdir(course_basedir):
            if course == 'skel':
                continue
            url = urljoin(settings.BASE_URL, '/%s/saml2/metadata/' % course)
            self.stdout.write("Fetching %s\n" % url)
            metadata_request = urlopen(url)
            metadatacontent = metadata_request.read()
            metadatacontent = metadatacontent.replace(
                "<?xml version='1.0' encoding='UTF-8'?>", "")
            metadatafile.write(metadatacontent)
        metadatafile.write(FOOTER)
        metadatafile.close()
