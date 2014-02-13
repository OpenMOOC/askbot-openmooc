# -*- coding: utf8 -*-
# Copyright 2013 Yaco Sistemas S.L.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


"""
This are the specific settings for the local environment. This provides an
extra configuration layer for all the common configuration parameters of the
courses, p.e. the database.

Configuration levels: openmooc-askbot, local_settings, instance_settings
"""

import askbotopenmooc
import instance_settings
import saml2
from os import path

DEBUG = False

# Set the base directories for everything. Usually you should create a new user
# and create the courses inside his home folder.
INSTANCES_BASEDIR = '/etc/openmooc/askbot/instances/'
SAML2DIR = '/etc/openmooc/askbot/saml2'
BASEDIR = path.dirname(__file__)
PROJECT_ROOT = path.dirname(__file__)
ASKBOTOPENMOOC_ROOT = path.dirname(askbotopenmooc.__file__)

if DEBUG:
    print "\n\nASKBOTOPENMOOC_ROOT: %s\nBASEDIR: %s\nSAML2DIR: %s\nINSTANCES_BASEDIR: %s\nPROJECT_ROOT: %s\n\n" % (ASKBOTOPENMOOC_ROOT, BASEDIR, SAML2DIR, INSTANCES_BASEDIR, PROJECT_ROOT)

# Skin settings, this has to be declared before media and static roots
ASKBOT_EXTRA_SKINS_DIR = ASKBOTOPENMOOC_ROOT + '/themes/'

# Static files directory. You should put here the directory where you want to
# keep the static files. Default: $HOME/static_root
MEDIA_ROOT = path.join(path.dirname(__file__), 'askbot', 'upfiles')
MEDIA_URL = '/upfiles/'

STATIC_ROOT = "/var/lib/openmooc/askbot/static"
STATIC_URL = '/m/'

if DEBUG:
    print '\n\nMEDIA_ROOT: %s\nSTATIC_ROOT: %s\n\n' % (MEDIA_ROOT, STATIC_ROOT)


LANGUAGE_CODE = 'en'

# Database settings. This settings are common for all the courses.
DATABASE_NAME_PREFIX = 'askbot_'
ASKBOT_DATABASE_USER = ''
ASKBOT_DATABASE_PASSWORD = ''
ASKBOT_DATABASE_ENGINE = 'django.db.backends.postgresql_psycopg2'

# Activate Twitter Bootstrap
BOOTSTRAP_MODE = True

# E-Mail configuration
#SERVER_EMAIL = 'smtp.example.com'
#DEFAULT_FROM_EMAIL = 'no-reply@questions.example.com'
#EMAIL_HOST_USER = ''
#EMAIL_HOST_PASSWORD = ''
#EMAIL_SUBJECT_PREFIX = ''
#EMAIL_HOST = 'smtp.example.com'
#EMAIL_PORT = ''
#EMAIL_USE_TLS = False

# Secret key for Askbot. Please make this private and secure!.
SECRET_KEY = 'askbot_#-d(!f1z878n@6luytxz8$az5e(b@ctqgnxalyqoj&moep@^^2_random'

# Askbot LiveSettings overrides. This section configures the Askbot LiveSettings
# to match the OpenMOOC platform needs. Please don't modify this unless you know
# what you're doing. You can find documentation about this section on:
# http://askbot.org/doc/live-settings.html
EXTRA_SETTINGS = {
    u'APP_COPYRIGHT': 'OpenMOOC',
    u'USE_LICENSE': 'False',
    u'FEEDBACK_SITE_URL': 'https://moocng.example.com/complaints/'
}

MOOCNG_URL = 'https://moocng.example.com/'

LANGUAGE_COOKIE_DOMAIN = '.example.com'

FOOTER_LINKS = (
    ('%slegal' % MOOCNG_URL, {
        'en': u'Legal',
        'es': u'Condiciones legales',
    }),
    ('%scopyright' % MOOCNG_URL, {
        'en': u'OpenMOOC Copyright 2013',
        'es': u'OpenMOOC Copyright 2013',
    }),
    ('%stos' % MOOCNG_URL, {
        'en': u'Terms of Use',
        'es': u'Términos de uso',
    }),
    ('%scontact' % MOOCNG_URL, {
        'en': u'Contact',
        'es': u'Contacto',
    }),
)

# Caching settings. OpenMOOC is configured by default to use memcached. Please
# don't edit this unless you know what you're doing.
CACHE_BACKEND = 'memcached://127.0.0.1:11211/'
CACHE_PREFIX = 'askbot'  # make this unique

# Base URLs. These are some basic URLs needed by openmooc-askbot to determine
# the redirects in Askbot.
ASKBOT_URL = '%s/' % instance_settings.INSTANCE_NAME
BASE_URL = 'http://questions.example.com/'
FULL_ASKBOT_URL = '%s%s' % (BASE_URL, ASKBOT_URL)

