import os
import sys


os.environ['DJANGO_SETTINGS_MODULE'] = 'askbotopenmooc.settings'


def application(environ, start_response):
        sys.path.insert("/etc/openmooc/askbot")

        course_path = environ.get('COURSE_SLUG', None)
        sys.path.insert(course_path)

        from django.core.wsgi import get_wsgi_application
        django_app = get_wsgi_application()
        return django_app(environ, start_response)
