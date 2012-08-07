"""Askbot OpenMOOC specific settings
"""
import sys
from django.conf import settings

def openmooc_settings(request):
    """The context processor function"""
    copy_attrs = ('COURSE_URL',
                  'COURSE_TITLE',
                  'COURSE_NAME',
                  )

    for key in copy_attrs:
        openmooc_settings[key] = getattr(settings, key, '')

    return {
        'openmooc_settings': openmooc_settings,
    }
