"""Askbot OpenMOOC specific settings
"""
from django.conf import settings

def openmooc_settings(request):
    """The context processor function"""
    copy_attrs = ('COURSE_URL',
                  'COURSE_TITLE',
                  'COURSE_NAME',
                  )

    custom_settings = {}
    for key in copy_attrs:
        custom_settings[key] = getattr(settings, key, '')

    if getattr(settings, 'FOOTER_LINKS', None):
        lang = getattr(request, 'LANGUAGE_CODE', settings.LANGUAGE_CODE)
        footer_links =  getattr(settings, 'FOOTER_LINKS')
        translated_footer = []
        for link, label in footer_links:
            translated_footer.append((link, label[lang]))

        custom_settings['FOOTER_LINKS'] = translated_footer

    return {
        'openmooc_settings': custom_settings,
    }