# EXTERNAL_KEYS = {u'USE_RECAPTCHA',
#                  u'RECAPTCHA_SECRET':u'6LeJCNYSAAAAAHTzqr4fPu_KsAS4hNXAzlymh8So',
#                  u'RECAPTCHA_KEY':u'asdfasdfasfuiquasui349248951dsi230113411'}

# SAML2 logger. This will log any strange activity within your IdP
LOGGING = {
    'version': 1,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'handlers': {
        'saml2file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': '/tmp/djangosaml2.log',
            'formatter': 'verbose',
        }
    },
    'loggers': {
        'djangosaml2': {
            'handlers': ['saml2file'],
            'level': 'DEBUG',
        }
    }
}

# SAML2/IdP settings. You must configure here your IdP settings
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

SAML_ATTRIBUTE_MAPPING = {
    'mail': ('email', ),
    'cn': ('first_name', ),
    'sn': ('last_name', ),
}

SAML_AUTHORIZATION_ATTRIBUTE = None
SAML_AUTHORIZATION_EXPECTED_VALUE = None

# Closed Forums configuration
#
# SAML_AUTHORIZATION_ATTRIBUTE = "shacUserStatus"
# SAML_AUTHORIZATION_ATTRIBUTE = "schacUserStatus"
# SAML_AUTHORIZATION_EXPECTED_VALUE = "course_name"
# SAML_AUTHORIZATION_URL = "https://idp.example.com/module.php/userregistrationApi/api.php/users/%s?apikey=123456789"
#
# Remember add this to every closed forums or to your skel course_settings
#
# COURSE_CLOSED = True
# SAML_AUTHORIZATION_EXPECTED_VALUE = COURSE_NAME

SAML_CONFIG = {
    # full path to the xmlsec1 binary programm
    'xmlsec_binary': '/usr/bin/xmlsec1',

    # your entity id, usually your subdomain plus the url to the metadata view
    'entityid': '%ssaml2/metadata/' % FULL_ASKBOT_URL,

    # directory with attribute mapping
    'attribute_map_dir': path.join(SAML2DIR, 'attribute-maps'),

    # this block states what services we provide
    'service': {
        # we are just a lonely SP
        'sp': {
            'name': 'Askbot - OpenMOOC SP',
            'endpoints': {
                # url and binding to the assetion consumer service view
                # do not change the binding or service name
                'assertion_consumer_service': [
                    ('%ssaml2/acs/' % FULL_ASKBOT_URL,
                    saml2.BINDING_HTTP_POST),
                ],
                # url and binding to the single logout service view
                # do not change the binding or service name
                'single_logout_service': [
                    ('%ssaml2/ls/' % FULL_ASKBOT_URL, saml2.BINDING_HTTP_REDIRECT),
                ],
            },
            # # This is commented to be compatible with simplesamlphp
            # # attributes that this project need to identify a user
            #'required_attributes': ['uid'],
            #
            # # attributes that may be useful to have but not required
            #'optional_attributes': ['eduPersonAffiliation'],

            # in this section the list of IdPs we talk to are defined
            'idp': {
                # we do not need a WAYF service since there is
                # only an IdP defined here. This IdP should be
                # present in our metadata

                # the keys of this dictionary are entity ids
                'https://idp.example.com/simplesaml/saml2/idp/metadata.php': {
                    'single_sign_on_service': {
                        saml2.BINDING_HTTP_REDIRECT: 'https://idp.example.com/simplesaml/saml2/idp/SSOService.php',
                    },
                    'single_logout_service': {
                        saml2.BINDING_HTTP_REDIRECT: 'https://idp.example.com/simplesaml/saml2/idp/SingleLogoutService.php',
                    },
                },
            },
        },
    },

    # where the remote metadata is stored
    'metadata': {
        'local': [path.join(SAML2DIR, 'remote_metadata.xml')],
    },

    # set to 1 to output debugging information
    'debug': 1,

    # certificate
    'key_file': path.join("%s%s" % (SAML2DIR, "/certs"), 'server.key'),  # private part
    'cert_file': path.join("%s%s" % (SAML2DIR, "/certs"), 'server.crt'),  # public part


    # own metadata settings
    'contact_person': [
        {
            'given_name': 'Sysadmin',
            'sur_name': '',
            'company': 'Example CO',
            'email_address': 'sysadmin@example.com',
            'contact_type': 'technical'
        },
        {
            'given_name': 'Admin',
            'sur_name': 'CEO',
            'company': 'Example CO',
            'email_address': 'admin@example.com',
            'contact_type': 'administrative'
        },
    ],
    # you can set multilanguage information here
    'organization': {
        'name': [('Example CO', 'es'), ('Example CO', 'en')],
        'display_name': [('Example', 'es'), ('Example', 'en')],
        'url': [('http://www.example.com', 'es'), ('http://www.example.com', 'en')],
    },
}
