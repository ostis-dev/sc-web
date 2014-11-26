# -*- coding: utf-8 -*-

from django.conf.urls import patterns, url


urlpatterns = patterns('api.views',
    url(r'^init/$', 'init', name='init'),
    url(r'^cmd/do/$', 'cmd_do', name='do_command'),
    
    url(r'^languages/$', 'get_languages', name="get_languages"),
    url(r'^languages/set/$', 'set_language', name="set_language"),
    
    url(r'^idtf/resolve/$', 'idtf_resolve', name='get_identifier'),
    url(r'^idtf/find/$', 'idtf_find', name='dinf_identifier'),
    
    url(r'^question/answer/translate/$', 'question_answer_translate', name='question_answer_translate'),

    url(r'^link/format/$', 'link_format', name='link_format'),
    url(r'^link/content/$', 'link_content', name='link_content'),
    
    url(r'^addr/resolve/$', 'sc_addrs', name='sc_addrs'),
    url(r'^info/tooltip/$', 'info_tooltip', name='info_tooltip'),
        
)
