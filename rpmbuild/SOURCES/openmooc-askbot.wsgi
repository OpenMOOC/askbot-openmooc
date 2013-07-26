import os
import sys

os.environ['DJANGO_SETTINGS_MODULE'] = 'askbotopenmooc.settings'


def application(environ, start_response):
    course_path = environ.get('COURSE_SLUG', None)
    sys.path.insert(os.path.join('/etc/openmooc/askbot/courses', course_path))
    sys.path.insert(0, '/etc/openmooc/askbot')

    from django.core.wsgi import get_wsgi_application
    django_app = get_wsgi_application()
    return django_app(environ, start_response)
