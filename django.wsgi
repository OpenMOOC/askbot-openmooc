import os
import sys

current_directory = os.path.dirname(__file__)
module_name = os.path.basename(current_directory)

execfile(activate_this, dict(__file__=activate_this))

sys.path.append(current_directory)

os.environ['DJANGO_SETTINGS_MODULE'] = 'askbotopenmooc.app.settings'
import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()
