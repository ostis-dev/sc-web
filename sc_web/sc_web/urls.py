# -*- coding: utf-8 -*-

from django.conf import settings as app_settings
from django.conf.urls import patterns, include
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    (r'^', include('nav.urls', namespace='nav')),
    (r'^api/', include('api.urls', namespace='api')),
    (r'^accounts/', include('accounts.urls', namespace='accounts')),
#    (r'^pacman/', include('pacman.urls', namespace='pacman')),
    (r'^repo/', include('repo.urls', namespace='repo')),

    (r'^admin/', include(admin.site.urls)),

    (r'^static/(?P<path>.*)$', 'django.views.static.serve', {
        'document_root': app_settings.STATIC_ROOT,
    }),
    (r'^media/(?P<path>.*)$', 'django.views.static.serve', {
        'document_root': app_settings.MEDIA_ROOT,
    }),
)
