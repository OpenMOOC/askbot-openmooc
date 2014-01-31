from django.conf.urls.defaults import patterns, include, handler404, handler500
from django.conf import settings

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    (r'%s' % settings.ASKBOT_URL, include('askbotopenmooc.urls')),
)
