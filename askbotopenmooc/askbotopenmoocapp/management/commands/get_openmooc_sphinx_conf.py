"""the management command that outputs configuration
for sphinx search wich asktbo openmooc multiple instance system"""
from django.conf import settings
from django.core.management.base import BaseCommand
from django.template import Template, Context
from os import path, listdir

class Command(BaseCommand):

    requires_model_validation = False

    def handle(self, *args, **noargs):
        this_path = path.abspath(path.dirname(__file__))
        tpl_file_name = path.join(this_path, 'templates', 'sphinx.conf')
        tpl_file = open(tpl_file_name)
        tpl = Template(tpl_file.read())
        courses = [ course for course in listdir(settings.COURSES_BASEDIR)
                        if course != 'skel']
        context = Context({
            'db_user': settings.DATABASE_USER,
            'db_password': settings.DATABASE_PASSWORD,
            'db_host': settings.DATABASE_HOST,
            'db_prefix': settings.DATABASE_NAME_PREFIX,
            'db_sphinx_memory': settings.SPHINX_MEMORY,
            'courses': courses,
        })
        print tpl.render(context)
