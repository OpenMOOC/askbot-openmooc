
import saml2
from os import path

BASEDIR = path.dirname(__file__)
SAML2DIR = path.join(BASEDIR, 'saml2')


#DATABASE_ENGINE = 'mysql' # only postgres (>8.3) and mysql are supported so far others have not been tested yet
#DATABASE_NAME = 'askbot'             # Or path to database file if using sqlite3.
#DATABASE_USER = 'askbot'             # Not used with sqlite3.
#DATABASE_PASSWORD = 'askbot'         # Not used with sqlite3.
#DATABASE_HOST = ''             # Set to empty string for localhost. Not used with sqlite3.
#DATABASE_PORT = ''             # Set to empty string for default. Not used with sqlite3.


#CACHE_BACKEND = 'memcached://127.0.0.1:11211/'
#CACHE_PREFIX = 'askbot' #make this unique

SECRET_KEY = 'sdljdfjkldsflsdjkhsjkldgjlsdgfs s '



SAML_CONFIG = {
  # full path to the xmlsec1 binary programm
  'xmlsec_binary': '/usr/bin/xmlsec1',

  # your entity id, usually your subdomain plus the url to the metadata view
  'entityid': 'http://questions.example.com/saml2/metadata/',

  # directory with attribute mapping
  'attribute_map_dir': path.join(SAML2DIR, 'attribute-maps'),

  # this block states what services we provide
  'service': {
      # we are just a lonely SP
      'sp' : {
          'name': 'Askbot - OpenMOOC SP',
          'endpoints': {
              # url and binding to the assetion consumer service view
              # do not change the binding or service name
              'assertion_consumer_service': [
                  ('http://questions.example.com/saml2/acs/',
                   saml2.BINDING_HTTP_POST),
                  ],
              # url and binding to the single logout service view
              # do not change the binding or service name
              'single_logout_service': [
                  ('http://questions.example.com/saml2/ls/',
                   saml2.BINDING_HTTP_REDIRECT),
                  ],
              },

           # attributes that this project need to identify a user
          'required_attributes': ['uid'],

           # attributes that may be useful to have but not required
          'optional_attributes': ['eduPersonAffiliation'],

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
  'key_file': path.join(SAML2DIR, 'certs/server.key'),  # private part
  'cert_file': path.join(SAML2DIR, 'certs/server.crt'),  # public part

  # own metadata settings
  'contact_person': [
      {'given_name': 'Sysadmin',
       'sur_name': '',
       'company': 'Example CO',
       'email_address': 'sysadmin@example.com',
       'contact_type': 'technical'},
      {'given_name': 'Admin',
       'sur_name': '',
       'company': 'Example CO',
       'email_address': 'admin@example.com',
       'contact_type': 'administrative'},
      ],
  # you can set multilanguage information here
  'organization': {
      'name': [('Example CO', 'es'), ('Example CO', 'en')],
      'display_name': [('Example', 'es'), ('Example', 'en')],
      'url': [('http://www.example.com', 'es'), ('http://www.example.com', 'en')],
      },
  'valid_for': 24,  # how long is our metadata valid
  }


