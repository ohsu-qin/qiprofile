from django.conf.urls import patterns, include, url
from django.contrib import admin
admin.autodiscover()
from django.conf.urls import patterns, include, url
from django.views.generic import ListView, DetailView
from . import views
from .views import SubjectList
from .routers import router

sess_patterns = patterns('',
    url(r'^/?$', views.session, name='view'),
)

sbj_patterns = patterns('',
    url(r'^/?$', views.subject, name='index'),
    url(r'^/session/(?P<session_number>\d+)',
        include(sess_patterns, namespace='session')),
)

app_patterns = patterns('',
    url(r'^/?$', SubjectList.as_view(), name='home'),
    url(r'^/(?P<collection_name>\w+)/(?P<subject_number>\d+)',
        include(sbj_patterns, namespace='subject')),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
    url(r'^/help/?$', views.help, name='help'),
)

urlpatterns = patterns('',
    # The qiprofile URLs.
    url(r'^qiprofile', include(app_patterns, namespace='qiprofile')),
    # The test URLs.
    url(r'^test/', include('django_jasmine.urls', namespace='test')),
    # Default django auth views with custom templates.
    url(r'^login/$', 'django.contrib.auth.views.login', {'template_name': 'login.html'}),
    url(r'^logout/$', 'django.contrib.auth.views.logout', {'template_name': 'logout.html'}),
    # Uncomment the admin/doc line below to enable admin documentation.
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    # Uncomment the admin line below to enable the admin page.
    # url(r'^admin/', include(admin.site.urls)),)
)
