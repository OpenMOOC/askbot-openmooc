from os import path
from urlparse import urljoin
import saml2


COURSE_NAME = path.basename(path.dirname(__file__))

BASEDIR = path.dirname(__file__)


DATABASE_NAME = ('askbot_%s' % COURSE_NAME)             # Or path to database file if using sqlite3.
# DATABASE_USER = 'askbot'             # Not used with sqlite3.
# DATABASE_PASSWORD = 'askbot'         # Not used with sqlite3.
# DATABASE_HOST = ''             # Set to empty string for localhost. Not used with sqlite3.
# DATABASE_PORT = ''             # Set to empty string for default. Not used with sqlite3.


# CACHE_BACKEND = 'memcached://127.0.0.1:11211/'
CACHE_PREFIX = ('askbot_%s' % COURSE_NAME) #make this unique

MEDIA_ROOT = path.join(path.dirname(__file__), 'upfiles')
MEDIA_URL = '%s/upfiles/' % COURSE_NAME

#ASKBOT_URL = ('%s/') % COURSE_NAME
ASKBOT_URL = ''
FULL_ASKBOT_URL = 'http://questions.example.com/%s/%s' % (COURSE_NAME, ASKBOT_URL)

LOGIN_URL = urljoin(FULL_ASKBOT_URL, 'saml2/login/')
LOGIN_REDIRECT_URL = FULL_ASKBOT_URL #aadjust, if needed
LOGOUT_URL = urljoin(FULL_ASKBOT_URL, 'saml2/logout/')
LOGOUT_REDIRECT_URL = LOGIN_REDIRECT_URL


from django.conf import settings
settings.SAML_CONFIG['entityid'] = urljoin(FULL_ASKBOT_URL, "saml2/metadata/")
settings.SAML_CONFIG['service']['sp']['endpoints']['assertion_consumer_service'] = (
                urljoin(FULL_ASKBOT_URL, 'saml2/acs/'),
                saml2.BINDING_HTTP_POST),


settings.SAML_CONFIG['service']['sp']['endpoints']['single_logout_service'] = (
                urljoin(FULL_ASKBOT_URL, 'saml2/ls/'),
                saml2.BINDING_HTTP_REDIRECT),

SAML_CONFIG_COURSE = settings.SAML_CONFIG

COURSE_URL = 'http://courses.example.com/%s/' % (COURSE_NAME)
COURSE_TITLE = COURSE_TITLE.capitalize()
