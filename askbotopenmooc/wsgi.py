import os
import sys

os.environ['DJANGO_SETTINGS_MODULE'] = 'askbotopenmooc.settings'

try:
    localsettings = os.environ['LOCAL_SETTINGS_PATH']
    sys.path.insert(0, localsettings)
except:
    sys.path.insert(0, '/etc/openmooc/askbot')

def application(environ, start_response):
    from django.core.wsgi import get_wsgi_application
    django_app = get_wsgi_application()
    return django_app(environ, start_response)
